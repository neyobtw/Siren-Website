/**
 * Maintenance Mode Script
 * 
 * This script checks if maintenance is enabled by looking for a flag in maintenance
 * To enable maintenance mode, set the text content of .maintenance-flag to 'TRUE' in maintenance
 */

// Helper function to check if we're on the maintenance page
function isMaintenancePage() {
    const path = window.location.pathname;
    return path.endsWith('maintenance') || path.endsWith('maintenance/') || path.endsWith('maintenance.html');
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the maintenance page
    if (isMaintenancePage()) {
        // If maintenance is disabled and we're on the maintenance page, redirect to home
        fetch('maintenance', { cache: 'no-store' })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const maintenanceFlag = doc.querySelector('.maintenance-flag');
                const isMaintenance = maintenanceFlag?.textContent.trim() === 'TRUE';
                
                if (!isMaintenance) {
                    window.location.href = '/';
                }
            });
        return;
    }
    
    // Check maintenance status for all other pages
    fetch('maintenance', { cache: 'no-store' })
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const maintenanceFlag = doc.querySelector('.maintenance-flag');
            const isMaintenance = maintenanceFlag?.textContent.trim() === 'TRUE';
            
            if (isMaintenance) {
                // Redirect to maintenance page with clean URL
                window.location.href = '/maintenance';
            }
        })
        .catch(error => {
            console.error('Error checking maintenance status:', error);
            // If there's an error, assume maintenance is not enabled
        });
});

// Also run the check in case the DOM is already loaded
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    const event = new Event('DOMContentLoaded');
    document.dispatchEvent(event);
}
