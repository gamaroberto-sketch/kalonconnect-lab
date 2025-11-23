@echo off
echo ========================================
echo Atualizando URL do ngrok no .env.local
echo ========================================
echo.

powershell -ExecutionPolicy Bypass -File "%~dp0atualizar-url-ngrok.ps1"

pause



