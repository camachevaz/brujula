<#
  Brújula — administración del repositorio (portable)
  Sincroniza esta carpeta con un repositorio de GitHub usando git + GitHub CLI.

  Uso (desde repo.bat, en la raíz de la app):
    repo.bat                 menú
    repo.bat estado          estado de la carpeta contra GitHub
    repo.bat traer           baja los cambios de GitHub
    repo.bat subir "texto"   sube los cambios detectados con ese mensaje
    repo.bat rama            cambiar o crear rama
    repo.bat etiqueta        marcar una versión (tag)
    repo.bat publicar        llevar la rama actual (p. ej. v3) a main y publicarla
    repo.bat sesion          ver o cambiar la cuenta de GitHub
    repo.bat conectar        conectar la carpeta a otro repositorio

  Compatible con Windows PowerShell 5.1 y PowerShell 7.
#>
param(
  [string]$Action = '',
  [string]$Message = '',
  [string]$Root = '',
  [string]$RemoteUrl = '',   # solo para pruebas: usa esta URL en lugar de GitHub
  [switch]$NoGh              # solo para pruebas: no usar GitHub CLI
)

$ErrorActionPreference = 'Stop'
try { [Console]::OutputEncoding = [Text.Encoding]::UTF8 } catch { }

if (-not $Root) { $Root = Split-Path -Parent $PSScriptRoot }
$Root = (Resolve-Path -LiteralPath $Root).Path
$ConfigPath = Join-Path (Join-Path $Root '.git') 'brujula-sync.json'
$PagesBranch = 'main'

# ---------------------------------------------------------------- utilidades
function Say([string]$t, [string]$c = 'Gray') { Write-Host $t -ForegroundColor $c }
function Ok([string]$t) { Write-Host "  √ $t" -ForegroundColor Green }
function Warn([string]$t) { Write-Host "  ! $t" -ForegroundColor Yellow }
function Fail([string]$t) { Write-Host "  x $t" -ForegroundColor Red }
function Title([string]$t) { Write-Host ''; Write-Host "== $t ==" -ForegroundColor Cyan }
function Ask([string]$q, [string]$def = '') {
  $p = if ($def) { "$q [$def]" } else { $q }
  $a = Read-Host $p
  if ([string]::IsNullOrWhiteSpace($a)) { return $def } else { return $a.Trim() }
}
function AskYes([string]$q, [bool]$defYes = $true) {
  $d = if ($defYes) { 'S/n' } else { 's/N' }
  $a = Read-Host "$q ($d)"
  if ([string]::IsNullOrWhiteSpace($a)) { return $defYes }
  return $a.Trim().ToLower().StartsWith('s')
}

