@echo off
set "APP_DIR=%~dp0"
set "NODE_EXE=C:\Program Files\nodejs\node.exe"

if not exist "%NODE_EXE%" (
  echo Node.js nao foi encontrado em "%NODE_EXE%".
  echo Reinstale o Node.js LTS ou ajuste o caminho neste arquivo.
  pause
  exit /b 1
)

start "FinanceAI Server" cmd /k "cd /d "%APP_DIR%" && "%NODE_EXE%" server.js"
timeout /t 2 /nobreak >nul
start "" "http://localhost:3000"
