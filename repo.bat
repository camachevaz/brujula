@echo off
rem Brujula - administrar el repositorio (sincronizar con GitHub)
rem Doble clic para el menu, o desde una terminal: repo.bat subir "mensaje"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0tools\repo.ps1" -Root "%~dp0." %*
if errorlevel 1 pause