# Ejecuta git en la carpeta de la app. Devuelve la salida; $LASTEXITCODE queda disponible.
# Convierte la salida de git (stdout y stderr) en texto limpio
function CleanOut($x) {
  $t = if ($x -is [System.Management.Automation.ErrorRecord]) { $x.Exception.Message } else { "$x" }
  if ($t -eq 'System.Management.Automation.RemoteException') { $t = '' }
  return ($t -replace "\x1b\[[0-9;]*[A-Za-z]", '').TrimEnd()
}
# Las llamadas cuya salida se lee se ejecutan con archivos temporales (no con tuberías):
# en Windows PowerShell 5.1 una tubería puede quedarse esperando para siempre.
# Además no pueden hacer preguntas (no se verían) y tienen un tiempo máximo.
function Quote-Arg([string]$a) {
  if ($a -eq '') { return '""' }
  if ($a -notmatch '[\s"]') { return $a }
  return '"' + ($a -replace '(\\*)"', '$1$1\"' -replace '(\\+)$', '$1$1') + '"'
}
$script:LastErr = ''
function Run-Captured([string]$exe, [string[]]$argv, [int]$timeoutSec = 60) {
  $cmd = (Get-Command $exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1)
  if (-not $cmd) { $script:LastErr = "No encontré $exe."; $global:LASTEXITCODE = 127; return @() }
  $psi = New-Object System.Diagnostics.ProcessStartInfo
  $psi.FileName = $cmd.Source
  $psi.Arguments = (@($argv) | ForEach-Object { Quote-Arg $_ }) -join ' '
  $psi.UseShellExecute = $false; $psi.CreateNoWindow = $true
  $psi.RedirectStandardOutput = $true; $psi.RedirectStandardError = $true; $psi.RedirectStandardInput = $true
  $psi.StandardOutputEncoding = [Text.Encoding]::UTF8; $psi.StandardErrorEncoding = [Text.Encoding]::UTF8
  foreach ($kv in @{ GIT_TERMINAL_PROMPT = '0'; GCM_INTERACTIVE = 'never'; GH_PROMPT_DISABLED = '1'; GH_NO_UPDATE_NOTIFIER = '1'; NO_COLOR = '1' }.GetEnumerator()) { $psi.EnvironmentVariables[$kv.Key] = $kv.Value }
  $p = [System.Diagnostics.Process]::Start($psi)
  try { $p.StandardInput.Close() } catch { }   # sin entrada: nada puede quedarse esperando una respuesta
  $so = $p.StandardOutput.ReadToEndAsync(); $se = $p.StandardError.ReadToEndAsync()
  if (-not $p.WaitForExit($timeoutSec * 1000)) {
    try { $p.Kill() } catch { }
    $script:LastErr = "«$exe $($argv -join ' ')» no respondió en $timeoutSec s."
    $global:LASTEXITCODE = 124
    return @()
  }
  [void]$so.Wait(5000); [void]$se.Wait(5000)   # no esperar de más a procesos hijos que dejen la salida abierta
  $global:LASTEXITCODE = $p.ExitCode
  $out = if ($so.IsCompleted) { $so.Result } else { '' }
  $script:LastErr = if ($se.IsCompleted) { (CleanOut $se.Result) } else { '' }
  if (-not $out) { return @() }
  return @((($out -replace "`r", '').TrimEnd("`n")) -split "`n" | ForEach-Object { CleanOut $_ })
}
function G { return (Run-Captured 'git' (@('-C', $Root) + @($args | ForEach-Object { "$_" })) 120) }
function GOk { G @args | Out-Null; return ($LASTEXITCODE -eq 0) }
# Muestra la salida de git directo en pantalla (sin capturarla), así también se ven sus preguntas
function GShow {
  $old = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
  & git -C $Root @args
  $code = $LASTEXITCODE; $ErrorActionPreference = $old
  return ($code -eq 0)
}
function Gh { return (Run-Captured 'gh' @($args | ForEach-Object { "$_" }) 60) }
# Comandos que hacen preguntas: en su propia ventana de consola, para que se vean y se puedan contestar
function Run-Window([string]$exe, [string]$argStr) {
  $cmd = (Get-Command $exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1)
  if (-not $cmd) { Fail "No encontré $exe."; return $false }
  try {
    $p = Start-Process -FilePath $cmd.Source -ArgumentList $argStr -Wait -PassThru
    return ($p.ExitCode -eq 0)
  } catch { Fail "No se pudo abrir la ventana: $($_.Exception.Message)"; Say "  Escribe en una terminal:  $exe $argStr"; return $false }
}

function Refresh-Path {
  $m = [Environment]::GetEnvironmentVariable('Path', 'Machine'); $u = [Environment]::GetEnvironmentVariable('Path', 'User')
  if ($m -or $u) { $env:Path = "$m;$u" }
}
function Ensure-Tool([string]$cmd, [string]$wingetId, [string]$name) {
  if (Get-Command $cmd -ErrorAction SilentlyContinue) { return $true }
  Warn "$name no está instalado."
  if (Get-Command winget -ErrorAction SilentlyContinue) {
    if (AskYes "¿Instalarlo ahora con winget?") {
      & winget install --id $wingetId -e --source winget --accept-source-agreements --accept-package-agreements
      Refresh-Path
      if (Get-Command $cmd -ErrorAction SilentlyContinue) { Ok "$name instalado."; return $true }
      Warn 'Cierra esta ventana y vuelve a abrir repo.bat para que Windows reconozca la instalación.'
      return $false
    }
  }
  Say "  Descárgalo de: $(if ($cmd -eq 'git') { 'https://git-scm.com/download/win' } else { 'https://cli.github.com' })"
  return $false
}

