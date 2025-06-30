#!/bin/bash

# Log viewing script for Facebook Ads Manager

echo "=== Facebook Ads Manager Log Viewer ==="
echo "Container: facebook-ads-manager-container"
echo "Host logs directory: /var/log/facebook-ads-manager"
echo "Container logs directory: /app/logs"
echo ""

# Function to display menu
show_menu() {
    echo "Choose an option:"
    echo "1. View live Docker container logs"
    echo "2. View application error logs"
    echo "3. View application combined logs"
    echo "4. View application info logs"
    echo "5. View all log files"
    echo "6. Follow live application logs (tail -f)"
    echo "7. View logs with grep filter"
    echo "8. Clear all logs"
    echo "9. Exit"
    echo ""
    read -p "Enter your choice [1-9]: " choice
}

# Function to view Docker logs
view_docker_logs() {
    echo "=== Docker Container Logs ==="
    docker logs --tail=100 facebook-ads-manager-container
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view error logs
view_error_logs() {
    if [ -f "/var/log/facebook-ads-manager/error.log" ]; then
        echo "=== Error Logs ==="
        tail -n 50 /var/log/facebook-ads-manager/error.log
    else
        echo "Error log file not found. Application might be in development mode."
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view combined logs
view_combined_logs() {
    if [ -f "/var/log/facebook-ads-manager/combined.log" ]; then
        echo "=== Combined Logs ==="
        tail -n 50 /var/log/facebook-ads-manager/combined.log
    else
        echo "Combined log file not found. Application might be in development mode."
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view app logs
view_app_logs() {
    if [ -f "/var/log/facebook-ads-manager/app.log" ]; then
        echo "=== Application Logs ==="
        tail -n 50 /var/log/facebook-ads-manager/app.log
    else
        echo "App log file not found. Application might be in development mode."
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to view all log files
view_all_logs() {
    echo "=== All Log Files ==="
    if [ -d "/var/log/facebook-ads-manager" ]; then
        ls -la /var/log/facebook-ads-manager/
        echo ""
        for file in /var/log/facebook-ads-manager/*.log; do
            if [ -f "$file" ]; then
                echo "--- $(basename $file) (last 10 lines) ---"
                tail -n 10 "$file"
                echo ""
            fi
        done
    else
        echo "Log directory not found. Checking Docker logs instead:"
        docker logs --tail=50 facebook-ads-manager-container
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Function to follow live logs
follow_live_logs() {
    echo "=== Following Live Application Logs ==="
    echo "Press Ctrl+C to stop"
    
    if [ -f "/var/log/facebook-ads-manager/combined.log" ]; then
        tail -f /var/log/facebook-ads-manager/combined.log
    else
        echo "Combined log not found. Following Docker logs instead:"
        docker logs -f facebook-ads-manager-container
    fi
}

# Function to search logs
search_logs() {
    read -p "Enter search term: " search_term
    echo "=== Searching for: $search_term ==="
    
    if [ -d "/var/log/facebook-ads-manager" ]; then
        grep -r "$search_term" /var/log/facebook-ads-manager/ --color=always
    else
        echo "Log directory not found. Searching Docker logs:"
        docker logs facebook-ads-manager-container 2>&1 | grep "$search_term" --color=always
    fi
    
    echo ""
    read -p "Press Enter to continue..."
}

# Function to clear logs
clear_logs() {
    read -p "Are you sure you want to clear all logs? [y/N]: " confirm
    if [[ $confirm =~ ^[Yy]$ ]]; then
        if [ -d "/var/log/facebook-ads-manager" ]; then
            sudo rm -f /var/log/facebook-ads-manager/*.log
            echo "Application logs cleared."
        fi
        
        # Clear Docker logs is not easily possible, but we can restart container
        read -p "Restart container to clear Docker logs? [y/N]: " restart_confirm
        if [[ $restart_confirm =~ ^[Yy]$ ]]; then
            docker restart facebook-ads-manager-container
            echo "Container restarted."
        fi
    fi
    echo ""
    read -p "Press Enter to continue..."
}

# Main loop
while true; do
    clear
    echo "=== Facebook Ads Manager Log Viewer ==="
    echo "Container Status: $(docker ps --filter name=facebook-ads-manager-container --format "table {{.Status}}" | tail -1)"
    echo ""
    
    show_menu
    
    case $choice in
        1) view_docker_logs ;;
        2) view_error_logs ;;
        3) view_combined_logs ;;
        4) view_app_logs ;;
        5) view_all_logs ;;
        6) follow_live_logs ;;
        7) search_logs ;;
        8) clear_logs ;;
        9) echo "Goodbye!"; exit 0 ;;
        *) echo "Invalid option. Please try again."; sleep 2 ;;
    esac
done
