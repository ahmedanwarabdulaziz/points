# Push to GitHub Script
# This script commits and pushes all changes to GitHub

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Pushing Points Redeem App to GitHub" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if git remote exists
$remoteExists = git remote get-url origin 2>$null
if (-not $remoteExists) {
    Write-Host "Adding GitHub remote..." -ForegroundColor Yellow
    git remote add origin https://github.com/ahmedanwarabdulaziz/points.git
}

# Show current status
Write-Host "Current Git Status:" -ForegroundColor Yellow
git status --short

Write-Host ""
Write-Host "Adding all files..." -ForegroundColor Yellow
git add -A

Write-Host "Committing changes..." -ForegroundColor Yellow
$commitMessage = Read-Host "Enter commit message (or press Enter for default)"
if ([string]::IsNullOrWhiteSpace($commitMessage)) {
    $commitMessage = "Update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

git commit -m $commitMessage

Write-Host ""
Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push -u origin master

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "View your code at:" -ForegroundColor Cyan
Write-Host "https://github.com/ahmedanwarabdulaziz/points" -ForegroundColor White
Write-Host ""

pause

