@echo off
cls
echo ========================================
echo Pushing Points Redeem App to GitHub
echo ========================================
echo.

REM Change to the script directory
cd /d "%~dp0"

echo Step 1: Checking Git status...
echo.
git status
echo.

echo Step 2: Adding all files...
echo.
git add -A
echo.

echo Step 3: Creating commit...
echo.
git commit -m "Points Redeem App - Complete codebase with GitHub distribution"
echo.

echo Step 4: Checking remote...
echo.
git remote -v
echo.

REM Add remote if it doesn't exist
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo Adding GitHub remote...
    git remote add origin https://github.com/ahmedanwarabdulaziz/points.git
    echo.
)

echo Step 5: Renaming branch to main...
echo.
git branch -M main
echo.

echo Step 6: Pushing to GitHub...
echo.
echo NOTE: You may need to authenticate with GitHub!
echo.
git push -u origin main
echo.

if errorlevel 0 (
    echo ========================================
    echo SUCCESS! Code pushed to GitHub!
    echo ========================================
    echo.
    echo View your repository at:
    echo https://github.com/ahmedanwarabdulaziz/points
    echo.
    echo Next steps:
    echo 1. Build APK: Run build-local-apk.ps1
    echo 2. Wait 15-20 minutes for build
    echo 3. Create release: Run create-github-release.ps1
    echo.
) else (
    echo ========================================
    echo Push may have failed or needs authentication
    echo ========================================
    echo.
    echo If you see authentication errors:
    echo 1. You may need to login to GitHub in browser
    echo 2. Or setup Git credentials
    echo 3. Try running: gh auth login
    echo.
)

pause

