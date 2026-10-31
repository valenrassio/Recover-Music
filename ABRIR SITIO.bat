@echo off
title Recover Music - localhost
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0servidor.ps1"
if errorlevel 1 start "" "%~dp0index.html"
pause
