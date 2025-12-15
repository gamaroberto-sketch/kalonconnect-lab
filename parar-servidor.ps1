# Script rápido para parar processos Node.js na porta 3001
# Execute: .\parar-servidor.ps1

Write-Host "🔍 Procurando processos na porta 3001..." -ForegroundColor Cyan

$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "⚠️  Encontrado(s) processo(s) na porta 3001:" -ForegroundColor Yellow
    
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   PID: $pid - $($process.ProcessName)" -ForegroundColor White
                Write-Host "🛑 Parando processo $pid..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force
                Write-Host "✅ Processo parado!" -ForegroundColor Green
            }
        } catch {
            Write-Host "⚠️  Erro ao parar processo $pid: $_" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Write-Host "✅ Pronto! Agora você pode iniciar o servidor com: npm run dev-lab" -ForegroundColor Green
} else {
    Write-Host "✅ Nenhum processo encontrado na porta 3001" -ForegroundColor Green
}

Write-Host ""









