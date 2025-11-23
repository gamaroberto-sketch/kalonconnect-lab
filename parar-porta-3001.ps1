# Script para parar processos usando a porta 3001
# Execute: .\parar-porta-3001.ps1

Write-Host "🔍 Verificando processos na porta 3001..." -ForegroundColor Cyan
Write-Host ""

# Encontrar processos usando a porta 3001
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processes) {
    Write-Host "⚠️  Processos encontrados na porta 3001:" -ForegroundColor Yellow
    Write-Host ""
    
    foreach ($pid in $processes) {
        try {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "   PID: $pid - Nome: $($process.ProcessName) - Caminho: $($process.Path)" -ForegroundColor White
            }
        } catch {
            Write-Host "   PID: $pid - (Não foi possível obter informações)" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
    $confirm = Read-Host "Deseja parar estes processos? (s/n)"
    
    if ($confirm -eq "s" -or $confirm -eq "S") {
        foreach ($pid in $processes) {
            try {
                $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                if ($process) {
                    Write-Host "🛑 Parando processo $pid ($($process.ProcessName))..." -ForegroundColor Yellow
                    Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                    Write-Host "✅ Processo $pid parado" -ForegroundColor Green
                }
            } catch {
                Write-Host "⚠️  Não foi possível parar o processo $pid" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "✅ Processos parados! Agora você pode iniciar o servidor." -ForegroundColor Green
        Write-Host ""
        Write-Host "Execute: npm run dev-lab" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
    }
} else {
    Write-Host "✅ Nenhum processo encontrado na porta 3001" -ForegroundColor Green
    Write-Host "   A porta está livre para uso." -ForegroundColor White
}

Write-Host ""



