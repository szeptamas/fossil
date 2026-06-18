[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z][a-z0-9-]*$')]
    [string]$App,

    [string]$SdkPath = "C:\git\Fossil\Fossil-HR-SDK",
    [string]$JerryScriptPath = "C:\git\Fossil\jerryscript",
    [string]$DockerImage = "ubuntu:20.04"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appPath = Join-Path $repoRoot "apps\$App"
$manifestPath = Join-Path $appPath "build\app.json"
$makefilePath = Join-Path $appPath "Makefile"
$distPath = Join-Path $repoRoot "dist"

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    throw "Docker command not found."
}

& docker info *> $null
if ($LASTEXITCODE -ne 0) {
    throw "Docker Desktop is not running."
}

if (-not (Test-Path (Join-Path $SdkPath "tools\pack.py"))) {
    throw "Fossil HR SDK not found: $SdkPath"
}

if (-not (Test-Path (Join-Path $JerryScriptPath "tools\build.py"))) {
    throw "JerryScript source not found: $JerryScriptPath"
}

if (-not (Test-Path $manifestPath)) {
    throw "App manifest not found: $manifestPath"
}

if (-not (Test-Path $makefilePath)) {
    throw "App Makefile not found: $makefilePath"
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$identifier = [string]$manifest.identifier

if ($identifier -notmatch '^[A-Za-z][A-Za-z0-9]*App$') {
    throw "Invalid app identifier in build\app.json: $identifier"
}

New-Item -ItemType Directory -Force -Path $distPath | Out-Null

$oldOutput = Join-Path $distPath "$identifier.wapp"
if (Test-Path $oldOutput) {
    Remove-Item -Force $oldOutput
}

$bashScript = @'
set -euo pipefail
export DEBIAN_FRONTEND=noninteractive

apt-get update
apt-get install -y --no-install-recommends \
    ca-certificates cmake make gcc g++ python3 python3-pip jq

python3 -m pip install --no-cache-dir crc32c

rm -rf /tmp/jerryscript
mkdir -p /tmp/jerryscript
cp -a /jerryscript/. /tmp/jerryscript/

cd /tmp/jerryscript
python3 tools/build.py --jerry-cmdline-snapshot ON

export PATH="/tmp/jerryscript/build/bin:$PATH"
jerry-snapshot --help >/dev/null

cd "/work/apps/${APP_NAME}"
make clean
WATCH_SDK_PATH=/sdk/ make build

test -s "build/${APP_IDENTIFIER}.wapp"
cp "build/${APP_IDENTIFIER}.wapp" "/work/dist/${APP_IDENTIFIER}.wapp"
ls -lh "/work/dist/${APP_IDENTIFIER}.wapp"
'@

Write-Host "Building $identifier from apps\$App..." -ForegroundColor Cyan

& docker run --rm `
    --env "APP_NAME=$App" `
    --env "APP_IDENTIFIER=$identifier" `
    --mount "type=bind,source=$repoRoot,target=/work" `
    --mount "type=bind,source=$SdkPath,target=/sdk,readonly" `
    --mount "type=bind,source=$JerryScriptPath,target=/jerryscript,readonly" `
    $DockerImage `
    bash -lc $bashScript

if ($LASTEXITCODE -ne 0) {
    throw "Docker build failed for $identifier."
}

if (-not (Test-Path $oldOutput)) {
    throw "Expected output was not created: $oldOutput"
}

$output = Get-Item $oldOutput
if ($output.Length -le 0) {
    throw "Output package is empty: $oldOutput"
}

Write-Host ""
Write-Host "Build passed." -ForegroundColor Green
$output | Select-Object FullName, Length, LastWriteTime
