# Script para iniciar ngrok para o LiveKit
# Execute: .\iniciar-ngrok-livekit.ps1
# 
# IMPORTANTE: Este script deve rodar em um terminal SEPARADO do servidor Next.js
# O ngrok precisa ficar rodando enquanto você usa o sistema

Write-Host "🚀 Iniciando ngrok para LiveKit..." -ForegroundColor Cyan
Write-Host ""

# Verificar se ngrok está instalado
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "✅ ngrok encontrado!" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: ngrok não encontrado!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📦 Instale o ngrok:" -ForegroundColor Yellow
    Write-Host "   Windows: Baixe de https://ngrok.com/download" -ForegroundColor White
    Write-Host "   Ou via chocolatey: choco install ngrok" -ForegroundColor White
    Write-Host "   Ou via npm: npm install -g ngrok" -ForegroundColor White
    Write-Host ""
    exit 1
}

Write-Host ""
Write-Host "📋 Informações importantes:" -ForegroundColor Yellow
Write-Host "   • Porta padrão do LiveKit: 7880" -ForegroundColor White
Write-Host "   • Este script abrirá um túnel para a porta 7880" -ForegroundColor White
Write-Host "   • A URL HTTPS será exibida abaixo" -ForegroundColor White
Write-Host "   • Copie a URL e configure no arquivo .env.local:" -ForegroundColor White
Write-Host "     NEXT_PUBLIC_LIVEKIT_URL=wss://sua-url.ngrok.io" -ForegroundColor Cyan
Write-Host ""
Write-Host "⚠️  IMPORTANTE:" -ForegroundColor Yellow
Write-Host "   • Use wss:// (não https://) na variável NEXT_PUBLIC_LIVEKIT_URL" -ForegroundColor White
Write-Host "   • Mantenha este terminal aberto enquanto usar o sistema" -ForegroundColor White
Write-Host "   • Pressione Ctrl+C para parar o ngrok" -ForegroundColor White
Write-Host ""

# Perguntar qual porta usar (padrão 7880)
$porta = Read-Host "Digite a porta do LiveKit (Enter para usar 7880)"
if ([string]::IsNullOrWhiteSpace($porta)) {
    $porta = "7880"
}

Write-Host ""
Write-Host "🔗 Iniciando túnel ngrok na porta $porta..." -ForegroundColor Cyan
Write-Host ""

# Iniciar ngrok
ngrok http $porta


