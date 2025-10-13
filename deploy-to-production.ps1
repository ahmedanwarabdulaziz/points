# Deploy to Production Script
# This script helps you build and deploy updates to your Android app

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Points Redeem App - Deployment Tool" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if in correct directory
if (!(Test-Path "package.json")) {
    Write-Host "ERROR: Please run this script from the points-redeem-app directory" -ForegroundColor Red
    exit 1
}

# Check if EAS CLI is installed
$easInstalled = Get-Command eas -ErrorAction SilentlyContinue
if (!$easInstalled) {
    Write-Host "EAS CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g eas-cli
}

Write-Host "What would you like to do?" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Build new APK (production)" -ForegroundColor White
Write-Host "2. Push update (no rebuild needed)" -ForegroundColor White
Write-Host "3. Build preview APK (testing)" -ForegroundColor White
Write-Host "4. Push preview update" -ForegroundColor White
Write-Host "5. Check build status" -ForegroundColor White
Write-Host "6. Setup EAS (first time)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

switch ($choice) {
    "1" {
        Write-Host "`nBuilding production APK..." -ForegroundColor Green
        Write-Host "This will take 15-20 minutes." -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "Continue? (y/n)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            eas build --profile production --platform android
            
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "Build started!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "`nCheck status at: https://expo.dev" -ForegroundColor Cyan
            Write-Host "You'll get a download link when it's done!" -ForegroundColor White
        }
    }
    
    "2" {
        Write-Host "`nPushing update to production..." -ForegroundColor Green
        $message = Read-Host "Enter update message (e.g., 'Fixed login bug')"
        
        if ($message) {
            eas update --branch production --message "$message"
            
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "Update pushed successfully!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "`nUsers will get the update next time they open the app!" -ForegroundColor White
        } else {
            Write-Host "Update message is required!" -ForegroundColor Red
        }
    }
    
    "3" {
        Write-Host "`nBuilding preview APK..." -ForegroundColor Green
        Write-Host "This is for testing before production release." -ForegroundColor Yellow
        Write-Host ""
        
        $confirm = Read-Host "Continue? (y/n)"
        if ($confirm -eq "y" -or $confirm -eq "Y") {
            eas build --profile preview --platform android
            
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "Preview build started!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
            Write-Host "`nCheck status at: https://expo.dev" -ForegroundColor Cyan
        }
    }
    
    "4" {
        Write-Host "`nPushing update to preview..." -ForegroundColor Green
        $message = Read-Host "Enter update message"
        
        if ($message) {
            eas update --branch preview --message "$message"
            
            Write-Host "`n========================================" -ForegroundColor Cyan
            Write-Host "Preview update pushed!" -ForegroundColor Green
            Write-Host "========================================" -ForegroundColor Cyan
        } else {
            Write-Host "Update message is required!" -ForegroundColor Red
        }
    }
    
    "5" {
        Write-Host "`nOpening Expo dashboard..." -ForegroundColor Green
        Start-Process "https://expo.dev"
        Write-Host "Check your build status in the browser!" -ForegroundColor Cyan
    }
    
    "6" {
        Write-Host "`nSetting up EAS..." -ForegroundColor Green
        Write-Host ""
        
        Write-Host "Step 1: Login to Expo" -ForegroundColor Yellow
        eas login
        
        Write-Host "`nStep 2: Configure project" -ForegroundColor Yellow
        eas build:configure
        
        Write-Host "`n========================================" -ForegroundColor Cyan
        Write-Host "Setup complete!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Cyan
        Write-Host "`nIMPORTANT: Copy your project ID and update app.config.js" -ForegroundColor Yellow
        Write-Host "Replace 'your-project-id-here' with your actual project ID" -ForegroundColor White
    }
    
    default {
        Write-Host "Invalid choice!" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "For more help, see DEPLOYMENT_GUIDE.md" -ForegroundColor Gray

