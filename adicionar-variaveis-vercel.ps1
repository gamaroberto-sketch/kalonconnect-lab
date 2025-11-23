# Script para adicionar variáveis de ambiente do LiveKit no Vercel
# Lê do .env.local e adiciona no Vercel via CLI

Write-Host "Adicionando variaveis de ambiente no Vercel..." -ForegroundColor Cyan
Write-Host ""

# Verificar se .env.local existe
if (-not (Test-Path .env.local)) {
    Write-Host "ERRO: Arquivo .env.local nao encontrado!" -ForegroundColor Red
    exit 1
}

# Ler variáveis do .env.local
$envContent = Get-Content .env.local -Raw

# Extrair valores
$livekitUrl = ""
$apiKey = ""
$apiSecret = ""

if ($envContent -match "NEXT_PUBLIC_LIVEKIT_URL=(.+)") {
    $livekitUrl = $matches[1].Trim()
}

if ($envContent -match "LIVEKIT_API_KEY=(.+)") {
    $apiKey = $matches[1].Trim()
}

if ($envContent -match "LIVEKIT_API_SECRET=(.+)") {
    $apiSecret = $matches[1].Trim()
}

# Verificar se encontrou todas
if (-not $livekitUrl -or -not $apiKey -or -not $apiSecret) {
    Write-Host "ERRO: Nao foi possivel encontrar todas as variaveis no .env.local" -ForegroundColor Red
    Write-Host ""
    Write-Host "Variaveis encontradas:" -ForegroundColor Yellow
    if ($livekitUrl) { Write-Host "  NEXT_PUBLIC_LIVEKIT_URL: OK" } else { Write-Host "  NEXT_PUBLIC_LIVEKIT_URL: FALTANDO" }
    if ($apiKey) { Write-Host "  LIVEKIT_API_KEY: OK" } else { Write-Host "  LIVEKIT_API_KEY: FALTANDO" }
    if ($apiSecret) { Write-Host "  LIVEKIT_API_SECRET: OK" } else { Write-Host "  LIVEKIT_API_SECRET: FALTANDO" }
    exit 1
}

Write-Host "OK: Variaveis encontradas no .env.local:" -ForegroundColor Green
Write-Host "  NEXT_PUBLIC_LIVEKIT_URL: $livekitUrl" -ForegroundColor Gray
Write-Host "  LIVEKIT_API_KEY: $apiKey" -ForegroundColor Gray
Write-Host "  LIVEKIT_API_SECRET: $($apiSecret.Substring(0, [Math]::Min(10, $apiSecret.Length)))..." -ForegroundColor Gray
Write-Host ""

# Verificar se Vercel CLI esta instalado
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: Vercel CLI nao esta instalado!" -ForegroundColor Red
    Write-Host "Instale com: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}

Write-Host "Instrucoes para adicionar no Vercel:" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Acesse: https://vercel.com" -ForegroundColor White
Write-Host "2. Entre no projeto 'kalonconnect'" -ForegroundColor White
Write-Host "3. Vá em Settings → Environment Variables" -ForegroundColor White
Write-Host "4. Adicione estas 3 variáveis:" -ForegroundColor White
Write-Host ""
Write-Host "   Variável 1:" -ForegroundColor Yellow
Write-Host "   Key: NEXT_PUBLIC_LIVEKIT_URL" -ForegroundColor Gray
Write-Host "   Value: $livekitUrl" -ForegroundColor Green
Write-Host "   Environment: Production, Preview, Development (marque todos)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Variável 2:" -ForegroundColor Yellow
Write-Host "   Key: LIVEKIT_API_KEY" -ForegroundColor Gray
Write-Host "   Value: $apiKey" -ForegroundColor Green
Write-Host "   Environment: Production, Preview, Development (marque todos)" -ForegroundColor Gray
Write-Host ""
Write-Host "   Variável 3:" -ForegroundColor Yellow
Write-Host "   Key: LIVEKIT_API_SECRET" -ForegroundColor Gray
Write-Host "   Value: $apiSecret" -ForegroundColor Green
Write-Host "   Environment: Production, Preview, Development (marque todos)" -ForegroundColor Gray
Write-Host ""
Write-Host "5. Clique em 'Save' para cada uma" -ForegroundColor White
Write-Host ""
Write-Host "6. Depois execute: vercel --prod" -ForegroundColor White
Write-Host ""

# Tentar adicionar via CLI (se possível)
Write-Host "Dica: Voce pode copiar e colar os valores acima diretamente no Vercel" -ForegroundColor Cyan
Write-Host ""

