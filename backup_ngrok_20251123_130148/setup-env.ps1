# Script para criar arquivo .env.local
# Execute: .\setup-env.ps1

$envFile = ".env.local"
$exampleFile = "env.local.example"

Write-Host "🔴 Configurando arquivo .env.local..." -ForegroundColor Yellow

# Verificar se já existe
if (Test-Path $envFile) {
    Write-Host "⚠️  Arquivo .env.local já existe!" -ForegroundColor Yellow
    $overwrite = Read-Host "Deseja sobrescrever? (s/n)"
    if ($overwrite -ne "s") {
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
        exit
    }
}

# Copiar do exemplo se existir
if (Test-Path $exampleFile) {
    Copy-Item $exampleFile $envFile
    Write-Host "✅ Arquivo .env.local criado a partir do exemplo!" -ForegroundColor Green
} else {
    # Criar arquivo básico
    @"
# 🔴 SOLUÇÃO MANUS: Configuração de URL base
# Para desenvolvimento local, use ngrok:
# 1. Instale: npm install -g ngrok
# 2. Execute: ngrok http 3001
# 3. Copie o URL HTTPS fornecido e cole abaixo

# ⚠️ IMPORTANTE: localhost:3001 NUNCA será clicável no WhatsApp!
# Use ngrok para obter HTTPS real em desenvolvimento

# Para desenvolvimento com HTTPS (RECOMENDADO - descomente após configurar ngrok):
# NEXT_PUBLIC_SITE_URL=https://seu-ngrok-url.ngrok.io

# Para produção:
# NEXT_PUBLIC_SITE_URL=https://seu-dominio.com

# Por enquanto, usando localhost (NÃO será clicável no WhatsApp, mas funciona para testes)
NEXT_PUBLIC_SITE_URL=http://localhost:3001
"@ | Out-File -FilePath $envFile -Encoding UTF8
    Write-Host "Arquivo .env.local criado!" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Execute: ngrok http 3001" -ForegroundColor White
Write-Host "2. Copie a URL HTTPS fornecida" -ForegroundColor White
Write-Host "3. Edite .env.local e atualize NEXT_PUBLIC_SITE_URL" -ForegroundColor White
Write-Host "4. Reinicie o servidor Next.js" -ForegroundColor White
Write-Host ""

