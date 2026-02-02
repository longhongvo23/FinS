@echo off
REM =============================================================================
REM MongoDB TLS Certificate Generator for Windows
REM Requires: OpenSSL (install via choco install openssl or download from slproweb.com)
REM =============================================================================

setlocal enabledelayedexpansion

set CERTS_DIR=%~dp0..\certs
if not exist "%CERTS_DIR%" mkdir "%CERTS_DIR%"
cd /d "%CERTS_DIR%"

REM Configuration
set DAYS_VALID=3650
set COUNTRY=VN
set STATE=HoChiMinh
set CITY=HoChiMinh
set ORGANIZATION=StockApp
set OU=Security

echo ==========================================
echo MongoDB TLS Certificate Generator
echo ==========================================
echo.

REM Check if OpenSSL is available
where openssl >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ERROR: OpenSSL is not installed or not in PATH
    echo Please install OpenSSL first:
    echo   - Windows: choco install openssl
    echo   - Or download from: https://slproweb.com/products/Win32OpenSSL.html
    exit /b 1
)

REM List of MongoDB services
set SERVICES=gateway userservice notificationservice stockservice newsservice crawlservice aitoolsservice

REM =============================================================================
REM Step 1: Generate Certificate Authority (CA)
REM =============================================================================
echo [1/3] Generating Certificate Authority (CA)...

if not exist ca.key (
    REM Generate CA private key
    openssl genrsa -out ca.key 4096
    
    REM Generate CA certificate
    openssl req -x509 -new -nodes -key ca.key -sha256 -days %DAYS_VALID% -out ca.crt -subj "/C=%COUNTRY%/ST=%STATE%/L=%CITY%/O=%ORGANIZATION%/OU=%OU%/CN=StockApp-MongoDB-CA"
    
    echo    [OK] CA certificate created: ca.crt
) else (
    echo    [OK] CA already exists, skipping...
)

REM =============================================================================
REM Step 2: Generate Server Certificates
REM =============================================================================
echo.
echo [2/3] Generating server certificates...

for %%S in (%SERVICES%) do (
    set MONGO_HOST=%%S-mongodb
    set CERT_PREFIX=%%S-mongodb
    
    echo    -^> Generating certificate for !MONGO_HOST!...
    
    REM Generate private key
    openssl genrsa -out !CERT_PREFIX!.key 2048
    
    REM Create CSR
    openssl req -new -key !CERT_PREFIX!.key -out !CERT_PREFIX!.csr -subj "/C=%COUNTRY%/ST=%STATE%/L=%CITY%/O=%ORGANIZATION%/OU=%OU%/CN=!MONGO_HOST!"
    
    REM Create extension file
    (
        echo authorityKeyIdentifier=keyid,issuer
        echo basicConstraints=CA:FALSE
        echo keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
        echo subjectAltName = @alt_names
        echo.
        echo [alt_names]
        echo DNS.1 = !MONGO_HOST!
        echo DNS.2 = localhost
        echo DNS.3 = 127.0.0.1
        echo IP.1 = 127.0.0.1
    ) > !CERT_PREFIX!.ext
    
    REM Sign certificate
    openssl x509 -req -in !CERT_PREFIX!.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out !CERT_PREFIX!.crt -days %DAYS_VALID% -sha256 -extfile !CERT_PREFIX!.ext
    
    REM Create PEM file
    type !CERT_PREFIX!.key !CERT_PREFIX!.crt > !CERT_PREFIX!.pem
    
    REM Cleanup
    del !CERT_PREFIX!.csr !CERT_PREFIX!.ext 2>nul
    
    echo    [OK] Certificate created: !CERT_PREFIX!.pem
)

REM =============================================================================
REM Step 3: Generate Client Certificates
REM =============================================================================
echo.
echo [3/3] Generating client certificates...

for %%S in (%SERVICES%) do (
    set CLIENT_PREFIX=%%S-client
    
    echo    -^> Generating client certificate for %%S...
    
    openssl genrsa -out !CLIENT_PREFIX!.key 2048
    openssl req -new -key !CLIENT_PREFIX!.key -out !CLIENT_PREFIX!.csr -subj "/C=%COUNTRY%/ST=%STATE%/L=%CITY%/O=%ORGANIZATION%/OU=%OU%/CN=%%S"
    openssl x509 -req -in !CLIENT_PREFIX!.csr -CA ca.crt -CAkey ca.key -CAcreateserial -out !CLIENT_PREFIX!.crt -days %DAYS_VALID% -sha256
    
    type !CLIENT_PREFIX!.key !CLIENT_PREFIX!.crt > !CLIENT_PREFIX!.pem
    del !CLIENT_PREFIX!.csr 2>nul
    
    echo    [OK] Client certificate created: !CLIENT_PREFIX!.pem
)

REM =============================================================================
REM Create Java truststore
REM =============================================================================
echo.
echo Creating Java truststore...

del truststore.jks 2>nul
keytool -import -trustcacerts -alias mongodb-ca -file ca.crt -keystore truststore.jks -storepass changeit -noprompt

echo    [OK] Java truststore created: truststore.jks

REM =============================================================================
REM Summary
REM =============================================================================
echo.
echo ==========================================
echo Certificate Generation Complete!
echo ==========================================
echo.
echo Generated files in %CERTS_DIR%:
echo   - ca.crt (Certificate Authority)
echo   - ca.key (CA Private Key - KEEP SECRET!)
echo   - *-mongodb.pem (MongoDB server certificates)
echo   - *-client.pem (Client certificates)
echo   - truststore.jks (Java truststore)
echo.

endlocal
