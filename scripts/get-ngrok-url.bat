@echo off
REM Get current ngrok public URL (Windows)
REM Usage: scripts\get-ngrok-url.bat

echo Getting ngrok public URL...
echo.

REM Check if ngrok container is running
docker ps --format "{{.Names}}" | findstr /r "^ngrok$" >nul 2>&1
if errorlevel 1 (
    echo Error: ngrok container is not running
    echo Start it with: docker-compose -f microservices/docker-compose/docker-compose.yml up -d ngrok
    exit /b 1
)

REM Get the public URL from ngrok API
for /f "delims=" %%i in ('curl -s http://localhost:4040/api/tunnels ^| python -c "import sys, json; print(json.load(sys.stdin)['tunnels'][0]['public_url'])"') do set PUBLIC_URL=%%i

if "%PUBLIC_URL%"=="" (
    echo Error: Could not get ngrok URL
    echo Check ngrok logs: docker logs ngrok
    exit /b 1
)

echo Ngrok is running!
echo.
echo Public URL: %PUBLIC_URL%
echo Web UI:     http://localhost:4040
echo.
echo Test with:
echo   curl %PUBLIC_URL%
echo.
echo Note: Free ngrok URLs change on each restart
echo       For static URLs, upgrade to ngrok paid plan
