# ==========================================
# Deploy Script - Cloud Expense Tracker
# ==========================================
# Run this after you have:
# 1. Created a Neon database and copied the connection string
# 2. Created accounts on Render and Vercel
#
# Usage:
#   .\deploy.ps1 -NeonUrl "postgresql://..." -RenderUrl "https://xxx.onrender.com" -VercelUrl "https://xxx.vercel.app"

param(
    [Parameter(Mandatory=$true)]
    [string]$NeonUrl,

    [Parameter(Mandatory=$false)]
    [string]$RenderBackendUrl = "",

    [Parameter(Mandatory=$false)]
    [string]$VercelFrontendUrl = ""
)

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Cloud Expense Tracker - Deploy Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create GitHub repo (already done)
Write-Host "[1/5] GitHub repo already exists" -ForegroundColor Green
Write-Host "  https://github.com/LuciferformH/cloud-expense-tracker" -ForegroundColor Gray

# Step 2: Set up Neon
Write-Host "[2/5] Setting up Neon database..." -ForegroundColor Yellow
Write-Host "  Connection string: $($NeonUrl.Substring(0, [Math]::Min(50, $NeonUrl.Length)))..." -ForegroundColor Gray

# Step 3: Deploy Backend to Render
if (-not $RenderBackendUrl) {
    Write-Host "[3/5] Backend deployment" -ForegroundColor Yellow
    Write-Host "  Manual step required:" -ForegroundColor Red
    Write-Host "  1. Go to https://render.com" -ForegroundColor Gray
    Write-Host "  2. New > Web Service > Connect GitHub repo" -ForegroundColor Gray
    Write-Host "  3. Set root directory to 'backend'" -ForegroundColor Gray
    Write-Host "  4. Build command:" -ForegroundColor Gray
    Write-Host "     npm install && npx prisma generate --schema=prisma/schema.postgresql.prisma && npx prisma migrate deploy --schema=prisma/schema.postgresql.prisma && npm run build" -ForegroundColor DarkGray
    Write-Host "  5. Start command: node dist/server.js" -ForegroundColor Gray
    Write-Host "  6. Add env vars:" -ForegroundColor Gray
    Write-Host "     DATABASE_URL=$NeonUrl" -ForegroundColor DarkGray
    Write-Host "     JWT_SECRET=$(New-Guid | ForEach-Object { $_.ToString().Replace('-','') })" -ForegroundColor DarkGray
    Write-Host "     JWT_REFRESH_SECRET=$(New-Guid | ForEach-Object { $_.ToString().Replace('-','') })" -ForegroundColor DarkGray
} else {
    Write-Host "[3/5] Backend deployed: $RenderBackendUrl" -ForegroundColor Green
}

# Step 4: Deploy Frontend to Vercel
if (-not $VercelFrontendUrl) {
    Write-Host "[4/5] Frontend deployment" -ForegroundColor Yellow
    if ($RenderBackendUrl) {
        Write-Host "  Deploying frontend to Vercel..." -ForegroundColor Gray
        cd frontend
        $env:VITE_API_URL = "$RenderBackendUrl/api"
        npx vercel --yes --prod
        cd ..
    } else {
        Write-Host "  Manual step required:" -ForegroundColor Red
        Write-Host "  1. Go to https://vercel.com" -ForegroundColor Gray
        Write-Host "  2. Import GitHub repo > Root directory: frontend" -ForegroundColor Gray
        Write-Host "  3. Add env var: VITE_API_URL=$RenderBackendUrl/api" -ForegroundColor Gray
    }
} else {
    Write-Host "[4/5] Frontend deployed: $VercelFrontendUrl" -ForegroundColor Green
}

# Step 5: Update CORS
if ($RenderBackendUrl -and $VercelFrontendUrl) {
    Write-Host "[5/5] Updating CORS configuration..." -ForegroundColor Yellow
    Write-Host "  Update Render env vars:" -ForegroundColor Gray
    Write-Host "    CORS_ORIGIN=$VercelFrontendUrl" -ForegroundColor DarkGray
    Write-Host "    FRONTEND_URL=$VercelFrontendUrl" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Deployment Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  GitHub:    https://github.com/LuciferformH/cloud-expense-tracker" -ForegroundColor White
Write-Host "  Database:  Neon PostgreSQL" -ForegroundColor White
Write-Host "  Backend:   $RenderBackendUrl" -ForegroundColor White
Write-Host "  Frontend:  $VercelFrontendUrl" -ForegroundColor White
Write-Host ""
Write-Host "Demo login: demo@cloudexpensetracker.com / Demo1234" -ForegroundColor Green
