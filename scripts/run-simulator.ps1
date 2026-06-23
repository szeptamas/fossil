[CmdletBinding()]
param(
    [string]$AppPath = "",
    [int]$Port = 5178,
    [switch]$NoBrowser
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$server = Join-Path $repoRoot "simulator\server.py"

if (-not (Test-Path $server)) {
    throw "Simulator server not found: $server"
}

if ([string]::IsNullOrWhiteSpace($AppPath)) {
    $sdkExample = "C:\git\Fossil\Fossil-HR-SDK\examples\simple-menu"
    if (Test-Path $sdkExample) {
        $AppPath = $sdkExample
    }
    else {
        $AppPath = Join-Path $repoRoot "simulator\fixtures\simple-menu-demo"
    }
}

$python = $null
$pythonArguments = @()

if (Get-Command py -ErrorAction SilentlyContinue) {
    $python = "py"
    $pythonArguments += "-3"
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $python = "python"
}
elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $python = "python3"
}
else {
    throw "Python 3 was not found. Install Python 3 or add it to PATH."
}

$arguments = @(
    $server,
    "--app", (Resolve-Path $AppPath).Path,
    "--port", [string]$Port
)

if ($NoBrowser) {
    $arguments += "--no-browser"
}

Write-Host "Starting Fossil Hybrid HR simulator..." -ForegroundColor Cyan
Write-Host "App: $AppPath"
Write-Host "URL: http://127.0.0.1:$Port/"

& $python @pythonArguments @arguments
if ($LASTEXITCODE -ne 0) {
    throw "Simulator exited with code $LASTEXITCODE."
}
