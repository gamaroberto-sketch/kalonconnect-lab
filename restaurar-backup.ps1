# Script para restaurar backup do ngrok
# Execute: .\restaurar-backup.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESTAURACAO DE BACKUP NGROK" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Listar backups disponiveis
$backups = Get-ChildItem -Directory -Filter "backup_ngrok_*" | Sort-Object Name -Descending

if ($backups.Count -eq 0) {
    Write-Host "ERRO - Nenhum backup encontrado!" -ForegroundColor Red
    exit 1
}

Write-Host "Backups disponiveis:" -ForegroundColor Yellow
Write-Host ""
$index = 1
foreach ($backup in $backups) {
    $date = $backup.Name -replace "backup_ngrok_", ""
    $dateFormatted = $date -replace "(\d{4})(\d{2})(\d{2})_(\d{2})(\d{2})(\d{2})", '$3/$2/$1 $4:$5:$6'
    Write-Host "  $index. $($backup.Name) ($dateFormatted)" -ForegroundColor White
    $index++
}
Write-Host ""

# Selecionar backup
$selected = Read-Host "Digite o numero do backup para restaurar (ou Enter para o mais recente)"
if ([string]::IsNullOrWhiteSpace($selected)) {
    $selectedBackup = $backups[0]
} else {
    $selectedIndex = [int]$selected - 1
    if ($selectedIndex -ge 0 -and $selectedIndex -lt $backups.Count) {
        $selectedBackup = $backups[$selectedIndex]
    } else {
        Write-Host "ERRO - Numero invalido!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "Restaurando backup: $($selectedBackup.Name)" -ForegroundColor Cyan
Write-Host ""

# Confirmar
$confirm = Read-Host "Tem certeza que deseja restaurar? (s/n)"
if ($confirm -ne "s" -and $confirm -ne "S") {
    Write-Host "Operacao cancelada." -ForegroundColor Yellow
    exit 0
}

# Restaurar arquivos
Write-Host "Restaurando arquivos..." -ForegroundColor Yellow

$filesRestored = 0
$files = Get-ChildItem -Path $selectedBackup.FullName -File

foreach ($file in $files) {
    try {
        Copy-Item $file.FullName -Destination $file.Name -Force
        Write-Host "  OK - $($file.Name)" -ForegroundColor Green
        $filesRestored++
    } catch {
        Write-Host "  ERRO - $($file.Name): $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "RESTAURACAO CONCLUIDA!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Arquivos restaurados: $filesRestored" -ForegroundColor White
Write-Host ""



