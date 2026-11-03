@echo off
setlocal
rem ============================================================
rem  Brujula - servidor local para probar la app
rem  Guarda este archivo en la carpeta de la app (junto a index.html)
rem  y dale doble clic. Para detenerlo: cierra esta ventana o Ctrl+C.
rem ============================================================

set "PORT=8000"
if not "%~1"=="" set "PORT=%~1"

cd /d "%~dp0"

if not exist "index.html" (
  echo [!] No encuentro index.html en esta carpeta:
  echo     %CD%
  echo     Guarda probar.bat en la carpeta de la app, junto a index.html.
  pause
  exit /b 1
)

rem --- Buscar Python (primero el lanzador py, luego python) ---
set "PY="
where py >nul 2>&1 && set "PY=py"
if not defined PY (
  where python >nul 2>&1 && set "PY=python"
)
if not defined PY (
  echo [!] No encontre Python instalado.
  echo     Instalalo desde https://www.python.org/downloads/
  echo     y marca la casilla "Add Python to PATH".
  pause
  exit /b 1
)

rem --- Si el puerto esta ocupado, probar el siguiente ---
:checkport
netstat -ano | findstr /r /c:":%PORT% .*LISTENING" >nul 2>&1
if not errorlevel 1 (
  echo El puerto %PORT% esta ocupado, probando otro...
  set /a PORT+=1
  goto checkport
)

echo.
echo  Brujula - servidor local
echo  Carpeta: %CD%
echo  Abre:    http://localhost:%PORT%
echo.
echo  Deja esta ventana abierta mientras pruebas.
echo  Para detener el servidor: cierra la ventana o presiona Ctrl+C.
echo.

rem --- Abrir el navegador cuando el servidor ya este arriba ---
start "" /b cmd /c "timeout /t 2 /nobreak >nul & start "" http://localhost:%PORT%/"

%PY% -m http.server %PORT% --bind 127.0.0.1

echo.
echo El servidor se detuvo.
pause
endlocal
