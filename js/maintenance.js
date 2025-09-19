/**
 * Maintenance Mode Script
 * 
 * This script checks if maintenance is enabled by looking for a flag in maintenance.html
 * To enable maintenance mode, set the text content of .maintenance-flag to 'TRUE' in maintenance.html
 */

// Function to check maintenance status
function checkMaintenance() {
    // If we're already on the maintenance page, no need to check
    if (window.location.pathname.endsWith('maintenance.html')) {
        return;
    }
    
    // Try to fetch the maintenance page to check the flag
    fetch('maintenance.html', { cache: 'no-store' })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.text();
        })
        .then(html => {
            // Create a temporary DOM element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Check if maintenance is enabled by looking for the flag
            const maintenanceFlag = doc.querySelector('.maintenance-flag');
            const isMaintenance = maintenanceFlag?.textContent.trim() === 'TRUE';
            
            // If maintenance is enabled, redirect to maintenance page
            if (isMaintenance) {
                console.log('Maintenance mode is enabled - redirecting');
                window.location.href = 'maintenance.html';
            }
        })
        .catch(error => {
            console.error('Error checking maintenance status:', error);
            // If there's an error, assume maintenance is not enabled
            console.log('Assuming maintenance mode is not enabled due to error');
        });
}

// Run the check when the page loads
document.addEventListener('DOMContentLoaded', checkMaintenance);

// Also run the check in case the DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    checkMaintenance();
} else {
    document.addEventListener('DOMContentLoaded', checkMaintenance);
}

// Add a manual check after a short delay to catch any timing issues
setTimeout(checkMaintenance, 500);
