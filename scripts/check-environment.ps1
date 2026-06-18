[CmdletBinding()]
param(
    [string]$SdkPath = "C:\git\Fossil\Fossil-HR-SDK",
    [string]$JerryScriptPath = "C:\git\Fossil\jerryscript",
    [string]$KnowledgeArchivePath = "C:\git\Fossil\_knowledge-archive"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$checks = @(
    [pscustomobject]@{
        Name = "Docker command"
        Ok = $null -ne (Get-Command docker -ErrorAction SilentlyContinue)
        Detail = "docker"
    },
    [pscustomobject]@{
        Name = "Git command"
        Ok = $null -ne (Get-Command git -ErrorAction SilentlyContinue)
        Detail = "git"
    },
    [pscustomobject]@{
        Name = "Fossil HR SDK"
        Ok = Test-Path (Join-Path $SdkPath "tools\pack.py")
        Detail = $SdkPath
    },
    [pscustomobject]@{
        Name = "JerryScript source"
        Ok = Test-Path (Join-Path $JerryScriptPath "tools\build.py")
        Detail = $JerryScriptPath
    },
    [pscustomobject]@{
        Name = "Knowledge archive"
        Ok = Test-Path (Join-Path $KnowledgeArchivePath "INDEX.md")
        Detail = $KnowledgeArchivePath
    }
)

$dockerRunning = $false
if ($checks[0].Ok) {
    & docker info *> $null
    $dockerRunning = $LASTEXITCODE -eq 0
}

$checks += [pscustomobject]@{
    Name = "Docker daemon"
    Ok = $dockerRunning
    Detail = "Docker Desktop must be running"
}

$checks | Format-Table Name, Ok, Detail -AutoSize

$failed = @($checks | Where-Object { -not $_.Ok })

if ($failed.Count -gt 0) {
    throw "$($failed.Count) required environment check(s) failed."
}

Write-Host ""
Write-Host "Fossil HR development environment is ready." -ForegroundColor Green
