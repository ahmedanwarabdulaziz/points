@echo off
cls
echo ========================================
echo Building APK - Points Redeem App
echo ========================================
echo.

REM Check prerequisites first
echo Checking prerequisites...
echo.

java -version >nul 2>&1
if errorlevel 1 (
    echo [X] Java not found!
    echo.
    echo Please run: 2-check-all.bat to verify setup
    pause
    exit /b 1
)

if "%ANDROID_HOME%"=="" (
    echo [X] ANDROID_HOME not set!
    echo.
    echo Please run: 2-check-all.bat to verify setup
    pause
    exit /b 1
)

echo [OK] Prerequisites met!
echo.
echo ========================================
echo Starting APK Build
echo ========================================
echo.
echo This will take 5-10 minutes.
echo Please be patient...
echo.
pause

echo.
echo [STEP 1/3] Installing dependencies...
echo ========================================
call npm install
if errorlevel 1 (
    echo.
    echo [FAILED] Could not install dependencies
    echo Try: npm cache clean --force
    echo Then run this script again
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo [STEP 2/3] Generating Android project...
echo ========================================
echo This creates the native Android code...
echo.
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo.
    echo [FAILED] Could not generate Android project
    echo Check the error above and try again
    pause
    exit /b 1
)
echo [OK] Android project generated
echo.

echo [STEP 3/3] Building APK...
echo ========================================
echo This is the longest step (~5-10 minutes)
echo You'll see lots of output - this is normal!
echo.
cd android
call gradlew.bat assembleRelease
set BUILD_ERROR=%errorlevel%
cd ..

if %BUILD_ERROR% neq 0 (
    echo.
    echo ========================================
    echo [FAILED] APK build failed!
    echo ========================================
    echo.
    echo Common fixes:
    echo 1. Run: npm install
    echo 2. Delete android folder and try again
    echo 3. Check Java and Android SDK are properly installed
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo [SUCCESS] APK Built Successfully!
echo ========================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.

REM Check file size
for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do (
    set size=%%~zA
    set /a sizeMB=!size! / 1048576
)
echo File size: ~%sizeMB% MB
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Transfer APK to your Android phone
echo 2. Enable "Install from Unknown Sources"
echo 3. Install and test!
echo.
echo Or upload to Vercel:
echo   copy android\app\build\outputs\apk\release\app-release.apk vercel-download\public\points-redeem.apk
echo.

set /p OPEN_FOLDER="Open APK folder? (Y/N): "
if /i "%OPEN_FOLDER%"=="Y" (
    explorer android\app\build\outputs\apk\release
)

pause

