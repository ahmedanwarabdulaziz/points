@echo off
cls
echo ========================================
echo Checking Java Installation
echo ========================================
echo.
java -version
if errorlevel 1 (
    echo.
    echo [X] Java NOT installed yet!
    echo.
    echo Please install Java JDK 17 from the page I opened.
    echo Make sure to check:
    echo   - Set JAVA_HOME variable
    echo   - Add to PATH
    echo.
    echo After installation, CLOSE this window and run this script again.
    echo.
) else (
    echo.
    echo ========================================
    echo [SUCCESS] Java is installed!
    echo ========================================
    echo.
    echo JAVA_HOME: %JAVA_HOME%
    echo.
    echo You can now move to STEP 2: Install Android Studio
    echo.
)
pause

