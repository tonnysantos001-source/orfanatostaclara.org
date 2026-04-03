$rootPath = "c:\Users\dinho\Documents\GitHub\orfanatostaclara.org"
$files = Get-ChildItem -Path $rootPath -Filter "*.html" -Recurse
$files += Get-ChildItem -Path $rootPath -Filter "*.js" -Recurse
$files += Get-ChildItem -Path $rootPath -Filter "*.css" -Recurse

foreach ($file in $files) {
    Write-Host "Processing $($file.FullName)..."
    $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
    
    # Expanded Regex for all target domains and subdomains
    # Covers: abc.cl, tarjetaabc.cl, empresasabc.cl, abcdin.cl, lapolar.cl, empresaslapolar.cl and their subdomains
    $domainRegex = '(https?:)?\/\/(www\.)?([\w\.-]*)(abc\.cl|tarjetaabc\.cl|empresasabc\.cl|abcdin\.cl|lapolar\.cl|empresaslapolar\.cl|lapolartarjeta\.my\.site\.com)[^"]*'
    
    # 1. Replace href
    $content = $content -replace "href=`"$domainRegex`"", 'href="javascript:void(0)"'
    
    # 2. Replace form actions
    $content = $content -replace "action=`"$domainRegex`"", 'action="javascript:void(0)"'
    
    # 3. Replace data attributes
    $content = $content -replace "data-url=`"$domainRegex`"", 'data-url="javascript:void(0)"'
    $content = $content -replace 'data-gtm="[^"]*(abc\.cl|tarjetaabc\.cl|empresasabc\.cl|abcdin\.cl|lapolar\.cl)[^"]*"', 'data-gtm="javascript:void(0)"'
    
    # 4. Handle meta tags
    $content = $content -replace "content=`"$domainRegex`"", 'content="javascript:void(0)"'

    # 5. Handle redirects and URLs in scripts (more aggressive)
    $content = $content -replace '"(https?:)?\/\/(www\.)?([\w\.-]*)(abc\.cl|tarjetaabc\.cl|empresasabc\.cl|abcdin\.cl|lapolar\.cl|empresaslapolar\.cl)[^"]*"', '"javascript:void(0)"'

    # 6. Specific case for Sostenibilidad and others with spaces
    $content = $content -replace 'Sostenibilidad', '<!-- removed -->'
    $content = $content -replace 'Paga aquí tu Tarjeta abc', '<!-- removed -->'
    $content = $content -replace 'paga-tu-tarjeta\.html', 'javascript:void(0)'


    
    Set-Content -Path $file.FullName -Value $content -Encoding UTF8
}
Write-Host "Cleanup completed successfully."
