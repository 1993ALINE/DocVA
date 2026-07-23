Write-Host "?? Starting DocVA Rebrand..." -ForegroundColor Cyan

$repoRoot = Get-Location
Write-Host "Repository root: $repoRoot" -ForegroundColor Yellow

$files = Get-ChildItem -Path $repoRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object {
    $_.FullName -notmatch 'node_modules|\.git' -and
    $_.Extension -in @('.js', '.json', '.md', '.env', '.yml', '.ts', '.tsx', '.jsx')
}

Write-Host "Processing $($files.Count) files..." -ForegroundColor Yellow

$modifiedCount = 0
foreach ($file in $files) {
    try {
        $content = Get-Content $file.FullName -Raw -Encoding UTF8 -ErrorAction SilentlyContinue
        if ($content) {
            $original = $content
            $content = $content -replace 'anot-health', 'docva'
            $content = $content -replace 'anotHealth', 'docVA'
            $content = $content -replace '\banot\b', 'docva'
            $content = $content -replace '\bAnot\b', 'DocVA'
            $content = $content -replace 'app\.anot\.health', 'app.docva.health'
            
            if ($content -ne $original) {
                Set-Content $file.FullName -Value $content -Encoding UTF8
                $modifiedCount++
                Write-Host "? $($file.Name)" -ForegroundColor Green
            }
        }
    } catch { }
}

Write-Host "Done! Modified $modifiedCount files" -ForegroundColor Green
