@echo off
echo Checking Java installation...
echo.
java -version
if errorlevel 1 (
    echo.
    echo [X] Java NOT found!
    echo Please install Java JDK 17 from:
    echo https://adoptium.net/temurin/releases/
    echo.
    echo Make sure to:
    echo - Check "Set JAVA_HOME variable"
    echo - Check "Add to PATH"
    echo.
) else (
    echo.
    echo [OK] Java is installed correctly!
    echo.
    echo JAVA_HOME: %JAVA_HOME%
    echo.
)
pause

