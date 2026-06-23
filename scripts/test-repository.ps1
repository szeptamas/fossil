[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$validationErrors = New-Object System.Collections.Generic.List[string]

$powerShellFiles = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -Filter "*.ps1" |
        Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }
)

foreach ($file in $powerShellFiles) {
    $tokens = $null
    $parseErrors = $null

    [System.Management.Automation.Language.Parser]::ParseFile(
        $file.FullName,
        [ref]$tokens,
        [ref]$parseErrors
    ) | Out-Null

    foreach ($parseError in @($parseErrors)) {
        $relativePath = $file.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
        $message = "{0}:{1}:{2} {3}" -f `
            $relativePath, `
            $parseError.Extent.StartLineNumber, `
            $parseError.Extent.StartColumnNumber, `
            $parseError.Message

        $validationErrors.Add($message) | Out-Null
    }
}

$identifiers = @{}
$appsRoot = Join-Path $repoRoot "apps"
$appDirectories = @(
    Get-ChildItem -Path $appsRoot -Directory -ErrorAction SilentlyContinue |
        Where-Object { Test-Path (Join-Path $_.FullName "build\app.json") }
)

foreach ($appDirectory in $appDirectories) {
    $manifestPath = Join-Path $appDirectory.FullName "build\app.json"

    try {
        $manifest = Get-Content -Raw -LiteralPath $manifestPath | ConvertFrom-Json
        $identifier = [string]$manifest.identifier

        if ($identifier -notmatch '^[A-Za-z][A-Za-z0-9]*App$') {
            $validationErrors.Add(
                ("Invalid app identifier in {0}: {1}" -f $manifestPath, $identifier)
            ) | Out-Null
        }

        if ($identifiers.ContainsKey($identifier)) {
            $validationErrors.Add(
                ("Duplicate app identifier '{0}': {1} and {2}" -f `
                    $identifier, `
                    $identifiers[$identifier], `
                    $appDirectory.FullName)
            ) | Out-Null
        }
        else {
            $identifiers[$identifier] = $appDirectory.FullName
        }
    }
    catch {
        $validationErrors.Add(
            ("Invalid JSON manifest: {0} - {1}" -f $manifestPath, $_.Exception.Message)
        ) | Out-Null
    }

    foreach ($requiredFile in @("app.js", "Makefile")) {
        $requiredPath = Join-Path $appDirectory.FullName $requiredFile
        if (-not (Test-Path $requiredPath)) {
            $validationErrors.Add(
                ("Missing required app file: {0}" -f $requiredPath)
            ) | Out-Null
        }
    }
}


$pythonCommand = $null
$pythonPrefix = @()

if (Get-Command py -ErrorAction SilentlyContinue) {
    $pythonCommand = "py"
    $pythonPrefix += "-3"
}
elseif (Get-Command python -ErrorAction SilentlyContinue) {
    $pythonCommand = "python"
}
elseif (Get-Command python3 -ErrorAction SilentlyContinue) {
    $pythonCommand = "python3"
}

$pythonFiles = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -Filter "*.py" |
        Where-Object { $_.FullName -notmatch '[\\/]\.git[\\/]' }
)

if ($null -ne $pythonCommand) {
    foreach ($pythonFile in $pythonFiles) {
        & $pythonCommand @pythonPrefix -m py_compile $pythonFile.FullName
        if ($LASTEXITCODE -ne 0) {
            $validationErrors.Add(
                ("Python syntax validation failed: {0}" -f $pythonFile.FullName)
            ) | Out-Null
        }
    }
}
elseif ($pythonFiles.Count -gt 0) {
    Write-Warning "Python 3 not found; Python syntax validation was skipped."
}

$simulatorFixture = Join-Path $repoRoot "simulator\fixtures\simple-menu-demo"
foreach ($requiredSimulatorFile in @(
    "app.js",
    "build\app.json",
    "build\files\layout\menu_layout"
)) {
    $requiredSimulatorPath = Join-Path $simulatorFixture $requiredSimulatorFile
    if (-not (Test-Path $requiredSimulatorPath)) {
        $validationErrors.Add(
            ("Missing simulator fixture file: {0}" -f $requiredSimulatorPath)
        ) | Out-Null
    }
}

$layoutSupportedNodeTypes = @(
    "container",
    "solid",
    "wapp_template",
    "option_menu",
    "text",
    "text_box",
    "label",
    "line",
    "rectangle",
    "rect",
    "circle"
)
$layoutSupportedNodeTypeSet = @{}
foreach ($layoutSupportedNodeType in $layoutSupportedNodeTypes) {
    $layoutSupportedNodeTypeSet[$layoutSupportedNodeType] = $true
}
$layoutFiles = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch '[\\/]\.git[\\/]' -and
            $_.FullName -match '[\\/]build[\\/]files[\\/]layout[\\/]'
        }
)
foreach ($layoutFile in $layoutFiles) {
    $relativePath = $layoutFile.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
    try {
        $parsedLayout = Get-Content -Raw -LiteralPath $layoutFile.FullName | ConvertFrom-Json
        $layoutNodes = @($parsedLayout)
        if ($layoutNodes.Count -eq 1 -and $layoutNodes[0] -is [System.Array]) {
            $layoutNodes = $layoutNodes[0]
        }
        if ($layoutNodes.Count -eq 0) {
            $validationErrors.Add(("Empty layout file: {0}" -f $relativePath)) | Out-Null
            continue
        }
        foreach ($layoutNode in $layoutNodes) {
            if ($null -eq $layoutNode -or $null -eq $layoutNode.PSObject.Properties["type"]) {
                $validationErrors.Add(("Layout node missing top-level type in {0}" -f $relativePath)) | Out-Null
                continue
            }
            $layoutNodeType = [string]$layoutNode.type
            if (-not $layoutSupportedNodeTypeSet.ContainsKey($layoutNodeType)) {
                $validationErrors.Add((
                    "Unsupported layout node type '{0}' in {1}. Supported layout node types: {2}" -f
                    $layoutNodeType,
                    $relativePath,
                    ($layoutSupportedNodeTypes -join ", ")
                )) | Out-Null
            }
        }
    } catch {
        $validationErrors.Add(("Invalid layout JSON: {0} - {1}" -f $relativePath, $_.Exception.Message)) | Out-Null
    }
}
$generatedBinaries = @(
    Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue |
        Where-Object {
            $_.FullName -notmatch '[\\/]\.git[\\/]' -and
            $_.Extension.ToLowerInvariant() -in @(".wapp", ".apk")
        }
)

foreach ($generatedBinary in $generatedBinaries) {
    $relativePath = $generatedBinary.FullName.Substring($repoRoot.Length).TrimStart("\", "/")
    $validationErrors.Add(
        ("Generated binary present in repository tree: {0}" -f $relativePath)
    ) | Out-Null
}

if ($validationErrors.Count -gt 0) {
    Write-Host ""
    Write-Host "Repository validation failed:" -ForegroundColor Red

    foreach ($validationError in $validationErrors) {
        Write-Host ("- {0}" -f $validationError) -ForegroundColor Red
    }

    throw ("{0} repository validation error(s)." -f $validationErrors.Count)
}

Write-Host "Repository validation passed." -ForegroundColor Green
Write-Host ("Layout files checked: {0}" -f $layoutFiles.Count)
Write-Host ("PowerShell files parsed: {0}" -f $powerShellFiles.Count)
Write-Host ("App manifests checked:  {0}" -f $appDirectories.Count)
Write-Host ("Python files checked:   {0}" -f $pythonFiles.Count)
