@echo off
cls
echo ========================================
echo Checking All Build Tools
echo ========================================
echo.

set ALL_OK=1

echo [1/3] Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo [X] Java NOT installed
    echo     Please complete STEP 1 first
    echo     Run: 1-check-java.bat
    set ALL_OK=0
) else (
    echo [OK] Java installed
    java -version 2>&1 | findstr /C:"version"
)
echo.

echo [2/3] Checking ANDROID_HOME...
if "%ANDROID_HOME%"=="" (
    echo [X] ANDROID_HOME not set
    echo     Please complete STEP 4 (Environment Variables)
    echo     Then CLOSE and REOPEN PowerShell
    set ALL_OK=0
) else (
    echo [OK] ANDROID_HOME set
    echo     Location: %ANDROID_HOME%
    if not exist "%ANDROID_HOME%" (
        echo [WARNING] Path does not exist!
        echo     Check the path in Environment Variables
        set ALL_OK=0
    )
)
echo.

echo [3/3] Checking ADB (Android Tools)...
adb version >nul 2>&1
if errorlevel 1 (
    echo [X] ADB not found
    echo     Please complete STEP 2 (Android Studio SDK)
    echo     Make sure Platform-Tools is installed
    set ALL_OK=0
) else (
    echo [OK] ADB installed
    adb version 2>&1 | findstr /C:"Version"
)
echo.

echo ========================================
if %ALL_OK%==1 (
    echo [SUCCESS] All tools ready!
    echo ========================================
    echo.
    echo You can now build your APK!
    echo.
    echo Next: Run 3-build-apk.bat
    echo.
) else (
    echo [FAILED] Some tools missing
    echo ========================================
    echo.
    echo Please complete the missing steps above.
    echo Read: LOCAL-BUILD-GUIDE.md for help
    echo.
)

pause

