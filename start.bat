@echo off
setlocal
cd /d "%~dp0"
title StoreForge Platform - Production Release
echo.
echo ========================================================
echo    StoreForge Platform -- Production Server Launcher
echo    NestJS REST API (:8585)
echo    Next.js Storefront (:3000)
echo    Next.js Admin Portal (:4000)
echo ========================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

if not exist node_modules (
    echo [INFO] Installing production dependencies...
    call npm install --omit=dev
)

echo [INFO] Starting StoreForge Production Cluster...
node scripts\start-server.js
pause
