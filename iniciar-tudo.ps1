# Script para iniciar tudo manualmente
# Execute este script em um PowerShell externo (não no Cursor)

Write-Host "🚀 Iniciando ambiente de desenvolvimento..." -ForegroundColor Cyan
Write-Host ""

# 1. Verificar Docker
Write-Host "1️⃣ Verificando Docker..." -ForegroundColor Yellow
$dockerRunning = docker ps 2>&1 | Select-String -Pattern "CONTAINER|error" -Quiet

if (-not $dockerRunning -or (docker ps 2>&1 | Select-String -Pattern "error|Cannot connect")) {
    Write-Host "⚠️  Docker não está rodando ou não está pronto." -ForegroundColor Yellow
    Write-Host "👉 Por favor, abra o Docker Desktop manualmente e aguarde até aparecer 'Docker Engine running'" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pressione qualquer tecla quando Docker Desktop estiver rodando..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 2. Verificar LiveKit
Write-Host ""
Write-Host "2️⃣ Verificando LiveKit..." -ForegroundColor Yellow
$livekitRunning = Test-NetConnection -ComputerName localhost -Port 7880 -WarningAction SilentlyContinue

if (-not $livekitRunning.TcpTestSucceeded) {
    Write-Host "⚠️  LiveKit não está rodando. Iniciando..." -ForegroundColor Yellow
    Set-Location $PSScriptRoot
    docker-compose up -d
    Write-Host "⏳ Aguardando LiveKit iniciar (10 segundos)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
} else {
    Write-Host "✅ LiveKit já está rodando" -ForegroundColor Green
}

# 3. Verificar ngrok
Write-Host ""
Write-Host "3️⃣ Verificando ngrok..." -ForegroundColor Yellow
$ngrokInstalled = Get-Command ngrok -ErrorAction SilentlyContinue

if (-not $ngrokInstalled) {
    Write-Host "❌ ngrok não está instalado!" -ForegroundColor Red
    Write-Host "👉 Instale com: npm install -g ngrok" -ForegroundColor Cyan
    exit 1
} else {
    Write-Host "✅ ngrok está instalado" -ForegroundColor Green
}

# 4. Executar script principal
Write-Host ""
Write-Host "4️⃣ Executando script principal..." -ForegroundColor Yellow
Write-Host ""

Set-Location $PSScriptRoot
npm run dev-lab:ngrok








