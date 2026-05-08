# EduHub: install deps and run API + Vite (needs Node.js 18+)
$ErrorActionPreference = "Stop"

$nodeDirs = @(
    "$env:ProgramFiles\nodejs",
    "${env:ProgramFiles(x86)}\nodejs",
    "$env:LOCALAPPDATA\Programs\node"
)
$npm = $null
foreach ($d in $nodeDirs) {
    $candidate = Join-Path $d "npm.cmd"
    if (Test-Path $candidate) {
        $npm = $candidate
        break
    }
}
if (-not $npm) {
    $env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [Environment]::GetEnvironmentVariable("Path", "User")
    try {
        $npmCmd = Get-Command npm -ErrorAction Stop
        $npm = $npmCmd.Source
    } catch {
        Write-Host ""
        Write-Host "Node.js was not found. Install it, then run this script again." -ForegroundColor Yellow
        Write-Host "  Option A: https://nodejs.org/ (LTS installer)" -ForegroundColor Cyan
        Write-Host "  Option B (admin PowerShell): winget install OpenJS.NodeJS.LTS --source winget" -ForegroundColor Cyan
        Write-Host ""
        exit 1
    }
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Installing dependencies..." -ForegroundColor Green
& $npm install
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $npm install --prefix server
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
& $npm install --prefix client
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host ""
Write-Host "Starting server (3001) and client (5173)..." -ForegroundColor Green
Write-Host "Open http://localhost:5173 in your browser." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

& $npm run dev
