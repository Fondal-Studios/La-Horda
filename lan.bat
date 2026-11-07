@echo off
rem LA HORDA - JUGAR EN RED LOCAL (Windows): doble clic en este archivo. Ver docs\beta-release\MULTIJUGADOR_LOCAL.md
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Falta Node.js ^(version 18 o mas^). Instalalo desde https://nodejs.org y volve a abrir este archivo.
  pause
  exit /b 1
)
node tools\lan\host.js %*
if errorlevel 1 pause
