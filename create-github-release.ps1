# Create GitHub Release with APK
# This script helps you create a GitHub release and upload your APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Create GitHub Release with APK" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if GitHub CLI is installed
$ghInstalled = Get-Command gh -ErrorAction SilentlyContinue
if (-not $ghInstalled) {
    Write-Host "GitHub CLI not found. Installing..." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please install GitHub CLI from:" -ForegroundColor Red
    Write-Host "https://cli.github.com/" -ForegroundColor White
    Write-Host ""
    Write-Host "Or install with winget:" -ForegroundColor Yellow
    Write-Host "  winget install --id GitHub.cli" -ForegroundColor White
    Write-Host ""
    
    $installNow = Read-Host "Install now with winget? (Y/N)"
    if ($installNow -eq 'Y' -or $installNow -eq 'y') {
        winget install --id GitHub.cli
        Write-Host ""
        Write-Host "Please restart this script after installation." -ForegroundColor Yellow
    }
    exit
}

# Login to GitHub
Write-Host "Checking GitHub authentication..." -ForegroundColor Yellow
gh auth status 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to GitHub:" -ForegroundColor Yellow
    gh auth login
}

Write-Host "✅ GitHub CLI ready" -ForegroundColor Green
Write-Host ""

# Get version info
Write-Host "========================================" -ForegroundColor Yellow
Write-Host "Release Information" -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Yellow
Write-Host ""

$version = Read-Host "Enter version number (e.g., 1.0.0)"
if ([string]::IsNullOrWhiteSpace($version)) {
    $version = "1.0.0"
}

$releaseName = "Points Redeem App v$version"
Write-Host ""
Write-Host "Release: $releaseName" -ForegroundColor Cyan

# Ask for APK file location
Write-Host ""
Write-Host "Where is your APK file?" -ForegroundColor Yellow
Write-Host "  (Download from https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds)" -ForegroundColor Gray
Write-Host ""
$apkPath = Read-Host "Enter APK file path (or drag & drop the file here)"

# Clean up the path (remove quotes if present)
$apkPath = $apkPath.Trim('"').Trim("'")

if (-not (Test-Path $apkPath)) {
    Write-Host ""
    Write-Host "❌ APK file not found: $apkPath" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please:" -ForegroundColor Yellow
    Write-Host "  1. Download APK from Expo" -ForegroundColor White
    Write-Host "  2. Run this script again" -ForegroundColor White
    Write-Host "  3. Provide the correct path" -ForegroundColor White
    pause
    exit
}

# Rename APK to a cleaner name
$newApkName = "points-redeem-v$version.apk"
$apkDir = Split-Path $apkPath
$newApkPath = Join-Path $apkDir $newApkName

if ($apkPath -ne $newApkPath) {
    Copy-Item $apkPath $newApkPath -Force
    Write-Host "✅ APK renamed to: $newApkName" -ForegroundColor Green
}

Write-Host ""
Write-Host "Release Notes:" -ForegroundColor Yellow
$releaseNotes = @"
# Points Redeem App v$version

## 📱 Download & Install

1. **Download** the APK file below
2. **Enable** "Install from Unknown Sources" on your Android device
3. **Install** the APK
4. **Open** Points Redeem App

## ✨ Features

- 🔐 Secure authentication with Firebase
- 🎁 Points & rewards system
- 📊 Business dashboard
- 👥 Customer management
- 📱 QR code scanning
- 🔔 Push notifications

## 🆕 What's New in v$version

- Initial release with all core features
- Business profiles & customer management
- Points transaction system
- Admin dashboard

## 📞 Support

For issues or questions, visit: https://github.com/ahmedanwarabdulaziz/points/issues

---

**Installation Requirements:**
- Android 5.0 (Lollipop) or higher
- ~50 MB storage space
"@

Write-Host $releaseNotes -ForegroundColor Gray
Write-Host ""

$confirm = Read-Host "Create this release on GitHub? (Y/N)"
if ($confirm -ne 'Y' -and $confirm -ne 'y') {
    Write-Host "Release cancelled." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Creating GitHub release..." -ForegroundColor Yellow

# Create the release
gh release create "v$version" `
    $newApkPath `
    --repo ahmedanwarabdulaziz/points `
    --title "$releaseName" `
    --notes "$releaseNotes"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Green
    Write-Host "✅ Release Created Successfully!" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your APK is now available at:" -ForegroundColor Cyan
    Write-Host "https://github.com/ahmedanwarabdulaziz/points/releases/tag/v$version" -ForegroundColor White
    Write-Host ""
    Write-Host "Download link for APK:" -ForegroundColor Cyan
    Write-Host "https://github.com/ahmedanwarabdulaziz/points/releases/download/v$version/$newApkName" -ForegroundColor White
    Write-Host ""
    Write-Host "Share this link with anyone to download your app! 🎉" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ Failed to create release" -ForegroundColor Red
    Write-Host "Check the error above and try again" -ForegroundColor Yellow
}

Write-Host ""
pause

