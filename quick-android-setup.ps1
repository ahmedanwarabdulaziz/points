# Quick Android Setup Script
# This script will help you build and run your app on Android

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Points Redeem App - Android Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if running from correct directory
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the points-redeem-app directory" -ForegroundColor Red
    exit 1
}

Write-Host "Step 1: Installing required dependencies..." -ForegroundColor Green
npm install --legacy-peer-deps

Write-Host "`nStep 2: Installing EAS CLI..." -ForegroundColor Green
npm install -g eas-cli

Write-Host "`nStep 3: Installing expo-dev-client..." -ForegroundColor Green
npm install expo-dev-client --legacy-peer-deps

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan

Write-Host "`nNext Steps:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Login to Expo (create account if needed):" -ForegroundColor White
Write-Host "   eas login" -ForegroundColor Cyan
Write-Host ""
Write-Host "2. Configure EAS:" -ForegroundColor White
Write-Host "   eas build:configure" -ForegroundColor Cyan
Write-Host ""
Write-Host "3. Build for Android (takes 15-20 min):" -ForegroundColor White
Write-Host "   eas build --profile development --platform android" -ForegroundColor Cyan
Write-Host ""
Write-Host "4. After build completes:" -ForegroundColor White
Write-Host "   - Download the APK from the link provided" -ForegroundColor White
Write-Host "   - Install it on your Android device" -ForegroundColor White
Write-Host "   - Run: npm start --dev-client" -ForegroundColor Cyan
Write-Host "   - Open the app on your device" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$response = Read-Host "Do you want to login to Expo now? (y/n)"
if ($response -eq "y" -or $response -eq "Y") {
    Write-Host "`nLogging into Expo..." -ForegroundColor Green
    eas login
    
    Write-Host "`nConfiguring EAS build..." -ForegroundColor Green
    eas build:configure
    
    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "Ready to build!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    
    $build = Read-Host "Do you want to start building for Android now? (y/n)"
    if ($build -eq "y" -or $build -eq "Y") {
        Write-Host "`nStarting build... This will take 15-20 minutes." -ForegroundColor Yellow
        Write-Host "You can check progress at https://expo.dev" -ForegroundColor Cyan
        Write-Host ""
        eas build --profile development --platform android
    } else {
        Write-Host "`nWhen ready to build, run:" -ForegroundColor Yellow
        Write-Host "eas build --profile development --platform android" -ForegroundColor Cyan
    }
} else {
    Write-Host "`nWhen ready, run these commands:" -ForegroundColor Yellow
    Write-Host "1. eas login" -ForegroundColor Cyan
    Write-Host "2. eas build:configure" -ForegroundColor Cyan
    Write-Host "3. eas build --profile development --platform android" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "For more details, see ANDROID_RUN_GUIDE.md" -ForegroundColor Gray

