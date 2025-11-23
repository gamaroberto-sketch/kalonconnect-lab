@echo off
echo ========================================
echo Iniciando ngrok na porta 7880
echo ========================================
echo.
echo IMPORTANTE:
echo   - Mantenha este terminal aberto
echo   - Em outro terminal, execute: atualizar-url-ngrok.bat
echo   - Ou acesse: http://127.0.0.1:4040 para ver a URL
echo.
echo Pressione Ctrl+C para parar
echo.
echo ========================================
echo.

ngrok http 7880

pause



