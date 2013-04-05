# Files in the order they must be combined
$files = 
    "d3G.Grid.js",
	"d3G.Grid.Table.js",
	"d3G.Grid.Pager.js"

# $versionHolder = "##VERSION##"
# $versionInfo = ([xml](Get-Content -Path "..\build\D3Grid.versions.targets")).Project.PropertyGroup
# 
# If($versionInfo.BuildQuality -ne "")
# {
# 	$versionInfo.BuildQuality = "-" + $versionInfo.BuildQuality;
# }

# $version = %{'{0}.{1}.{2}{3}' -f $versionInfo.MajorVersion, $versionInfo.MinorVersion, $versionInfo.PatchVersion, $versionInfo.BuildQuality}

# Run JSHint against files
Write-Host "Running JSHint..." -ForegroundColor Yellow
foreach ($file in $files) {
	Write-Host "$file... " -NoNewline
	$output = "build-output.txt"
	& "jshint" "$file" > $output
	if ((Get-Content $output) -ne $Null) {
		Write-Host
		(Get-Content $output) | Write-Host -ForegroundColor Red
		Remove-Item $output
		exit 1
	}
	Write-Host "no issues found" -ForegroundColor Green
}

# Combine all files into d3Grid.js
if (!(Test-Path -path "bin")) {
	New-Item "bin" -Type Directory | Out-Null
}

Write-Host "Building bin\d3Grid.js... " -NoNewline -ForegroundColor Yellow
$filePath = "bin\d3Grid.js"
Remove-Item $filePath -Force -ErrorAction SilentlyContinue
foreach ($file in $files) {
	Add-Content -Path $filePath -Value "/* $file */"
	Get-Content -Path $file | %{ $_.replace($versionHolder,$version) } | Add-Content -Path $filePath
}
Write-Host "done" -ForegroundColor Green

# Minify to d3Grid.min.js
Write-Host "Building bin\d3Grid.min.js... " -NoNewline -ForegroundColor Yellow
& "..\tools\ajaxmin\AjaxMin.exe" bin\d3Grid.js -out bin\d3Grid.min.js -clobber > $output
(Get-Content $output)[6] | Write-Host -ForegroundColor Green

Remove-Item $output -Force