# ---------------------------------------------------------------- configuración
function Load-Config {
  if (Test-Path -LiteralPath $ConfigPath) { try { return Get-Content -LiteralPath $ConfigPath -Raw | ConvertFrom-Json } catch { } }
  return $null
}
function Save-Config($cfg) { $cfg | ConvertTo-Json | Set-Content -LiteralPath $ConfigPath -Encoding UTF8 }
function RemoteFor([string]$repo) { if ($RemoteUrl) { return $RemoteUrl } return "https://github.com/$repo.git" }
function Current-Branch { $b = (G rev-parse --abbrev-ref HEAD | Select-Object -First 1); if ($LASTEXITCODE -ne 0) { return '' } return $b }

# ---------------------------------------------------------------- autenticación
function Ensure-Auth {
  if ($NoGh) { return $true }
  Say '  Revisando la sesión de GitHub…'
  Gh auth status -h github.com | Out-Null
  if ($LASTEXITCODE -eq 124) { Fail $script:LastErr; Say '  Revisa tu conexión a internet y vuelve a abrir repo.bat.'; return $false }
  if ($LASTEXITCODE -ne 0) {
    Title 'Iniciar sesión en GitHub'
    Say '  Se abre otra ventana de GitHub CLI: Enter para aceptar, copia el código de 8 letras, Enter para abrir el navegador y pega el código.'
    if (-not (Run-Window 'gh' 'auth login -h github.com -p https -w')) { Fail 'No se completó el inicio de sesión.'; return $false }
  }
  Gh auth setup-git -h github.com | Out-Null   # git usará las credenciales de gh
  $login = (Gh api user --jq .login | Select-Object -First 1)
  if ($LASTEXITCODE -eq 0 -and $login) { Ok "Sesión de GitHub: $login" ; $script:GhLogin = $login }
  return $true
}
function Active-Login {
  if ($NoGh) { return '' }
  $l = (Gh api user --jq .login | Select-Object -First 1)
  if ($LASTEXITCODE -eq 0 -and $l) { return $l } else { return '' }
}
# Autor de los cambios en ESTA carpeta (config local). Si viene de una cuenta de GitHub
# (correo privado …@users.noreply.github.com), se mantiene igual a la cuenta activa.
function Ensure-Identity([switch]$Interactive, [switch]$Quiet) {
  $n = (G config --local user.name | Select-Object -First 1); $e = (G config --local user.email | Select-Object -First 1)
  if (-not $NoGh -and $script:GhLogin) {
    if ($n -eq $script:GhLogin -and $e -like "*+$($script:GhLogin)@users.noreply.github.com") { return }
    $fromGh = (-not $e) -or ($e -like '*@users.noreply.github.com')
    if (-not $fromGh) {
      # La persona puso su propio nombre y correo: no se cambia sin preguntar
      if (-not $Interactive) { return }
      Say "  Autor configurado en esta carpeta: $n <$e>"
      if (-not (AskYes "  ¿Usar la cuenta $($script:GhLogin) como autor de los cambios?" $false)) { return }
    }
    $id = (Gh api user --jq .id | Select-Object -First 1)
    if (-not $id) { Warn 'No pude leer los datos de la cuenta de GitHub.'; return }
    G config --local user.name $script:GhLogin | Out-Null
    G config --local user.email "$id+$($script:GhLogin)@users.noreply.github.com" | Out-Null
    if ($n -and $n -ne $script:GhLogin) { Ok "Autor de los cambios: $($script:GhLogin) (antes: $n)" }
    elseif (-not $Quiet) { Ok "Autor de los cambios: $($script:GhLogin) (correo privado de GitHub)" }
    return
  }
  if (-not (G config user.name | Select-Object -First 1)) { G config --local user.name (Ask 'Tu nombre para los cambios') | Out-Null }
  if (-not (G config user.email | Select-Object -First 1)) { G config --local user.email (Ask 'Tu correo para los cambios') | Out-Null }
}

