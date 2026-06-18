[CmdletBinding()]
param(
    [string]$SdkPath = "C:\git\Fossil\Fossil-HR-SDK",
    [string]$JerryScriptPath = "C:\git\Fossil\jerryscript",
    [string]$DockerImage = "ubuntu:20.04"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appsRoot = Join-Path $repoRoot "apps"
$builder = Join-Path $PSScriptRoot "build-app.ps1"

$apps = @(
    Get-ChildItem -Path $appsRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object {
            (Test-Path (Join-Path $_.FullName "Makefile")) -and
            (Test-Path (Join-Path $_.FullName "build\app.json"))
        } |
        Sort-Object Name
)

if ($apps.Count -eq 0) {
    throw "No buildable apps found under $appsRoot."
}

$results = New-Object System.Collections.Generic.List[object]

foreach ($app in $apps) {
    Write-Host ""
    Write-Host "=== $($app.Name) ===" -ForegroundColor Cyan

    try {
        & $builder `
            -App $app.Name `
            -SdkPath $SdkPath `
            -JerryScriptPath $JerryScriptPath `
            -DockerImage $DockerImage

        $results.Add([pscustomobject]@{
            App = $app.Name
            Status = "OK"
        }) | Out-Null
    }
    catch {
        $results.Add([pscustomobject]@{
            App = $app.Name
            Status = "FAILED"
        }) | Out-Null

        Write-Warning $_.Exception.Message
        break
    }
}

Write-Host ""
$results | Format-Table App, Status -AutoSize

$failed = @($results | Where-Object { $_.Status -ne "OK" })
if ($failed.Count -gt 0) {
    throw "At least one app build failed."
}
