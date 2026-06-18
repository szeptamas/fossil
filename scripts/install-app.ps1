[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string]$Wapp,

    [string]$DeviceDirectory = "/sdcard/Android/data/nodomain.freeyourgadget.gadgetbridge/files/make",
    [string]$GadgetbridgePackage = "nodomain.freeyourgadget.gadgetbridge"
)

$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

if (-not (Get-Command adb -ErrorAction SilentlyContinue)) {
    throw "adb command not found."
}

$resolved = (Resolve-Path $Wapp).Path
$file = Get-Item $resolved

if ($file.Extension -ne ".wapp") {
    throw "Expected a .wapp file: $resolved"
}

if ($file.Length -le 0) {
    throw "The .wapp file is empty: $resolved"
}

$devices = @(& adb devices)
if ($LASTEXITCODE -ne 0 -or $devices.Count -lt 2) {
    throw "No usable ADB device detected."
}

$remotePath = "$DeviceDirectory/$($file.Name)"

& adb shell mkdir -p $DeviceDirectory
if ($LASTEXITCODE -ne 0) {
    throw "Could not create Gadgetbridge import directory: $DeviceDirectory"
}

& adb push $resolved $remotePath
if ($LASTEXITCODE -ne 0) {
    throw "adb push failed."
}

& adb shell am broadcast `
    -a "$GadgetbridgePackage.Q_UPLOAD_FILE" `
    --es EXTRA_HANDLE APP_CODE `
    --es EXTRA_PATH "$remotePath" `
    --ez EXTRA_GENERATE_FILE_HEADER false

if ($LASTEXITCODE -ne 0) {
    throw "Gadgetbridge upload broadcast failed."
}

Write-Host "Upload request sent to Gadgetbridge." -ForegroundColor Green
Write-Host "Package: $resolved"
Write-Host "Remote:  $remotePath"
Write-Host ""
Write-Host "Confirm installation on the phone, activate a Gadgetbridge custom watchface, then launch the exact app identifier."