# ---------------------------------------------------------------- conectar la carpeta
function Pick-Repo {
  while ($true) {
    $sug = ''
    if (-not $NoGh) {
      if ($script:GhLogin) { Say "  Cuenta de GitHub: $($script:GhLogin)" 'White' }
      $list = @(Gh repo list --limit 50 --json nameWithOwner --jq '.[].nameWithOwner')
      if ($LASTEXITCODE -eq 0 -and $list.Count -gt 0) {
        Say '  Tus repositorios:'
        for ($i = 0; $i -lt $list.Count; $i++) { Say ("   {0,2}. {1}" -f ($i + 1), $list[$i]) }
        $match = $list | Where-Object { $_ -match '/brujula$' } | Select-Object -First 1
        if ($match) { $sug = $match }
      }
      Say '  Si el repositorio es de otra cuenta, escribe C para cambiar de cuenta.'
      Say '  Si es de una organización, escribe su nombre completo (dueño/repo).'
      $a = Ask '  Número, nombre (dueño/repo) o C' $sug
      if ($a -match '^[cC]$') { Change-Account; continue }
      if ($a -match '^\d+$' -and $list.Count -and [int]$a -ge 1 -and [int]$a -le $list.Count) { return $list[[int]$a - 1] }
      return $a
    }
    return (Ask '  Repositorio (dueño/repo)' $sug)
  }
}
function Connect-Folder([switch]$Force) {
  $isRepo = Test-Path -LiteralPath (Join-Path $Root '.git')
  $cfg = Load-Config
  if ($isRepo -and $cfg -and -not $Force) { return $cfg }

  Title 'Conectar esta carpeta con GitHub'
  Say "  Carpeta: $Root"
  $repo = if ($RemoteUrl) { 'local/prueba' } else { Pick-Repo }
  if (-not $repo) { Fail 'Falta el repositorio.'; return $null }
  $url = RemoteFor $repo

  if (-not $isRepo) { G init | Out-Null; Ok 'Se creó el control de versiones en la carpeta.' }
  if (GOk remote get-url origin) { G remote set-url origin $url | Out-Null } else { G remote add origin $url | Out-Null }
  Say '  Revisando el repositorio en GitHub…'
  if (-not (GShow fetch origin --prune --tags)) { Fail 'No se pudo leer el repositorio. ¿El nombre es correcto y tienes acceso?'; return $null }

  $remoteBranches = @(G for-each-ref --format='%(refname:short)' refs/remotes/origin | Where-Object { $_ -ne 'origin/HEAD' -and $_ -ne 'origin' } | ForEach-Object { $_ -replace '^origin/', '' })
  if ($remoteBranches.Count) { Say ('  Ramas en GitHub: ' + ($remoteBranches -join ', ')) }
  Say "  «$PagesBranch» es la que publica GitHub Pages. Para probar versiones nuevas sin tocar lo publicado, usa otra rama (por ejemplo v3)."
  $def = if (Current-Branch) { Current-Branch } else { $PagesBranch }
  if ($def -eq 'HEAD' -or -not $def) { $def = $PagesBranch }
  $branch = Ask '  ¿En qué rama trabajará esta carpeta?' $def

  $hasHead = GOk rev-parse --verify -q HEAD
  if (-not $hasHead) {
    # Carpeta recién conectada: adopta la historia de GitHub sin tocar tus archivos.
    $base = if ($remoteBranches -contains $branch) { $branch } elseif ($remoteBranches -contains $PagesBranch) { $PagesBranch } elseif ($remoteBranches.Count) { $remoteBranches[0] } else { '' }
    G symbolic-ref HEAD "refs/heads/$branch" | Out-Null
    if ($base) {
      G reset --mixed -q "origin/$base" | Out-Null
      if ($base -eq $branch) { G branch --set-upstream-to "origin/$branch" | Out-Null }
      Ok ("Rama «$branch» " + $(if ($base -eq $branch) { 'conectada con GitHub.' } else { "creada a partir de «$base» (se subirá la primera vez que subas cambios)." }))
    } else { Ok "Rama «$branch» nueva (el repositorio está vacío)." }
    Say '  Tus archivos no se movieron. Lo que sea distinto a GitHub aparecerá como cambio por subir.'
  } elseif ((Current-Branch) -ne $branch) {
    Switch-Branch $branch
  }
  $cfg = [pscustomobject]@{ repo = $repo; branch = $branch; connected = (Get-Date).ToString('s') }
  Save-Config $cfg
  return $cfg
}

