# Docker Verification Script
Write-Host "Checking Docker status..." -ForegroundColor Yellow

# Check if Docker is running
try {
    $dockerVersion = docker --version 2>$null
    Write-Host "Docker installed: $dockerVersion" -ForegroundColor Green
    
    # Test Docker daemon
    docker ps 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Docker daemon is running!" -ForegroundColor Green
        Write-Host "Ready to run: npm run dev" -ForegroundColor Cyan
        
        # Check Docker Compose
        try {
            $composeVersion = docker-compose --version 2>$null
            Write-Host "Docker Compose available: $composeVersion" -ForegroundColor Green
        } catch {
            Write-Host "Docker Compose not found" -ForegroundColor Yellow
        }
        
        exit 0
    } else {
        Write-Host "Docker daemon is not running" -ForegroundColor Red
        Write-Host "Please start Docker Desktop manually:" -ForegroundColor Yellow
        Write-Host "   1. Press Windows + R" -ForegroundColor White
        Write-Host "   2. Type: %ProgramFiles%\Docker\Docker\Docker Desktop.exe" -ForegroundColor White
        Write-Host "   3. Wait for Docker to start (30-60 seconds)" -ForegroundColor White
        Write-Host "   4. Run this script again" -ForegroundColor White
        exit 1
    }
} catch {
    Write-Host "Docker is not installed or not found in PATH" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}
