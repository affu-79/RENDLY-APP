# RENDLY MVP Setup Script (Windows)

Write-Host "========================================" -ForegroundColor Blue
Write-Host "RENDLY MVP - Setup & Installation" -ForegroundColor Blue
Write-Host "========================================" -ForegroundColor Blue

# Check Node.js
$nodeVersion = node --version 2>$null
if ($null -eq $nodeVersion) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green

# Check Docker
$dockerVersion = docker --version 2>$null
if ($null -ne $dockerVersion) {
    Write-Host "✅ $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "⚠️  Docker not found (optional)" -ForegroundColor Yellow
}

$ProjectRoot = (Get-Item $PSScriptRoot).Parent.FullName
Write-Host "`n📁 Project Root: $ProjectRoot" -ForegroundColor Blue

# Create .env files
Write-Host "`n📝 Creating environment files..." -ForegroundColor Yellow

if (-not (Test-Path "$ProjectRoot/backend/.env")) {
    Copy-Item "$ProjectRoot/backend/.env.example" "$ProjectRoot/backend/.env"
    Write-Host "✅ Created backend/.env" -ForegroundColor Green
}

if (-not (Test-Path "$ProjectRoot/frontend/.env.local")) {
    @"
NEXT_PUBLIC_API_URL=http://localhost:80
NEXT_PUBLIC_WS_URL=ws://localhost:80
"@ | Out-File "$ProjectRoot/frontend/.env.local"
    Write-Host "✅ Created frontend/.env.local" -ForegroundColor Green
}

# Install dependencies
Write-Host "`n📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location "$ProjectRoot/backend"
npm install
Write-Host "✅ Backend ready" -ForegroundColor Green

Write-Host "`n📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location "$ProjectRoot/frontend"
npm install
Write-Host "✅ Frontend ready" -ForegroundColor Green

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

Write-Host "`nNext Steps:" -ForegroundColor Blue
Write-Host "1. Update backend\.env with credentials"
Write-Host "2. Start Docker: docker-compose -f backend/docker-compose.yml up -d"
Write-Host "3. Run backend: cd backend && npm run dev"
Write-Host "4. Run frontend: cd frontend && npm run dev"
