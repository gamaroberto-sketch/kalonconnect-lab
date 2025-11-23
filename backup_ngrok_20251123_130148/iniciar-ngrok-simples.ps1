# Script simples para iniciar ngrok
# Execute: .\iniciar-ngrok-simples.ps1
# Depois execute: .\atualizar-url-ngrok.ps1 em outro terminal

Write-Host "Iniciando ngrok na porta 7880..." -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   - Mantenha este terminal aberto" -ForegroundColor White
Write-Host "   - Em outro terminal, execute: .\atualizar-url-ngrok.ps1" -ForegroundColor White
Write-Host "   - Ou acesse: http://127.0.0.1:4040 para ver a URL" -ForegroundColor White
Write-Host ""
Write-Host "Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

# Iniciar ngrok normalmente (não em background)
ngrok http 7880

