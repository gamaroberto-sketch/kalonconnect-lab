# Script para monitorar mudanças na URL do ngrok e atualizar .env.local automaticamente
# Execute: .\monitorar-ngrok.ps1
# 
# Este script fica monitorando a URL do ngrok e atualiza o .env.local sempre que mudar
# Útil quando o ngrok reinicia e a URL muda

Write-Host "👁️  Monitorando URL do ngrok..." -ForegroundColor Cyan
Write-Host "   Este script atualizará o .env.local automaticamente quando a URL mudar" -ForegroundColor White
Write-Host "   Pressione Ctrl+C para parar" -ForegroundColor Yellow
Write-Host ""

$lastUrl = ""
$envFile = ".env.local"

# Criar .env.local se não existir
if (-not (Test-Path $envFile)) {
    New-Item -Path $envFile -ItemType File -Force | Out-Null
}

while ($true) {
    try {
        $ngrokApi = "http://127.0.0.1:4040/api/tunnels"
        $response = Invoke-RestMethod -Uri $ngrokApi -Method Get -ErrorAction Stop
        
        if ($response.tunnels -and $response.tunnels.Count -gt 0) {
            $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
            
            if ($httpsTunnel) {
                $currentUrl = $httpsTunnel.public_url
                
                if ($currentUrl -ne $lastUrl) {
                    $ngrokDomain = $currentUrl -replace "https://", ""
                    $wssUrl = "wss://$ngrokDomain"
                    
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🔄 URL mudou: $currentUrl" -ForegroundColor Yellow
                    
                    # Atualizar .env.local
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
                    
                    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✅ .env.local atualizado: $wssUrl" -ForegroundColor Green
                    Write-Host ""
                    
                    $lastUrl = $currentUrl
                }
            }
        }
    } catch {
        # ngrok não está rodando ou API não disponível
        if ($lastUrl) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ⚠️  ngrok não está acessível" -ForegroundColor Red
            $lastUrl = ""
        }
    }
    
    # Verificar a cada 5 segundos
    Start-Sleep -Seconds 5
}









