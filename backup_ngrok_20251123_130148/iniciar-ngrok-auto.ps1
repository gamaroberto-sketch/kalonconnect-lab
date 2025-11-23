# Script para iniciar ngrok e atualizar .env.local automaticamente
# Execute: .\iniciar-ngrok-auto.ps1
# 
# Este script:
# 1. Inicia o ngrok
# 2. Aguarda a URL estar disponivel
# 3. Atualiza automaticamente o .env.local
# 4. Mantem o ngrok rodando

Write-Host "Iniciando ngrok com atualizacao automatica..." -ForegroundColor Cyan
Write-Host ""

# Verificar se ngrok esta instalado
try {
    $ngrokVersion = ngrok version 2>&1
    Write-Host "OK - ngrok encontrado!" -ForegroundColor Green
} catch {
    Write-Host "ERRO - ngrok nao encontrado!" -ForegroundColor Red
    Write-Host "   Instale: npm install -g ngrok" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Informacoes:" -ForegroundColor Yellow
Write-Host "   - Porta padrao do LiveKit: 7880" -ForegroundColor White
Write-Host "   - A URL sera atualizada automaticamente no .env.local" -ForegroundColor White
Write-Host "   - Pressione Ctrl+C para parar" -ForegroundColor White
Write-Host ""

# Perguntar qual porta usar
Write-Host "Digite a porta do LiveKit (pressione Enter para usar 7880): " -NoNewline -ForegroundColor Yellow
$porta = Read-Host
if ([string]::IsNullOrWhiteSpace($porta)) {
    $porta = "7880"
}

Write-Host ""
Write-Host "Iniciando ngrok na porta $porta..." -ForegroundColor Cyan
Write-Host ""

# Iniciar ngrok em background
$ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http", $porta -PassThru -WindowStyle Hidden

# Aguardar alguns segundos para ngrok iniciar
Write-Host "Aguardando ngrok iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Tentar obter URL e atualizar .env.local
$maxAttempts = 10
$attempt = 0
$success = $false

while ($attempt -lt $maxAttempts -and -not $success) {
    $attempt++
    Write-Host "   Tentativa $attempt/$maxAttempts..." -ForegroundColor Gray
    
    try {
        $ngrokApi = "http://127.0.0.1:4040/api/tunnels"
        $response = Invoke-RestMethod -Uri $ngrokApi -Method Get -ErrorAction Stop
        
        if ($response.tunnels -and $response.tunnels.Count -gt 0) {
            $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            
            if ($httpsTunnel) {
                $ngrokUrl = $httpsTunnel.public_url
                $ngrokDomain = $ngrokUrl -replace "https://", ""
                $wssUrl = "wss://$ngrokDomain"
                
                # Atualizar .env.local
                $envFile = ".env.local"
                if (-not (Test-Path $envFile)) {
                    New-Item -Path $envFile -ItemType File -Force | Out-Null
                }
                
                $content = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
                if (-not $content) {
                    $content = ""
                }
                
                if ($content -match "NEXT_PUBLIC_LIVEKIT_URL=") {
                    $content = $content -replace "NEXT_PUBLIC_LIVEKIT_URL=.*", "NEXT_PUBLIC_LIVEKIT_URL=$wssUrl"
                } else {
                    if ($content -and -not $content.EndsWith("`n")) {
                        $content += "`n"
                    }
                    $content += "NEXT_PUBLIC_LIVEKIT_URL=$wssUrl`n"
                }
                
                Set-Content -Path $envFile -Value $content -NoNewline
                
                Write-Host ""
                Write-Host "OK - URL atualizada automaticamente!" -ForegroundColor Green
                Write-Host "   URL: $ngrokUrl" -ForegroundColor White
                Write-Host "   Configurado: $wssUrl" -ForegroundColor Cyan
                Write-Host ""
                Write-Host "IMPORTANTE: Reinicie o servidor Next.js para aplicar!" -ForegroundColor Yellow
                Write-Host ""
                
                $success = $true
            }
        }
    } catch {
        # Ainda nao esta pronto, aguardar mais
        Start-Sleep -Seconds 2
    }
}

if (-not $success) {
    Write-Host ""
    Write-Host "AVISO - Nao foi possivel obter a URL automaticamente" -ForegroundColor Yellow
    Write-Host "   Execute manualmente: .\atualizar-url-ngrok.ps1" -ForegroundColor White
    Write-Host "   Ou acesse: http://127.0.0.1:4040 para ver a URL" -ForegroundColor White
    Write-Host ""
}

Write-Host "ngrok esta rodando. Mantenha este terminal aberto." -ForegroundColor Cyan
Write-Host "   Para atualizar a URL novamente, execute: .\atualizar-url-ngrok.ps1" -ForegroundColor White
Write-Host "   Pressione Ctrl+C para parar o ngrok" -ForegroundColor Yellow
Write-Host ""

# Mostrar interface do ngrok (opcional - pode comentar se quiser apenas background)
# Aguardar processo terminar (Ctrl+C)
try {
    Wait-Process -Id $ngrokProcess.Id
} catch {
    # Processo foi terminado
}
