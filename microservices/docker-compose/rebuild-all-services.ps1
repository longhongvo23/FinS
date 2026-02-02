# rebuild-all-services.ps1
# Script to rebuild all microservices Docker images

$ErrorActionPreference = "Stop"

$services = @(
    "gateway",
    "userservice", 
    "notificationservice",
    "stockservice",
    "newsservice",
    "crawlservice",
    "aitoolsservice"
)

$baseDir = Split-Path -Parent $PSScriptRoot
Write-Host "Base directory: $baseDir" -ForegroundColor Cyan

foreach ($service in $services) {
    $servicePath = Join-Path $baseDir $service
    
    if (Test-Path $servicePath) {
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "Building $service..." -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        Push-Location $servicePath
        try {
            & .\mvnw clean package "-Pprod" jib:dockerBuild "-DskipTests"
            if ($LASTEXITCODE -ne 0) {
                Write-Host "ERROR: Failed to build $service" -ForegroundColor Red
                exit 1
            }
            Write-Host "SUCCESS: $service built successfully" -ForegroundColor Green
        }
        finally {
            Pop-Location
        }
    } else {
        Write-Host "WARNING: Service directory not found: $servicePath" -ForegroundColor Yellow
    }
}

# Build aiservice (Python - uses Dockerfile)
$aiservicePath = Join-Path $baseDir "aiservice"
if (Test-Path $aiservicePath) {
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "Building aiservice (Python)..." -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    
    Push-Location $aiservicePath
    try {
        docker build -t aiservice .
        if ($LASTEXITCODE -ne 0) {
            Write-Host "ERROR: Failed to build aiservice" -ForegroundColor Red
            exit 1
        }
        Write-Host "SUCCESS: aiservice built successfully" -ForegroundColor Green
    }
    finally {
        Pop-Location
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "All services built successfully!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Clean up old/dangling images
Write-Host "`nCleaning up dangling images..." -ForegroundColor Yellow
docker image prune -f

Write-Host "`nDone! Now run: docker-compose up -d" -ForegroundColor Green
