@echo off
REM Get current ngrok public URL (Windows)
REM Usage: scripts\get-ngrok-url.bat

REM Static domain configured in docker-compose.yml
set STATIC_DOMAIN=gabrielle-polymeric-iconoclastically.ngrok-free.dev

echo Getting ngrok public URL...
echo.

REM Check if ngrok container is running
docker ps --format "{{.Names}}" | findstr /r "^ngrok$" >nul 2>&1
if errorlevel 1 (
    echo Error: ngrok container is not running
    echo Start it with: docker-compose -f microservices/docker-compose/docker-compose.yml up -d ngrok
    exit /b 1
)

echo Ngrok is running with STATIC DOMAIN!
echo.
echo Static URL: https://%STATIC_DOMAIN%
echo Web UI:     http://localhost:4040
echo.
echo Test with:
echo   curl https://%STATIC_DOMAIN%
echo.
echo This URL is PERMANENT - never changes on restart!
echo Share this with your team: https://%STATIC_DOMAIN%
