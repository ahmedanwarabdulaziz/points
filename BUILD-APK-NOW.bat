@echo off
cls
echo ========================================
echo Build APK Locally - Step by Step
echo ========================================
echo.

REM Check prerequisites
echo Checking prerequisites...
echo.

echo Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo [X] Java NOT found!
    echo.
    echo Please install Java JDK 17 first:
    echo https://adoptium.net/temurin/releases/
    echo.
    echo Or read: INSTALL-BUILD-TOOLS.md
    echo.
    pause
    exit /b 1
)
echo [OK] Java installed
echo.

echo Checking Android SDK...
if "%ANDROID_HOME%"=="" (
    echo [X] ANDROID_HOME not set!
    echo.
    echo Please install Android Studio and set ANDROID_HOME
    echo Read: INSTALL-BUILD-TOOLS.md
    echo.
    pause
    exit /b 1
)
echo [OK] Android SDK found at: %ANDROID_HOME%
echo.

echo ========================================
echo All prerequisites met! Ready to build!
echo ========================================
echo.
pause

echo.
echo Step 1: Installing dependencies...
echo ========================================
call npm install
if errorlevel 1 (
    echo Failed to install dependencies!
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

echo Step 2: Generating Android project...
echo ========================================
echo This creates the native Android code...
echo.
call npx expo prebuild --platform android --clean
if errorlevel 1 (
    echo Failed to generate Android project!
    pause
    exit /b 1
)
echo [OK] Android project generated
echo.

echo Step 3: Building APK...
echo ========================================
echo This may take 5-10 minutes...
echo.
cd android
call gradlew.bat assembleRelease
if errorlevel 1 (
    echo Build failed!
    cd ..
    pause
    exit /b 1
)
cd ..
echo.
echo [OK] APK built successfully!
echo.

echo ========================================
echo SUCCESS! APK is ready!
echo ========================================
echo.
echo Your APK is located at:
echo android\app\build\outputs\apk\release\app-release.apk
echo.
echo File size: 
for %%A in ("android\app\build\outputs\apk\release\app-release.apk") do echo %%~zA bytes
echo.

echo ========================================
echo Next Steps:
echo ========================================
echo.
echo 1. Copy APK to Vercel folder:
echo    copy android\app\build\outputs\apk\release\app-release.apk vercel-download\public\points-redeem.apk
echo.
echo 2. Deploy to Vercel:
echo    Go to https://vercel.com
echo    Import your GitHub repo
echo    Set root to: vercel-download
echo    Deploy!
echo.
echo 3. Share your Vercel URL!
echo.

set /p COPY_APK="Copy APK to Vercel folder now? (Y/N): "
if /i "%COPY_APK%"=="Y" (
    echo.
    echo Copying APK...
    copy /Y "android\app\build\outputs\apk\release\app-release.apk" "vercel-download\public\points-redeem.apk"
    echo.
    echo [OK] APK copied to: vercel-download\public\points-redeem.apk
    echo.
    echo Now deploy to Vercel: https://vercel.com
    echo.
)

pause

