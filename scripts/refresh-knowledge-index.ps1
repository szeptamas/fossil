[CmdletBinding()]
param(
    [string]$KnowledgeArchivePath = "C:\git\Fossil\_knowledge-archive"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$outputDir = Join-Path $repoRoot ".local"
$outputPath = Join-Path $outputDir "knowledge-files.txt"

if (-not (Test-Path (Join-Path $KnowledgeArchivePath "INDEX.md"))) {
    throw "Knowledge archive not found: $KnowledgeArchivePath"
}

New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$extensions = @(
    ".md", ".txt", ".json", ".patch", ".diff",
    ".pdf", ".html", ".htm", ".yaml", ".yml"
)

$files = Get-ChildItem -Path $KnowledgeArchivePath -Recurse -File |
    Where-Object {
        $extensions -contains $_.Extension.ToLowerInvariant()
    } |
    Sort-Object FullName |
    ForEach-Object {
        $_.FullName
    }

[System.IO.File]::WriteAllLines(
    $outputPath,
    $files,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Host "Local knowledge index created." -ForegroundColor Green
Write-Host $outputPath
Write-Host "Files: $($files.Count)"
