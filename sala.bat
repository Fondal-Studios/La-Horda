@echo off
rem LA HORDA - SALA CON CELULARES COMO MANDO: doble clic. La partida se ve en esta compu; cada celular (misma WiFi) escanea el QR y maneja un guardian.
rem Tecla V: vista de sala (se ve todo el grupo). Tecla M: mostrar el QR. Ver docs/beta-release/CELULARES_COMO_MANDO.md
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Falta Node.js ^(version 18 o mas^). Instalalo desde https://nodejs.org y volve a abrir este archivo.
  pause
  exit /b 1
)
node tools\lan\host.js --abrir %*
if errorlevel 1 pause
