# Script para iniciar ngrok de forma correta
# Execute: .\iniciar-ngrok.ps1

Write-Host "Iniciando ngrok na porta 3001..." -ForegroundColor Cyan
Write-Host ""

# Verificar se ngrok esta instalado
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "ngrok encontrado!" -ForegroundColor Green
} catch {
    Write-Host "ERRO: ngrok nao encontrado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Aguardando ngrok iniciar..." -ForegroundColor Yellow
Write-Host "A URL HTTPS sera exibida abaixo." -ForegroundColor Yellow
Write-Host "Pressione Ctrl+C para parar." -ForegroundColor Yellow
Write-Host ""

# Iniciar ngrok
Start-Process -FilePath "ngrok" -ArgumentList "http","3001" -NoNewWindow -Wait






