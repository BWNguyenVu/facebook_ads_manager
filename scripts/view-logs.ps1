# Facebook Ads Manager Log Viewer for Windows
# PowerShell script to view logs from Docker container

Write-Host "=== Facebook Ads Manager Log Viewer ===" -ForegroundColor Green
Write-Host "Container: facebook-ads-manager-container" -ForegroundColor Yellow
Write-Host ""

function Show-Menu {
    Write-Host "Choose an option:" -ForegroundColor Cyan
    Write-Host "1. View live Docker container logs"
    Write-Host "2. View last 100 lines of Docker logs"
    Write-Host "3. Follow live Docker logs (Ctrl+C to stop)"
    Write-Host "4. Search Docker logs"
    Write-Host "5. View container status"
    Write-Host "6. Restart container"
    Write-Host "7. View logs directory (if mounted)"
    Write-Host "8. Exit"
    Write-Host ""
}

function Get-DockerLogs {
    param([int]$Lines = 50)
    
    Write-Host "=== Docker Container Logs (Last $Lines lines) ===" -ForegroundColor Green
    try {
        docker logs --tail=$Lines facebook-ads-manager-container
    }
    catch {
        Write-Host "Error: Container not found or Docker not running" -ForegroundColor Red
    }
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Follow-DockerLogs {
    Write-Host "=== Following Live Docker Logs ===" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    
    try {
        docker logs -f facebook-ads-manager-container
    }
    catch {
        Write-Host "Error: Container not found or Docker not running" -ForegroundColor Red
    }
}

function Search-DockerLogs {
    $searchTerm = Read-Host "Enter search term"
    Write-Host "=== Searching for: $searchTerm ===" -ForegroundColor Green
    
    try {
        docker logs facebook-ads-manager-container 2>&1 | Select-String $searchTerm
    }
    catch {
        Write-Host "Error: Container not found or Docker not running" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Get-ContainerStatus {
    Write-Host "=== Container Status ===" -ForegroundColor Green
    
    try {
        docker ps --filter name=facebook-ads-manager-container --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        Write-Host ""
        docker stats facebook-ads-manager-container --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
    }
    catch {
        Write-Host "Error: Container not found or Docker not running" -ForegroundColor Red
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Restart-Container {
    $confirm = Read-Host "Are you sure you want to restart the container? [y/N]"
    if ($confirm -eq 'y' -or $confirm -eq 'Y') {
        Write-Host "Restarting container..." -ForegroundColor Yellow
        try {
            docker restart facebook-ads-manager-container
            Write-Host "Container restarted successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "Error restarting container" -ForegroundColor Red
        }
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function View-LogsDirectory {
    Write-Host "=== Logs Directory ===" -ForegroundColor Green
    
    $logsPath = ".\logs"
    if (Test-Path $logsPath) {
        Write-Host "Local logs directory found: $logsPath" -ForegroundColor Green
        Get-ChildItem $logsPath -File | Format-Table Name, Length, LastWriteTime
        
        $choice = Read-Host "View a specific log file? Enter filename or press Enter to skip"
        if ($choice -and (Test-Path "$logsPath\$choice")) {
            Write-Host "=== Content of $choice (last 50 lines) ===" -ForegroundColor Yellow
            Get-Content "$logsPath\$choice" | Select-Object -Last 50
        }
    } else {
        Write-Host "Local logs directory not found. Logs are only available through Docker logs command." -ForegroundColor Yellow
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

# Main loop
while ($true) {
    Clear-Host
    Write-Host "=== Facebook Ads Manager Log Viewer ===" -ForegroundColor Green
    
    try {
        $containerStatus = docker ps --filter name=facebook-ads-manager-container --format "{{.Status}}" 2>$null
        if ($containerStatus) {
            Write-Host "Container Status: $containerStatus" -ForegroundColor Green
        } else {
            Write-Host "Container Status: Not running" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "Container Status: Docker not available" -ForegroundColor Red
    }
    
    Write-Host ""
    Show-Menu
    
    $choice = Read-Host "Enter your choice [1-8]"
    
    switch ($choice) {
        1 { Get-DockerLogs -Lines 50 }
        2 { Get-DockerLogs -Lines 100 }
        3 { Follow-DockerLogs }
        4 { Search-DockerLogs }
        5 { Get-ContainerStatus }
        6 { Restart-Container }
        7 { View-LogsDirectory }
        8 { Write-Host "Goodbye!" -ForegroundColor Green; exit }
        default { 
            Write-Host "Invalid option. Please try again." -ForegroundColor Red
            Start-Sleep 2 
        }
    }
}
