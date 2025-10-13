@echo off
echo ========================================
echo Building Points Redeem App for Android
echo ========================================
echo.
echo This will build your app on Expo's servers.
echo Build time: 15-20 minutes
echo.
echo You can check progress at:
echo https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app
echo.
pause
echo.
echo Starting build...
echo.

eas build --profile production --platform android

echo.
echo ========================================
echo Build started!
echo ========================================
echo.
echo Check your build status at:
echo https://expo.dev/accounts/ahmedanwarabdulaziz/projects/points-redeem-app/builds
echo.
echo You'll get an email when it's done.
echo Then download the APK and share with users!
echo.
pause

