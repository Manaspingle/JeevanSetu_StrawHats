# ==============================================================================
# JeevanSetu: Frontend & UI/UX Git Commit & Push Assistant
# Repository: https://github.com/Manaspingle/JeevanSetu_StrawHats.git
# ==============================================================================

param(
    [string]$CommitMessage
)

$ErrorActionPreference = "Continue"
$TargetRepo = "https://github.com/Manaspingle/JeevanSetu_StrawHats.git"

Set-Location -Path $PSScriptRoot

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "    JeevanSetu - Frontend & UI/UX Commit & Push Assistant " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Verify remote repository URL
$remoteUrl = git remote get-url origin 2>$null
if (-not $remoteUrl) {
    Write-Host "[+] Setting origin to $TargetRepo" -ForegroundColor Yellow
    git remote add origin $TargetRepo
} elseif ($remoteUrl -ne $TargetRepo) {
    Write-Host "[!] Updating origin to $TargetRepo" -ForegroundColor Yellow
    git remote set-url origin $TargetRepo
} else {
    Write-Host "[i] Remote: $remoteUrl" -ForegroundColor Gray
}

# 2. Get active branch
$currentBranch = (git branch --show-current).Trim()
if (-not $currentBranch) {
    $currentBranch = "main"
}
Write-Host "[i] Active Branch: $currentBranch" -ForegroundColor Gray

# 3. Stage ONLY frontend and UI/UX feature files
Write-Host "`n>>> Staging Frontend, UI/UX, and Feature files..." -ForegroundColor Cyan

# Explicit whitelist of frontend files & folders
$frontendTargets = @(
    "src/components",
    "src/pages",
    "src/context",
    "src/lib",
    "src/types",
    "src/domain",
    "src/services",
    "src/App.tsx",
    "src/main.tsx",
    "src/index.css",
    "src/vite-env.d.ts",
    "public",
    "index.html",
    "vite.config.ts",
    "tailwind.config.js",
    "postcss.config.js",
    "package.json",
    "package-lock.json",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "eslint.config.js",
    ".gitignore",
    "README.md",
    "commit_and_push_frontend.ps1",
    "commit_and_push_frontend.bat",
    "push_frontend_features.ps1"
)

foreach ($target in $frontendTargets) {
    if (Test-Path $target) {
        git add $target 2>$null
    }
}

# Ensure backend and test files are explicitly un-staged if accidentally tracked
$backendExcludes = @(
    "firestore.rules",
    "firestore.indexes.json",
    "firebase.json",
    "src/tests",
    "vercel.json",
    ".env.local",
    ".env.example"
)

foreach ($exclude in $backendExcludes) {
    git reset -q HEAD $exclude 2>$null
}

# Check status of staged changes
$staged = git diff --name-only --cached

if ($staged) {
    Write-Host "`n[+] Staged frontend changes:" -ForegroundColor Green
    git diff --name-status --cached

    if (-not $CommitMessage -or $CommitMessage.Trim() -eq "") {
        $inputMsg = Read-Host "`nEnter commit message (press Enter for default 'feat(ui): update frontend features and components')"
        if ($inputMsg -and $inputMsg.Trim() -ne "") {
            $CommitMessage = $inputMsg.Trim()
        } else {
            $CommitMessage = "feat(ui): update frontend features and components"
        }
    }

    Write-Host "`n>>> Committing: `"$CommitMessage`"..." -ForegroundColor Cyan
    git commit -m "$CommitMessage"
} else {
    Write-Host "`n[i] No newly staged frontend changes. Checking unpushed commits..." -ForegroundColor Yellow
}

# 4. Push to remote
Write-Host "`n>>> Pushing '$currentBranch' to GitHub ($TargetRepo)..." -ForegroundColor Cyan
git push -u origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n==========================================================" -ForegroundColor Green
    Write-Host " [SUCCESS] Pushed to GitHub successfully! " -ForegroundColor Green
    Write-Host " Repository: $TargetRepo " -ForegroundColor Green
    Write-Host "==========================================================" -ForegroundColor Green
} else {
    Write-Host "`n[ERROR] Git push failed. Please check your credentials and network connection." -ForegroundColor Red
}
