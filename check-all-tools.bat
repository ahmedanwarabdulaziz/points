@echo off
cls
echo ========================================
echo Checking Build Tools Installation
echo ========================================
echo.

set ALL_OK=1

echo [1/3] Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo [X] Java NOT found
    echo     Install from: https://adoptium.net/temurin/releases/
    set ALL_OK=0
) else (
    echo [OK] Java installed
    java -version 2>&1 | findstr /C:"version"
)
echo.

echo [2/3] Checking Android SDK...
if "%ANDROID_HOME%"=="" (
    echo [X] ANDROID_HOME not set
    echo     Set to: C:\Users\YourName\AppData\Local\Android\Sdk
    set ALL_OK=0
) else (
    echo [OK] ANDROID_HOME set
    echo     Location: %ANDROID_HOME%
)
echo.

echo [3/3] Checking ADB...
adb version >nul 2>&1
if errorlevel 1 (
    echo [X] ADB not found
    echo     Make sure Android SDK Platform-Tools is installed
    set ALL_OK=0
) else (
    echo [OK] ADB installed
    adb version 2>&1 | findstr /C:"Version"
)
echo.

echo ========================================
if %ALL_OK%==1 (
    echo [SUCCESS] All tools installed correctly!
    echo You're ready to build APK!
    echo.
    echo Next step: Run BUILD-APK-NOW.bat
) else (
    echo [FAILED] Some tools are missing
    echo Please complete installation steps
    echo Read: INSTALL-BUILD-TOOLS.md
)
echo ========================================
echo.
pause