# ---------------------------------------------------------------- acciones
function Upstream-Counts {
  $u = (G rev-parse --abbrev-ref --symbolic-full-name '@{u}' | Select-Object -First 1)
  if ($LASTEXITCODE -ne 0) { return $null }
  $c = (G rev-list --left-right --count 'HEAD...@{u}' | Select-Object -First 1)
  if ($LASTEXITCODE -ne 0 -or -not $c) { return $null }
  $p = $c -split '\s+'; return @{ ahead = [int]$p[0]; behind = [int]$p[1]; up = $u }
}
function Show-Changes {
  $lines = @(G status --porcelain -uall)
  if (-not $lines.Count) { return 0 }
  $map = @{ 'M' = 'modificado'; 'A' = 'nuevo'; 'D' = 'borrado'; 'R' = 'renombrado'; '?' = 'nuevo' }
  $n = 0
  foreach ($l in $lines) {
    if (-not $l) { continue }
    $code = $l.Substring(0, 2).Trim(); $f = $l.Substring(3)
    $k = if ($code) { $code.Substring(0, 1) } else { 'M' }
    $label = if ($map.ContainsKey($k)) { $map[$k] } else { $code }
    $color = switch ($k) { 'D' { 'Red' } '?' { 'Green' } 'A' { 'Green' } default { 'Yellow' } }
    Write-Host ("    {0,-11} {1}" -f $label, $f) -ForegroundColor $color
    $n++
  }
  return $n
}
function Do-Status {
  Title 'Estado'
  Say '  Consultando GitHub…'
  $b = Current-Branch
  Say "  Carpeta: $Root"; Say "  Rama:    $b$(if ($b -eq $PagesBranch) { '  (publicada en GitHub Pages)' })"
  if ($script:GhLogin) { Say "  Cuenta:  $($script:GhLogin)" }
  $au = (G config user.name | Select-Object -First 1); if ($au) { Say "  Autor:   $au" }
  G fetch origin --prune -q | Out-Null
  $c = Upstream-Counts
  if ($c) {
    if ($c.behind -gt 0) { Warn "GitHub tiene $($c.behind) cambio(s) que esta carpeta no tiene. Usa «traer»." }
    if ($c.ahead -gt 0) { Warn "Esta carpeta tiene $($c.ahead) cambio(s) guardado(s) sin subir." }
    if ($c.ahead -eq 0 -and $c.behind -eq 0) { Ok 'Al día con GitHub.' }
  } else { Warn 'Esta rama todavía no existe en GitHub (se creará al subir).' }
  $n = Show-Changes
  if ($n) { Say "  $n archivo(s) con cambios sin subir." 'Yellow' } else { Ok 'No hay cambios locales.' }
}
function Do-Pull {
  Title 'Traer cambios de GitHub'
  if (-not (Upstream-Counts)) { Warn 'La rama no existe en GitHub todavía: no hay nada que traer.'; return $true }
  if (GShow pull --rebase --autostash) { Ok 'Carpeta actualizada.'; return $true }
  G rebase --abort | Out-Null
  Fail 'Hay cambios que chocan con los de GitHub en las mismas líneas de los mismos archivos.'
  Say '  No se perdió nada: tus archivos quedaron como estaban y tus cambios siguen guardados en la carpeta, sin subir.'
  Say '  Revisa qué cambió en GitHub (opción 1) y pide ayuda antes de volver a intentar.'
  return $false
}
function Do-Push([string]$msg) {
  Title 'Subir cambios'
  $b = Current-Branch
  G fetch origin --prune -q | Out-Null
  G add -A | Out-Null
  G diff --cached --quiet | Out-Null
  $hasStaged = ($LASTEXITCODE -ne 0)
  $c = Upstream-Counts
  if (-not $hasStaged -and $c -and $c.ahead -eq 0) { Ok 'No hay cambios que subir.'; return }
  if ($hasStaged) {
    Say '  Cambios detectados:'
    $n = Show-Changes
    if ($b -eq $PagesBranch) { Warn "Estás en «$PagesBranch»: al subir, GitHub Pages publicará estos cambios en la app en línea." }
    if (-not $msg) {
      $def = "Actualización $((Get-Date).ToString('yyyy-MM-dd HH:mm')) ($n archivo$(if ($n -ne 1) { 's' }))"
      $msg = Ask '  Describe el cambio' $def
    }
    if (-not (AskYes "  ¿Subir $n archivo(s) a la rama «$b»?")) { G reset -q | Out-Null; Warn 'Cancelado. No se subió nada.'; return }
    Ensure-Identity
    if (-not (GShow commit -q -m $msg)) { Fail 'No se pudo guardar el cambio.'; return }
    Ok 'Cambios guardados.'
  }
  $c = Upstream-Counts
  if ($c -and $c.behind -gt 0) { Say '  GitHub tiene cambios nuevos: primero se integran.'; if (-not (Do-Pull)) { return } }
  $pushed = if (Upstream-Counts) { GShow push origin $b } else { GShow push -u origin $b }
  if (-not $pushed -and (Upstream-Counts)) {
    # Alguien subió algo justo ahora: integrar y reintentar una vez
    G fetch origin -q | Out-Null
    if (Do-Pull) { $pushed = GShow push origin $b }
  }
  if ($pushed) {
    Ok "Subido a GitHub ($b)."
    if ($b -eq $PagesBranch) { Say '  GitHub Pages tarda uno o dos minutos en publicar.' }
  } else { Fail 'No se pudo subir. Revisa tu conexión o tu sesión de GitHub (opción 7).' }
}
# La herramienta vive en la carpeta: si la otra rama no la tiene, se conserva igual
$ToolFiles = @('repo.bat', 'probar.bat', (Join-Path 'tools' 'repo.ps1'))
function Save-Tools { $k = @{}; foreach ($f in $ToolFiles) { $p = Join-Path $Root $f; if (Test-Path -LiteralPath $p) { $k[$f] = [IO.File]::ReadAllBytes($p) } }; return $k }
function Restore-Tools($k) {
  $n = 0
  foreach ($f in $k.Keys) { $p = Join-Path $Root $f; if (-not (Test-Path -LiteralPath $p)) { $d = Split-Path -Parent $p; if (-not (Test-Path -LiteralPath $d)) { New-Item -ItemType Directory -Path $d | Out-Null }; [IO.File]::WriteAllBytes($p, $k[$f]); $n++ } }
  if ($n) { Say '  La herramienta (repo.bat, probar.bat) se conservó en la carpeta; en esta rama aparece como archivo nuevo.' }
}
function Switch-Branch([string]$name) {
  $keep = Save-Tools
  $dirty = @(G status --porcelain | Where-Object { $_ -and ($_ -notmatch '^\?\? (repo\.bat|probar\.bat|tools/)') }).Count -gt 0
  $existsLocal = GOk show-ref --verify -q "refs/heads/$name"
  $existsRemote = GOk show-ref --verify -q "refs/remotes/origin/$name"
  if ($existsLocal -or $existsRemote) {
    if ($dirty) { Warn 'Tienes cambios sin subir. Súbelos antes de cambiar a otra rama existente.'; return $false }
    # Quitar las copias sueltas de la herramienta (la otra rama puede traer las suyas); se restauran después
    foreach ($f in $keep.Keys) { $rel = $f -replace '\\', '/'; if (-not (GOk ls-files --error-unmatch -- $rel)) { Remove-Item -LiteralPath (Join-Path $Root $f) -Force } }
    if (GShow switch $name) { Restore-Tools $keep; Ok "Ahora estás en «$name»."; return $true }
    Restore-Tools $keep
    return $false
  }
  if (GShow switch -c $name) { Ok "Rama nueva «$name» creada a partir de la actual. Tus cambios siguen aquí."; return $true }
  return $false
}
function Do-Branch {
  Title 'Ramas'
  G fetch origin --prune -q | Out-Null
  $cur = Current-Branch
  $all = @(G for-each-ref --format='%(refname:short)' refs/heads refs/remotes/origin | ForEach-Object { $_ -replace '^origin/', '' } | Where-Object { $_ -and $_ -ne 'HEAD' -and $_ -ne 'origin' } | Sort-Object -Unique)
  foreach ($x in $all) { Say ("   {0} {1}{2}" -f $(if ($x -eq $cur) { '*' } else { ' ' }), $x, $(if ($x -eq $PagesBranch) { '  (publicada)' })) }
  $name = Ask '  Rama a usar (escribe un nombre nuevo para crearla)' $cur
  if (-not $name -or $name -eq $cur) { return }
  if (Switch-Branch $name) { $cfg = Load-Config; if ($cfg) { $cfg.branch = $name; Save-Config $cfg } }
}
function Do-Tag {
  Title 'Marcar versión'
  G fetch origin --tags -q | Out-Null
  $tags = @(G tag --sort=-creatordate | Select-Object -First 5)
  if ($tags.Count) { Say ('  Últimas: ' + ($tags -join ', ')) }
  $v = Ask '  Versión (por ejemplo v3.0.0)'
  if (-not $v) { return }
  if (-not $v.StartsWith('v')) { $v = 'v' + $v }
  if (GOk show-ref --verify -q "refs/tags/$v") { Fail "La versión $v ya existe."; return }
  $c = Upstream-Counts
  if (@(G status --porcelain).Count -or -not $c -or $c.ahead -gt 0) { Warn 'Hay cambios sin subir. Súbelos primero (opción 3) para que la versión los incluya.'; return }
  if ($c.behind -gt 0) { Warn 'GitHub tiene cambios que esta carpeta no tiene. Tráelos primero (opción 2).'; return }
  $m = Ask '  Descripción' "Brújula $v"
  Ensure-Identity
  if ((GOk tag -a $v -m $m) -and (GShow push origin $v)) { Ok "Versión $v marcada en GitHub." } else { Fail 'No se pudo marcar la versión.' }
}
function Do-Test {
  $bat = Join-Path $Root 'probar.bat'
  if (Test-Path -LiteralPath $bat) { Start-Process -FilePath $bat -WorkingDirectory $Root; Ok 'Servidor de prueba abierto en otra ventana.' }
  else { Warn 'No encontré probar.bat en la carpeta.' }
}
function Change-Account {
  if ($NoGh) { Warn 'Modo de prueba: sin GitHub CLI.'; return }
  Say ''
  Say '  1. Cambiar a otra cuenta que ya inició sesión'
  Say '  2. Iniciar sesión con otra cuenta (se abre el navegador)'
  Say '  3. Cerrar la sesión de una cuenta'
  Say '  0. Volver'
  $o = Read-Host '  Opción'
  $what = switch ($o) { '1' { 'auth switch -h github.com' } '2' { 'auth login -h github.com -p https -w' } '3' { 'auth logout -h github.com' } default { '' } }
  if (-not $what) { return }
  Say '  Se abre otra ventana de GitHub CLI. Responde ahí lo que pregunte; al terminar se cierra sola y vuelves aquí.'
  if ($o -eq '2') {
    Say '  Ahí: Enter para aceptar, copia el código de 8 letras, Enter para abrir el navegador y pega el código.'
    Say '  Si el navegador entra con la cuenta equivocada, cierra esa sesión en github.com o usa una ventana de incógnito.'
  }
  Run-Window 'gh' $what | Out-Null
  $script:GhLogin = Active-Login
  if (-not $script:GhLogin) { Warn 'No hay ninguna sesión activa. Para traer o subir cambios inicia sesión (opción 7 → 2).'; return }
  Gh auth setup-git -h github.com | Out-Null
  Ok "Cuenta activa: $($script:GhLogin)"
  if (Test-Path -LiteralPath (Join-Path $Root '.git')) { Ensure-Identity -Interactive }
}
function Do-Auth {
  if ($NoGh) { Warn 'Modo de prueba: sin GitHub CLI.'; return }
  Title 'Sesión de GitHub'
  $st = @(Gh auth status -h github.com); if ($script:LastErr) { $st += ($script:LastErr -split "`n") }
  foreach ($l in $st) { if ($l -and $l -notmatch 'Token:') { Say "  $l" } }
  $a = (G config --local user.name | Select-Object -First 1)
  if ($a) { Say "  Autor de los cambios en esta carpeta: $a" }
  Change-Account
}
# Lleva lo de la rama actual (por ejemplo v3) a la rama publicada (main) y deja la carpeta en main
function Do-Publish {
  Title "Publicar en «$PagesBranch»"
  $b = Current-Branch
  if ($b -eq $PagesBranch) { Ok "Ya trabajas en «$PagesBranch»: lo que subas (opción 3) se publica directo."; return }
  G fetch origin --prune -q | Out-Null
  if (-not (GOk show-ref --verify -q "refs/remotes/origin/$PagesBranch")) { Fail "No encontré la rama «$PagesBranch» en GitHub."; return }
  $c = Upstream-Counts
  if (@(G status --porcelain | Where-Object { $_ }).Count -or -not $c -or $c.ahead -gt 0) { Warn "Hay cambios de «$b» sin subir. Súbelos primero (opción 3)."; return }
  if ($c.behind -gt 0) { Warn 'GitHub tiene cambios que esta carpeta no tiene. Tráelos primero (opción 2).'; return }
  $n = [int](G rev-list --count "origin/$PagesBranch..HEAD" | Select-Object -First 1)
  if ($n -eq 0) {
    Ok "«$PagesBranch» ya tiene todo lo de «$b»."
  } else {
    Say "  «$b» tiene $n cambio(s) que «$PagesBranch» no tiene. Al publicar, GitHub Pages actualizará la app en línea."
    if (-not (AskYes "  ¿Publicar «$b» en «$PagesBranch»?")) { Warn 'Cancelado. No se publicó nada.'; return }
    if (-not (GOk merge-base --is-ancestor "origin/$PagesBranch" HEAD)) {
      # main tiene cambios que esta rama no tiene: primero se juntan aquí
      Say "  «$PagesBranch» tiene cambios propios: primero se integran en «$b»."
      Ensure-Identity -Quiet
      if (-not (GShow merge --no-edit -m "Integrar $PagesBranch en $b" "origin/$PagesBranch")) {
        G merge --abort | Out-Null
        Fail "Los cambios de «$PagesBranch» chocan con los de «$b». No se publicó nada y tu carpeta quedó como estaba."
        return
      }
      if (-not (GShow push origin $b)) { Fail 'No se pudo subir. No se publicó nada.'; return }
    }
    if (-not (GShow push origin "HEAD:refs/heads/$PagesBranch")) { Fail 'No se pudo publicar. Revisa tu conexión o tu sesión de GitHub (opción 7).'; return }
    Ok "Publicado en «$PagesBranch». GitHub Pages tarda uno o dos minutos."
  }
  if (AskYes "  ¿Dejar esta carpeta trabajando en «$PagesBranch» (lo que subas se publicará directo)?") {
    if (Switch-Branch $PagesBranch) {
      if (Upstream-Counts) { Do-Pull | Out-Null } else { G branch --set-upstream-to "origin/$PagesBranch" | Out-Null }
      $cfg = Load-Config; if ($cfg) { $cfg.branch = $PagesBranch; Save-Config $cfg }
      Say "  La rama «$b» se conserva en GitHub por si la necesitas."
    }
  }
}

