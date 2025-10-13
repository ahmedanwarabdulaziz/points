# Android Environment Setup Script for Windows
# Run this script as Administrator AFTER installing Android Studio

Write-Host "Setting up Android Environment Variables..." -ForegroundColor Green

# Default Android SDK path
$androidHome = "$env:LOCALAPPDATA\Android\Sdk"

# Check if SDK exists
if (Test-Path $androidHome) {
    Write-Host "Android SDK found at: $androidHome" -ForegroundColor Green
    
    # Set ANDROID_HOME environment variable (User level)
    [Environment]::SetEnvironmentVariable("ANDROID_HOME", $androidHome, "User")
    Write-Host "ANDROID_HOME set to: $androidHome" -ForegroundColor Green
    
    # Set ANDROID_SDK_ROOT environment variable (User level)
    [Environment]::SetEnvironmentVariable("ANDROID_SDK_ROOT", $androidHome, "User")
    Write-Host "ANDROID_SDK_ROOT set to: $androidHome" -ForegroundColor Green
    
    # Get current PATH
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "User")
    
    # Add platform-tools to PATH if not already there
    $platformTools = "$androidHome\platform-tools"
    if ($currentPath -notlike "*$platformTools*") {
        $newPath = "$currentPath;$platformTools"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "Added platform-tools to PATH" -ForegroundColor Green
    } else {
        Write-Host "platform-tools already in PATH" -ForegroundColor Yellow
    }
    
    # Add emulator to PATH if not already there
    $emulator = "$androidHome\emulator"
    if ($currentPath -notlike "*$emulator*") {
        $newPath = [Environment]::GetEnvironmentVariable("Path", "User")
        $newPath = "$newPath;$emulator"
        [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
        Write-Host "Added emulator to PATH" -ForegroundColor Green
    } else {
        Write-Host "emulator already in PATH" -ForegroundColor Yellow
    }
    
    # Add tools\bin to PATH if not already there
    $toolsBin = "$androidHome\tools\bin"
    if (Test-Path $toolsBin) {
        if ($currentPath -notlike "*$toolsBin*") {
            $newPath = [Environment]::GetEnvironmentVariable("Path", "User")
            $newPath = "$newPath;$toolsBin"
            [Environment]::SetEnvironmentVariable("Path", $newPath, "User")
            Write-Host "Added tools\bin to PATH" -ForegroundColor Green
        } else {
            Write-Host "tools\bin already in PATH" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n================================================" -ForegroundColor Cyan
    Write-Host "Setup Complete!" -ForegroundColor Green
    Write-Host "================================================" -ForegroundColor Cyan
    Write-Host "`nIMPORTANT: You MUST restart your terminal/IDE for changes to take effect!" -ForegroundColor Yellow
    Write-Host "`nTo verify the setup after restarting, run:" -ForegroundColor Cyan
    Write-Host "  adb --version" -ForegroundColor White
    Write-Host "  echo `$env:ANDROID_HOME" -ForegroundColor White
    
} else {
    Write-Host "ERROR: Android SDK not found at: $androidHome" -ForegroundColor Red
    Write-Host "`nPlease install Android Studio first from: https://developer.android.com/studio" -ForegroundColor Yellow
    Write-Host "`nAfter installation, open Android Studio and complete the setup wizard." -ForegroundColor Yellow
    Write-Host "Then run this script again." -ForegroundColor Yellow
}

