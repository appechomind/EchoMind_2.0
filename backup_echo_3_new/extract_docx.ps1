$wordApp = New-Object -ComObject Word.Application
$wordApp.Visible = $false
try {
    $docPath = Join-Path $PWD.Path "EchoMind_UltraDetailed_PRD_FULL_v1.4 (1).docx"
    $doc = $wordApp.Documents.Open($docPath)
    $text = $doc.Content.Text
    $outputPath = Join-Path $PWD.Path "prd_content.txt"
    Set-Content -Path $outputPath -Value $text
    Write-Host "Content extracted to $outputPath"
} catch {
    Write-Host "Error: $_"
} finally {
    if ($doc -ne $null) {
        $doc.Close()
    }
    $wordApp.Quit()
} 