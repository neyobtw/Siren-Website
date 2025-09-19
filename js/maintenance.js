/**
 * Maintenance Mode Script
 * 
 * This script checks if maintenance is enabled by looking for a flag in maintenance.html
 * To enable maintenance mode, set the text content of .maintenance-flag to 'TRUE' in maintenance.html
 */

document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on the maintenance page
    if (window.location.pathname.endsWith('maintenance.html')) {
        // If maintenance is disabled and we're on the maintenance page, redirect to home
        fetch('maintenance.html', { cache: 'no-store' })
            .then(response => response.text())
            .then(html => {
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                const maintenanceFlag = doc.querySelector('.maintenance-flag');
                const isMaintenance = maintenanceFlag?.textContent.trim() === 'TRUE';
                
                if (!isMaintenance) {
                    window.location.href = 'index.html';
                }
            });
        return;
    }
    
    // Check maintenance status for all other pages
    fetch('maintenance.html', { cache: 'no-store' })
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const maintenanceFlag = doc.querySelector('.maintenance-flag');
            const isMaintenance = maintenanceFlag?.textContent.trim() === 'TRUE';
            
            if (isMaintenance) {
                // Redirect to maintenance page
                window.location.href = 'maintenance.html';
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
