try {
    $fileName = "EchoMind_UltraDetailed_PRD_FULL_v1.4 (1).docx"
    $filePath = Join-Path $PWD.Path $fileName
    
    # Create a temporary HTML file
    $htmlPath = Join-Path $PWD.Path "temp.html"
    
    # Use .NET to extract content
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($filePath)
    
    # Look for document.xml
    $entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }
    
    if ($entry -ne $null) {
        $stream = $entry.Open()
        $reader = New-Object System.IO.StreamReader($stream)
        $content = $reader.ReadToEnd()
        $reader.Close()
        $stream.Close()
        
        # Save the raw XML
        $xmlOutputPath = Join-Path $PWD.Path "document.xml"
        Set-Content -Path $xmlOutputPath -Value $content
        
        Write-Host "Extracted document.xml to $xmlOutputPath"
    }
    
    $zip.Dispose()
} catch {
    Write-Host "Error: $_"
} 