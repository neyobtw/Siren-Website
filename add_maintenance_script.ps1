# Get all HTML files except maintenance.html
$htmlFiles = Get-ChildItem -Path . -Filter "*.html" -Recurse | Where-Object { $_.Name -ne "maintenance.html" }

foreach ($file in $htmlFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    
    # Check if the maintenance script is already included
    if ($content -notmatch "maintenance\.js") {
        # Insert the script before the closing </body> tag
        $newContent = $content -replace '(?s)(</body>)', '<script src="js/maintenance.js"></script>$1'
        
        # Save the file with UTF-8 encoding
        [System.IO.File]::WriteAllText($file.FullName, $newContent, [System.Text.Encoding]::UTF8)
        Write-Host "Added maintenance script to $($file.Name)"
    } else {
        Write-Host "Maintenance script already exists in $($file.Name)"
    }
}

Write-Host "All done!"
