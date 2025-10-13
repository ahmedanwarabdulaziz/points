@echo off
echo ========================================
echo Points Redeem App - GitHub Distribution
echo ========================================
echo.
echo This will help you distribute your app via GitHub
echo (No waiting in Expo's build queue!)
echo.
echo Choose an option:
echo.
echo 1. Push code to GitHub
echo 2. Build APK (takes 15-20 min)
echo 3. Create GitHub Release with APK
echo 4. Do everything (Steps 1, 2, 3)
echo 5. Open setup guide
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Running: Push to GitHub...
    powershell -ExecutionPolicy Bypass -File push-to-github.ps1
) else if "%choice%"=="2" (
    echo.
    echo Running: Build APK...
    powershell -ExecutionPolicy Bypass -File build-local-apk.ps1
) else if "%choice%"=="3" (
    echo.
    echo Running: Create GitHub Release...
    powershell -ExecutionPolicy Bypass -File create-github-release.ps1
) else if "%choice%"=="4" (
    echo.
    echo Running: Complete workflow...
    echo.
    echo Step 1: Pushing to GitHub...
    powershell -ExecutionPolicy Bypass -File push-to-github.ps1
    echo.
    echo Step 2: Building APK...
    powershell -ExecutionPolicy Bypass -File build-local-apk.ps1
    echo.
    echo After build completes (15-20 min), run this again and choose option 3
    echo Or manually run: create-github-release.ps1
    pause
) else if "%choice%"=="5" (
    echo.
    echo Opening setup guide...
    start GITHUB_DOWNLOAD_SETUP.md
) else (
    echo.
    echo Invalid choice!
)

echo.
pause

