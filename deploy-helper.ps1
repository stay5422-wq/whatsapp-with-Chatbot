# Quick Deployment Script for PowerShell

Write-Host "🚀 WhatsApp Server - Deployment Helper" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path .git)) {
    Write-Host "⚠️  Git not initialized. Initializing..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
}

# Add all files
Write-Host "📦 Adding files..." -ForegroundColor Yellow
git add .

# Commit
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
$commitMessage = "Fix: Add Chrome/Puppeteer dependencies for WhatsApp bot"
git commit -m $commitMessage

# Check if remote exists
$remoteExists = git remote | Select-String "origin"

if (-not $remoteExists) {
    Write-Host ""
    Write-Host "⚠️  No Git remote configured" -ForegroundColor Yellow
    Write-Host "Please add your GitHub repository:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
    git push origin main
    
    Write-Host ""
    Write-Host "✅ SUCCESS! Code pushed to GitHub" -ForegroundColor Green
    Write-Host ""
}

Write-Host "📚 Next Steps:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Choose a deployment platform:" -ForegroundColor White
Write-Host "   • Railway.app (Recommended) - Easiest" -ForegroundColor Gray
Write-Host "   • Render.com - Good free tier" -ForegroundColor Gray
Write-Host "   • Fly.io - Global deployment" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Connect your GitHub repository" -ForegroundColor White
Write-Host ""
Write-Host "3. Deploy and check logs for QR code" -ForegroundColor White
Write-Host ""
Write-Host "📖 See guides:" -ForegroundColor Cyan
Write-Host "   • QUICK_CHROME_FIX.md - Quick reference" -ForegroundColor Gray
Write-Host "   • CHROME_FIX.md - Detailed guide" -ForegroundColor Gray
Write-Host "   • DEPLOYMENT_STATUS.md - Summary" -ForegroundColor Gray
Write-Host ""
