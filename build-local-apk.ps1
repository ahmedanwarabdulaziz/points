# Build APK Locally Script
# This builds your APK using Expo EAS on your computer

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Building Points Redeem App APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if EAS CLI is installed
Write-Host "Checking EAS CLI..." -ForegroundColor Yellow
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (-not $easInstalled) {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host "✅ EAS CLI ready" -ForegroundColor Green
Write-Host ""

# Login check
Write-Host "Checking Expo login..." -ForegroundColor Yellow
eas whoami
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Expo:" -ForegroundColor Yellow
    eas login
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Starting APK Build" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""
Write-Host "This will:" -ForegroundColor Cyan
Write-Host "  1. Upload your code to Expo" -ForegroundColor White
Write-Host "  2. Build the APK (15-20 min)" -ForegroundColor White
Write-Host "  3. Provide download link" -ForegroundColor White
Write-Host ""

$confirm = Read-Host "Continue? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Build cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Building..." -ForegroundColor Green
eas build --profile production --platform android --non-interactive

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "✅ Build Started!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Track your build at:" -ForegroundColor Cyan
Write-Host "https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds" -ForegroundColor White
Write-Host ""
Write-Host "You'll get:" -ForegroundColor Yellow
Write-Host "  • Email notification when done" -ForegroundColor White
Write-Host "  • Direct download link for APK" -ForegroundColor White
Write-Host ""
Write-Host "After download, run:" -ForegroundColor Cyan
Write-Host "  .\create-github-release.ps1" -ForegroundColor White
Write-Host ""

pause

