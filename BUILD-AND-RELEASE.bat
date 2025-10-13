@echo off
cls
echo ========================================
echo Build APK and Create GitHub Release
echo ========================================
echo.
echo This script will:
echo   1. Build your Android APK using EAS
echo   2. Help you create a GitHub Release
echo   3. Make your app downloadable
echo.
echo Time needed: ~20 minutes (mostly waiting for build)
echo.
pause

REM Change to the script directory
cd /d "%~dp0"

echo.
echo ========================================
echo Step 1: Building APK
echo ========================================
echo.
echo Starting EAS build...
echo (This uploads your code and builds the APK)
echo.

call npx eas-cli build --profile production --platform android --non-interactive

echo.
echo ========================================
echo Build Started!
echo ========================================
echo.
echo Your build is now in progress on Expo servers.
echo.
echo You can track it at:
echo https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds
echo.
echo You'll receive an email when the build completes.
echo.
echo ========================================
echo What to do next:
echo ========================================
echo.
echo 1. Wait for the build email (15-20 minutes)
echo 2. Download the APK from the link in the email
echo 3. Run: create-github-release.ps1
echo 4. Upload the APK when prompted
echo 5. Share the GitHub release link!
echo.
echo The download link will be:
echo https://github.com/ahmedanwarabdulaziz/points/releases/latest
echo.

pause

