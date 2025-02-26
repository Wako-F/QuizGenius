# Cleanup script for QuizGenius project
# Run this script when the development server is not running

# Remove template-2 directory
Write-Host "Removing template-2 directory..." -ForegroundColor Yellow
Remove-Item -Path "template-2" -Recurse -Force -ErrorAction SilentlyContinue
if (Test-Path "template-2") {
    Write-Host "Could not remove template-2 directory. Please try running this script again when no applications are using the directory." -ForegroundColor Red
} else {
    Write-Host "template-2 directory removed successfully." -ForegroundColor Green
}

# Cleanup any other temporary files or directories
Write-Host "Cleanup complete!" -ForegroundColor Green 