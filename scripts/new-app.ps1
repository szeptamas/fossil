[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[a-z][a-z0-9-]*$')]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [ValidatePattern('^[A-Za-z][A-Za-z0-9]*App$')]
    [string]$Identifier,

    [Parameter(Mandatory = $true)]
    [string]$Title,

    [string]$SdkPath = "C:\git\Fossil\Fossil-HR-SDK"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$template = Join-Path $SdkPath "examples\simple-menu"
$target = Join-Path $repoRoot "apps\$Name"

if (-not (Test-Path $template)) {
    throw "Known working SDK template not found: $template"
}

if (Test-Path $target) {
    throw "Target app already exists: $target"
}

New-Item -ItemType Directory -Force -Path (Split-Path -Parent $target) | Out-Null
Copy-Item -Path $template -Destination $target -Recurse

$generatedCode = Join-Path $target "build\files\code"
if (Test-Path $generatedCode) {
    Get-ChildItem -Path $generatedCode -File -ErrorAction SilentlyContinue |
        Remove-Item -Force
}

Get-ChildItem -Path (Join-Path $target "build") -Filter "*.wapp" -File -ErrorAction SilentlyContinue |
    Remove-Item -Force

$manifestPath = Join-Path $target "build\app.json"
$manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
$manifest.identifier = $Identifier
$manifestJson = $manifest | ConvertTo-Json -Depth 10 -Compress
[System.IO.File]::WriteAllText(
    $manifestPath,
    $manifestJson,
    [System.Text.UTF8Encoding]::new($false)
)

$appJsPath = Join-Path $target "app.js"
$appJs = Get-Content -Raw -LiteralPath $appJsPath

$escapedTitle = $Title.Replace("\", "\\").Replace("'", "\'")
$appJs = [regex]::Replace(
    $appJs,
    "header_text\s*:\s*'[^']*'",
    "header_text: '$escapedTitle'",
    1
)

[System.IO.File]::WriteAllText(
    $appJsPath,
    $appJs,
    [System.Text.UTF8Encoding]::new($false)
)

$readme = @"
# $Title

Identifier: ``$Identifier``

Generated from the known working SDK ``examples\simple-menu`` template.

## Build

``````powershell
.\scripts\build-app.ps1 -App $Name
``````

## Manual watch test

- Install ``dist\$Identifier.wapp`` with Gadgetbridge.
- Activate a Gadgetbridge-generated custom watchface.
- Launch the exact identifier ``$Identifier``.
- Verify top, middle, bottom, and middle-hold behavior.
"@

[System.IO.File]::WriteAllText(
    (Join-Path $target "README.md"),
    $readme,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Created app: $target" -ForegroundColor Green
Write-Host "Identifier: $Identifier"
Write-Host "Next:"
Write-Host "  .\scripts\build-app.ps1 -App $Name"
