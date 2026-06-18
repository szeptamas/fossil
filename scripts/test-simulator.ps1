[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$server = Join-Path $repoRoot "simulator\server.py"
$fixture = Join-Path $repoRoot "simulator\fixtures\simple-menu-demo"
$port = Get-Random -Minimum 22000 -Maximum 39000
$baseUrl = "http://127.0.0.1:$port"
$tempRoot = Join-Path $env:TEMP ("fossil-simulator-test-" + [Guid]::NewGuid().ToString("N"))
New-Item -ItemType Directory -Force -Path $tempRoot | Out-Null

$python = $null
$pythonPrefix = @()

if (Get-Command py -ErrorAction SilentlyContinue) {
    $python = "py"
    $pythonPrefix += "-3"
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $python = "python"
}
elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $python = "python3"
}
else {
    throw "Python 3 was not found."
}

if (Get-Command node -ErrorAction SilentlyContinue) {
    foreach ($script in @(
        "fossil-runtime.js",
        "layout-renderer.js",
        "simulator-ui.js"
    )) {
        & node --check (Join-Path $repoRoot "simulator\wwwroot\$script")
        if ($LASTEXITCODE -ne 0) {
            throw "JavaScript syntax check failed: $script"
        }
    }

    & node (Join-Path $repoRoot "simulator\tests\runtime-smoke.mjs")
    if ($LASTEXITCODE -ne 0) {
        throw "Simulator runtime smoke test failed."
    }
}
else {
    Write-Warning "Node.js not found; JavaScript syntax checks were skipped."
}

$stdout = Join-Path $tempRoot "stdout.log"
$stderr = Join-Path $tempRoot "stderr.log"
$arguments = @(
    $server,
    "--app", $fixture,
    "--port", [string]$port,
    "--no-browser"
)

$process = Start-Process `
    -FilePath $python `
    -ArgumentList @($pythonPrefix + $arguments) `
    -PassThru `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -WindowStyle Hidden

try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 40; $attempt++) {
        Start-Sleep -Milliseconds 250
        try {
            $status = Invoke-RestMethod -Uri "$baseUrl/api/status" -TimeoutSec 2
            $ready = $true
            break
        }
        catch {
            if ($process.HasExited) {
                break
            }
        }
    }

    if (-not $ready) {
        $details = ""
        if (Test-Path $stderr) {
            $details = Get-Content -Raw -LiteralPath $stderr
        }
        throw "Simulator did not become ready. $details"
    }

    if ($status.identifier -ne "simulatorDemoApp") {
        throw "Unexpected fixture identifier: $($status.identifier)"
    }

    $manifest = Invoke-RestMethod -Uri "$baseUrl/api/app/manifest"
    if ($manifest.identifier -ne "simulatorDemoApp") {
        throw "Manifest endpoint returned an unexpected identifier."
    }

    $source = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/api/app/source"
    if ($source.Content -notmatch "return\s*\{") {
        throw "Source endpoint did not return an SDK-style app."
    }

    $layout = Invoke-RestMethod `
        -Uri "$baseUrl/api/app/layout?name=menu_layout"
    if (@($layout).Count -lt 2) {
        throw "Layout endpoint returned too few nodes."
    }

    $index = Invoke-WebRequest -UseBasicParsing -Uri "$baseUrl/"
    if ($index.Content -notmatch "Fossil Hybrid HR Simulator") {
        throw "Simulator page was not served."
    }

    Write-Host "Simulator integration test passed." -ForegroundColor Green
    Write-Host "Identifier: $($status.identifier)"
    Write-Host "Port: $port"
}
finally {
    if ($null -ne $process -and -not $process.HasExited) {
        Stop-Process -Id $process.Id -Force
        $process.WaitForExit()
    }

    Remove-Item -Recurse -Force $tempRoot -ErrorAction SilentlyContinue
}
