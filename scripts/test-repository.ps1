[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$errors = New-Object System.Collections.Generic.List[string]

$psFiles = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -Filter "*.ps1" |
        Where-Object {
            $_.FullName -notmatch '[\\/]\.git[\\/]'
        }
)

foreach ($file in $psFiles) {
    $tokens = $null
    $parseErrors = $null

    [System.Management.Automation.Language.Parser]::ParseFile(
        $file.FullName,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    foreach ($parseError in @($parseErrors)) {
        $relative = $file.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
        $errors.Add(
            "${relative}:$($parseError.Extent.StartLineNumber):$($parseError.Extent.StartColumnNumber) $($parseError.Message)"
        ) | Out-Null
    }
}

$identifiers = @{}
$appsRoot = Join-Path $repoRoot "apps"

$apps = @(
    Get-ChildItem -Path $appsRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object {
            Test-Path (Join-Path $_.FullName "build\app.json")
        }
)

foreach ($app in $apps) {
    $manifestPath = Join-Path $app.FullName "build\app.json"

    try {
        $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
        $identifier = [string]$manifest.identifier

        if ($identifier -notmatch '^[A-Za-z][A-Za-z0-9]*App$') {
            $errors.Add("Invalid app identifier in ${manifestPath}: $identifier") | Out-Null
        }

        if ($identifiers.ContainsKey($identifier)) {
            $errors.Add(
                "Duplicate app identifier '$identifier': $($identifiers[$identifier]) and $($app.FullName)"
            ) | Out-Null
        }
        else {
            $identifiers[$identifier] = $app.FullName
        }
    }
    catch {
        $errors.Add("Invalid JSON manifest: $manifestPath - $($_.Exception.Message)") | Out-Null
    }

    foreach ($required in @("app.js", "Makefile")) {
        $requiredPath = Join-Path $app.FullName $required
        if (-not (Test-Path $requiredPath)) {
            $errors.Add("Missing required app file: $requiredPath") | Out-Null
        }
    }
}

$committedOutputs = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.Extension -in @(".wapp", ".apk") -and
            $_.FullName -notmatch '[\\/]\.git[\\/]'
        }
)

foreach ($output in $committedOutputs) {
    $relative = $output.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
    $errors.Add("Generated binary present in repository tree: $relative") | Out-Null
}

if ($errors.Count -gt 0) {
    Write-Host ""
    Write-Host "Repository validation failed:" -ForegroundColor Red
    foreach ($errorMessage in $errors) {
        Write-Host "- $errorMessage" -ForegroundColor Red
    }

    throw "$($errors.Count) repository validation error(s)."
}

Write-Host "Repository validation passed." -ForegroundColor Green
Write-Host "PowerShell files parsed: $($psFiles.Count)"
Write-Host "App manifests checked:  $($apps.Count)"
