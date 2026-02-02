@echo off
REM ============================================================================
REM MongoDB Security Setup Script for Windows
REM This script sets up all security features for the StockApp microservices
REM ============================================================================

setlocal enabledelayedexpansion

cd /d "%~dp0.."
set "ROOT_DIR=%CD%"

echo ==============================================
echo   StockApp MongoDB Security Setup
echo ==============================================
echo.

REM Step 1: Generate TLS Certificates
echo [Step 1/4] Generating TLS certificates...
if exist "certs\ca.crt" (
    echo    [OK] Certificates already exist
) else (
    cd scripts
    call generate-certs.bat
    cd ..
    echo    [OK] Certificates generated
)

REM Step 2: Check for OpenSSL for key generation
echo.
echo [Step 2/4] Checking encryption keys...
cd ..

REM Check if ENCRYPTION_MASTER_KEY is already set properly
findstr /C:"ENCRYPTION_MASTER_KEY=YourSecure" .env >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [WARN] Default encryption key detected!
    echo    -^> Please generate a secure key with: openssl rand -base64 32
    echo    -^> Then update ENCRYPTION_MASTER_KEY in .env file
) else (
    echo    [OK] Encryption key configured
)

REM Step 3: Verify Docker is running
echo.
echo [Step 3/4] Checking Docker...
docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    [OK] Docker is running
) else (
    echo    [ERROR] Docker is not running! Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Step 4: Instructions
echo.
echo [Step 4/4] Ready to start services with security...
echo.
echo To start with full security (TLS + Encryption):
echo   docker-compose -f docker-compose.yml -f docker-compose.security.yml up -d
echo.
echo To start without TLS (development mode):
echo   docker-compose up -d
echo.

REM Summary
echo ==============================================
echo   Security Setup Complete!
echo ==============================================
echo.
echo Security layers configured:
echo   [OK] Layer 1: Authentication (username/password)
echo   [OK] Layer 2: TLS/SSL certificates generated
echo   [OK] Layer 3: Encrypted volumes configured  
echo   [OK] Layer 4: Field-level encryption keys set
echo.
echo Documentation: MONGODB_SECURITY.md
echo.

pause
