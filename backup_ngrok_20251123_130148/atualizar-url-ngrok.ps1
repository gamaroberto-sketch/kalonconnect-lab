# Script para atualizar automaticamente a URL do ngrok no .env.local
# Execute: .\atualizar-url-ngrok.ps1

Write-Host "Buscando URL do ngrok..." -ForegroundColor Cyan
Write-Host ""

# Tentar obter URL do ngrok via API local
try {
    $ngrokApi = "http://127.0.0.1:4040/api/tunnels"
    $response = Invoke-RestMethod -Uri $ngrokApi -Method Get -ErrorAction Stop
    
    if ($response.tunnels -and $response.tunnels.Count -gt 0) {
        # Procurar tunel HTTPS
        $httpsTunnel = $response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1
        
        if ($httpsTunnel) {
            $ngrokUrl = $httpsTunnel.public_url
            # Remover https:// e deixar apenas o dominio
            $ngrokDomain = $ngrokUrl -replace "https://", ""
            
            Write-Host "OK - URL do ngrok encontrada: $ngrokUrl" -ForegroundColor Green
            Write-Host "   Dominio: $ngrokDomain" -ForegroundColor White
            Write-Host ""
            
            # Verificar se .env.local existe
            $envFile = ".env.local"
            if (-not (Test-Path $envFile)) {
                Write-Host "Criando arquivo .env.local..." -ForegroundColor Yellow
                New-Item -Path $envFile -ItemType File -Force | Out-Null
            }
            
            # Ler conteudo atual
            $content = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
            if (-not $content) {
                $content = ""
            }
            
            # Atualizar ou adicionar NEXT_PUBLIC_LIVEKIT_URL
            $wssUrl = "wss://$ngrokDomain"
            
            if ($content -match "NEXT_PUBLIC_LIVEKIT_URL=") {
                # Substituir linha existente
                $content = $content -replace "NEXT_PUBLIC_LIVEKIT_URL=.*", "NEXT_PUBLIC_LIVEKIT_URL=$wssUrl"
                Write-Host "Atualizando NEXT_PUBLIC_LIVEKIT_URL no .env.local..." -ForegroundColor Yellow
            } else {
                # Adicionar nova linha
                if ($content -and -not $content.EndsWith("`n")) {
                    $content += "`n"
                }
                $content += "NEXT_PUBLIC_LIVEKIT_URL=$wssUrl`n"
                Write-Host "Adicionando NEXT_PUBLIC_LIVEKIT_URL no .env.local..." -ForegroundColor Yellow
            }
            
            # Salvar arquivo
            Set-Content -Path $envFile -Value $content -NoNewline
            
            Write-Host "OK - Arquivo .env.local atualizado com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "Configuracao:" -ForegroundColor Cyan
            Write-Host "   NEXT_PUBLIC_LIVEKIT_URL=$wssUrl" -ForegroundColor White
            Write-Host ""
            Write-Host "IMPORTANTE: Reinicie o servidor Next.js para aplicar as mudancas!" -ForegroundColor Yellow
            Write-Host "   Execute: npm run dev-lab" -ForegroundColor Cyan
            
        } else {
            Write-Host "AVISO - Nenhum tunel HTTPS encontrado no ngrok" -ForegroundColor Yellow
            Write-Host "   Certifique-se de que o ngrok esta rodando e tem um tunel HTTPS ativo" -ForegroundColor White
        }
    } else {
        Write-Host "AVISO - Nenhum tunel encontrado no ngrok" -ForegroundColor Yellow
        Write-Host "   Certifique-se de que o ngrok esta rodando" -ForegroundColor White
    }
} catch {
    Write-Host "ERRO - Erro ao conectar a API do ngrok: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Dica: Certifique-se de que:" -ForegroundColor Yellow
    Write-Host "   1. O ngrok esta rodando (Terminal 2)" -ForegroundColor White
    Write-Host "   2. A API do ngrok esta acessivel em http://127.0.0.1:4040" -ForegroundColor White
    Write-Host "   3. Voce pode verificar acessando: http://127.0.0.1:4040" -ForegroundColor White
}

Write-Host ""
