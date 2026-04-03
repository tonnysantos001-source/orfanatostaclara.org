$file = "www.abc.cl\freidora-de-aire-digital-oster-40wddf-4-lts\28127553.html"
$lines = Get-Content $file

# Find and fix the corrupted block
$newLines = @()
$skip = $false
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    $lineNum = $i + 1

    # Skip the _etmc scripts + corrupted footer (lines 19086-19103)
    if ($line -match '_etmc\.push' -or $line -match '^\-\-\>$' -or $line -match '^\<\/footer\>553') {
        if (-not $skip) {
            $newLines += '<!-- Marketing Cloud Analytics disabled for static deployment -->'
            $skip = $true
        }
        continue
    }

    # Skip orphan try/catch blocks around _etmc
    if ($skip -and ($line -match '^try \{' -or $line -match '^\} catch \(e\)' -or $line -match '^\<script type="text/javascript"\>' -or $line -match '^\<\/script\>' -or $line -match 'End Marketing Cloud')) {
        continue
    }

    # Once we hit the next real content, stop skipping
    if ($skip -and $line -match '^\<\/footer\>\s*$') {
        $skip = $false
        $newLines += $line
        continue
    }

    if ($skip -and -not ($line -match '^\s*$')) {
        $skip = $false
    }

    $newLines += $line
}

Set-Content $file ($newLines -join "`n")
Write-Host "Fixed: removed corrupted footer block. Total lines: $($newLines.Count)"
