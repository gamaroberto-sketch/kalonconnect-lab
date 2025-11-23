# Script para adicionar NEXT_PUBLIC_SITE_URL ao .env.local

$envFile = ".env.local"

# Verificar se NEXT_PUBLIC_SITE_URL já existe
$content = Get-Content $envFile -Raw
if ($content -match "NEXT_PUBLIC_SITE_URL") {
    Write-Host "NEXT_PUBLIC_SITE_URL ja existe no arquivo!" -ForegroundColor Yellow
    exit
}

# Adicionar configuração
Add-Content $envFile ""
Add-Content $envFile "# Solucao MANUS: Configuracao de URL base para compartilhamento"
Add-Content $envFile "# Para desenvolvimento com HTTPS (use ngrok):"
Add-Content $envFile "# NEXT_PUBLIC_SITE_URL=https://seu-ngrok-url.ngrok.io"
Add-Content $envFile "# Por enquanto, usando localhost (NAO sera clicavel no WhatsApp)"
Add-Content $envFile "NEXT_PUBLIC_SITE_URL=http://localhost:3001"

Write-Host "Configuracao NEXT_PUBLIC_SITE_URL adicionada ao .env.local!" -ForegroundColor Green






