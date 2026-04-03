$htmlFile = "www.abc.cl\freidora-de-aire-digital-oster-40wddf-4-lts\28127553.html"
$cssPattern = "@font-face\s*\{[^}]+\}"
$pixel = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"

# Clean HTML src
if (Test-Path $htmlFile) {
    Write-Host "Cleaning HTML $htmlFile"
    (Get-Content $htmlFile -Raw) -replace 'src="javascript:void\(0\)"', "src=`"$pixel`"" | Set-Content $htmlFile
}

# Clean all CSS
Get-ChildItem -Path . -Recurse -Filter *.css | ForEach-Object {
    Write-Host "Cleaning CSS $($_.FullName)"
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "@font-face", "/* @font-face disabled */"
    $content = $content -replace "url\(['""]?https?://www\.abc\.cl[^)]+\)", "/* Blocked URL */"
    Set-Content $_.FullName $content
}