# ---------------------------------------------------------------- arranque
Write-Host ''
Write-Host '  Brújula · repositorio' -ForegroundColor Cyan
Say '  Revisando git y GitHub CLI…'
if (-not (Ensure-Tool 'git' 'Git.Git' 'Git')) { exit 1 }
if (-not $NoGh) { if (-not (Ensure-Tool 'gh' 'GitHub.cli' 'GitHub CLI')) { exit 1 } }
if (-not (Ensure-Auth)) { exit 1 }

$act = $Action.ToLower()
$cfg = Connect-Folder -Force:($act -eq 'conectar')
if (-not $cfg) { exit 1 }
Ensure-Identity -Quiet
if ($act -eq 'conectar') { Do-Status; exit 0 }

switch ($act) {
  'estado' { Do-Status; exit 0 }
  'traer' { if (Do-Pull) { exit 0 } else { exit 1 } }
  'subir' { Do-Push $Message; exit 0 }
  'rama' { Do-Branch; exit 0 }
  'etiqueta' { Do-Tag; exit 0 }
  'probar' { Do-Test; exit 0 }
  'publicar' { Do-Publish; exit 0 }
  'sesion' { Do-Auth; exit 0 }
}

Do-Status
while ($true) {
  Write-Host ''
  Write-Host '  1. Estado            2. Traer de GitHub     3. Subir cambios' -ForegroundColor White
  Write-Host '  4. Cambiar de rama   5. Marcar versión      6. Probar localmente' -ForegroundColor White
  Write-Host '  7. Sesión de GitHub  8. Publicar en main    9. Conectar a otro repositorio' -ForegroundColor White
  Write-Host '  0. Salir' -ForegroundColor White
  $o = Read-Host '  Opción'
  switch ($o) {
    '1' { Do-Status }
    '2' { Do-Pull | Out-Null }
    '3' { Do-Push '' }
    '4' { Do-Branch }
    '5' { Do-Tag }
    '6' { Do-Test }
    '7' { Do-Auth }
    '8' { Do-Publish }
    '9' { Connect-Folder -Force | Out-Null }
    '0' { exit 0 }
    default { }
  }
}
