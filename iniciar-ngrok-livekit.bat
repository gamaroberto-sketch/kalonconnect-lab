@echo off
echo ========================================
echo Iniciando ngrok para LiveKit
echo ========================================
echo.
echo IMPORTANTE: Este script deve rodar em um terminal SEPARADO
echo do servidor Next.js. Mantenha este terminal aberto!
echo.
echo Porta padrão do LiveKit: 7880
echo.
echo A URL HTTPS sera exibida abaixo.
echo Copie a URL e configure no arquivo .env.local:
echo   NEXT_PUBLIC_LIVEKIT_URL=wss://sua-url.ngrok.io
echo.
echo IMPORTANTE: Use wss:// (nao https://) na variavel!
echo.
echo Pressione Ctrl+C para parar.
echo.
echo ========================================
echo.

REM Verificar se ngrok está instalado
where ngrok >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERRO: ngrok nao encontrado!
    echo.
    echo Instale o ngrok:
    echo   - Baixe de https://ngrok.com/download
    echo   - Ou via chocolatey: choco install ngrok
    echo   - Ou via npm: npm install -g ngrok
    echo.
    pause
    exit /b 1
)

echo Iniciando ngrok na porta 7880...
echo.

ngrok http 7880

pause










