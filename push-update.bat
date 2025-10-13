@echo off
echo ========================================
echo Push Update to Production
echo ========================================
echo.
set /p message="Enter update message (e.g., Fixed login bug): "
echo.
echo Pushing update with message: %message%
echo.

eas update --branch production --message "%message%"

echo.
echo ========================================
echo Update Pushed Successfully!
echo ========================================
echo.
echo Users will get the update next time they open the app!
echo.
pause

