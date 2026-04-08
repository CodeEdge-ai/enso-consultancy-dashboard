// Daily Reports System - Main Script

// DOM Elements
let dailyBookings = 0;
let dailyMessages = 0;
let dailyFollowups = 0;
let jumiaOrders = 0;
let partnershipLeads = 0;

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Set current date
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('currentDate').textContent = now.toLocaleDateString('en-US', options);
    
    // Load saved data from localStorage
    loadSavedData();
    
    // Initialize sliders
    initializeSliders();
    
    // Load recent reports
    loadRecentReports();
    
    // Initialize charts
    initializeCharts();
    
    // Update performance score
    updatePerformanceScore();
});

// Initialize slider functionality
function initializeSliders() {
    const messageSlider = document.getElementById('messageSlider');
    const followupSlider = document.getElementById('followupSlider');
    
    messageSlider.addEventListener('input', function() {
        dailyMessages = parseInt(this.value);
        updateMessageDisplay();
        updatePerformanceScore();
    });
    
    followupSlider.addEventListener('input', function() {
        dailyFollowups = parseInt(this.value);
        updateFollowupDisplay();
        updatePerformanceScore();
    });
}

// Adjust booking counter
function adjustCounter(counterId, change) {
    const counter = document.getElementById(counterId);
    let value = parseInt(counter.textContent) + change;
    value = Math.max(0, value);
    counter.textContent = value;
    
    if (counterId === 'bookingCounter') {
        dailyBookings = value;
        updateBookingDisplay();
        updatePerformanceScore();
    }
}

// Update displays
function updateBookingDisplay() {
    const bookingElement = document.getElementById('dailyBookings');
    const progressElement = document.getElementById('bookingProgress');
    
    bookingElement.textContent = `${dailyBookings}/2`;
    
    const progressPercent = Math.min((dailyBookings / 2) * 100, 100);
    progressElement.style.width = `${progressPercent}%`;
    
    // Update color based on progress
    progressElement.style.backgroundColor = dailyBookings >= 2 ? '#27ae60' : 
                                           dailyBookings >= 1 ? '#f39c12' : '#e74c3c';
}

function updateMessageDisplay() {
    const messageElement = document.getElementById('dailyMessages');
    const progressElement = document.getElementById('messageProgress');
    
    messageElement.textContent = `${dailyMessages}/20`;
    
    const progressPercent = Math.min((dailyMessages / 20) * 100, 100);
    progressElement.style.width = `${progressPercent}%`;
    progressElement.style.backgroundColor = dailyMessages >= 20 ? '#27ae60' : 
                                            dailyMessages >= 10 ? '#f39c12' : '#e74c3c';
}

function updateFollowupDisplay() {
    // Update status display for followups
    const followupElement = document.getElementById('followupSlider');
    // Progress is handled by the slider itself
}

// Save daily progress to localStorage
function saveDailyProgress() {
    const today = new Date().toISOString().split('T')[0];
    const progressData = {
        date: today,
        bookings: dailyBookings,
        messages: dailyMessages,
        followups: dailyFollowups,
        jumiaOrders: jumiaOrders,
        partnershipLeads: partnershipLeads,
        timestamp: new Date().toISOString()
    };
    
    // Get existing reports
    let reports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    
    // Check if today's report already exists
    const existingIndex = reports.findIndex(report => report.date === today);
    if (existingIndex >= 0) {
        reports[existingIndex] = progressData;
    } else {
        reports.push(progressData);
    }
    
    // Save to localStorage
    localStorage.setItem('ensoReports', JSON.stringify(reports));
    
    // Update last updated time
    document.getElementById('lastUpdated').textContent = new Date().toLocaleTimeString();
    
    // Show summary modal
    showSummaryModal(progressData);
    
    // Update UI
    loadRecentReports();
    updatePerformanceScore();
}

// Load saved data from localStorage
function loadSavedData() {
    const today = new Date().toISOString().split('T')[0];
    const reports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    const todayReport = reports.find(report => report.date === today);
    
    if (todayReport) {
        dailyBookings = todayReport.bookings || 0;
        dailyMessages = todayReport.messages || 0;
        dailyFollowups = todayReport.followups || 0;
        jumiaOrders = todayReport.jumiaOrders || 0;
        partnershipLeads = todayReport.partnershipLeads || 0;
        
        // Update UI
        document.getElementById('bookingCounter').textContent = dailyBookings;
        document.getElementById('messageSlider').value = dailyMessages;
        document.getElementById('followupSlider').value = dailyFollowups;
        document.getElementById('jumiaOrders').textContent = jumiaOrders;
        document.getElementById('partnershipLeads').textContent = partnershipLeads;
        
        updateBookingDisplay();
        updateMessageDisplay();
    }
    
    // Update data status
    document.getElementById('dataStatus').textContent = 
        reports.length > 0 ? `${reports.length} reports saved` : 'No reports saved';
}

// Load recent reports
function loadRecentReports() {
    const reportsContainer = document.getElementById('reportsContainer');
    const reports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    
    if (reports.length === 0) {
        reportsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list fa-2x"></i>
                <p>No daily reports submitted yet.</p>
                <p>Submit your first report to see data here.</p>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    reports.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Show last 5 reports
    const recentReports = reports.slice(0, 5);
    
    let html = '<div class="reports-grid">';
    
    recentReports.forEach(report => {
        const date = new Date(report.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
        
        // Calculate performance score for this report
        const score = calculateDailyScore(report);
        
        html += `
            <div class="report-card">
                <div class="report-header">
                    <h4>${formattedDate}</h4>
                    <span class="score-badge ${score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'}">
                        ${score}%
                    </span>
                </div>
                <div class="report-metrics">
                    <div class="metric-item">
                        <span class="metric-label">Bookings:</span>
                        <span class="metric-value ${report.bookings >= 2 ? 'achieved' : ''}">
                            ${report.bookings}/2
                        </span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Messages:</span>
                        <span class="metric-value ${report.messages >= 20 ? 'achieved' : ''}">
                            ${report.messages}/20
                        </span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Follow-ups:</span>
                        <span class="metric-value ${report.followups >= 10 ? 'achieved' : ''}">
                            ${report.followups}/10
                        </span>
                    </div>
                    <div class="metric-item">
                        <span class="metric-label">Jumia Orders:</span>
                        <span class="metric-value">${report.jumiaOrders}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    reportsContainer.innerHTML = html;
    
    // Add CSS for reports grid
    if (!document.querySelector('#reports-styles')) {
        const style = document.createElement('style');
        style.id = 'reports-styles';
        style.textContent = `
            .reports-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
                gap: 15px;
            }
            .report-card {
                background: white;
                border-radius: 8px;
                padding: 15px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                border-left: 4px solid #3498db;
            }
            .report-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                padding-bottom: 10px;
                border-bottom: 1px solid #eee;
            }
            .score-badge {
                padding: 3px 10px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: bold;
                color: white;
            }
            .score-badge.high { background-color: #27ae60; }
            .score-badge.medium { background-color: #f39c12; }
            .score-badge.low { background-color: #e74c3c; }
            .metric-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 5px;
                font-size: 0.9rem;
            }
            .metric-value.achieved {
                color: #27ae60;
                font-weight: bold;
            }
        `;
        document.head.appendChild(style);
    }
}

// Calculate performance score
function calculateDailyScore(report) {
    let score = 0;
    
    // Bookings (50 points max)
    score += Math.min((report.bookings / 2) * 50, 50);
    
    // Messages (30 points max)
    score += Math.min((report.messages / 20) * 30, 30);
    
    // Follow-ups (20 points max)
    score += Math.min((report.followups / 10) * 20, 20);
    
    return Math.round(score);
}

function updatePerformanceScore() {
    const todayReport = {
        bookings: dailyBookings,
        messages: dailyMessages,
        followups: dailyFollowups,
        jumiaOrders: jumiaOrders,
        partnershipLeads: partnershipLeads
    };
    
    const score = calculateDailyScore(todayReport);
    document.getElementById('performanceScore').textContent = `${score}%`;
    
    // Update color based on score
    const badge = document.getElementById('performanceScore').parentElement;
    if (score >= 80) {
        badge.style.backgroundColor = '#27ae60';
    } else if (score >= 50) {
        badge.style.backgroundColor = '#f39c12';
    } else {
        badge.style.backgroundColor = '#e74c3c';
    }
}

// Show summary modal
function showSummaryModal(data) {
    const score = calculateDailyScore(data);
    const modal = document.getElementById('summaryModal');
    const summaryContent = document.getElementById('modalSummary');
    
    summaryContent.innerHTML = `
        <div class="summary-item">
            <h3>Daily Performance Summary</h3>
            <p><strong>Performance Score:</strong> <span class="score ${score >= 80 ? 'high' : score >= 50 ? 'medium' : 'low'}">${score}%</span></p>
        </div>
        <div class="summary-grid">
            <div class="summary-metric">
                <span class="metric-label">Bookings Closed</span>
                <span class="metric-value ${data.bookings >= 2 ? 'achieved' : ''}">${data.bookings}/2</span>
            </div>
            <div class="summary-metric">
                <span class="metric-label">Messages Sent</span>
                <span class="metric-value ${data.messages >= 20 ? 'achieved' : ''}">${data.messages}/20</span>
            </div>
            <div class="summary-metric">
                <span class="metric-label">Follow-ups Completed</span>
                <span class="metric-value ${data.followups >= 10 ? 'achieved' : ''}">${data.followups}/10</span>
            </div>
            <div class="summary-metric">
                <span class="metric-label">Jumia Orders</span>
                <span class="metric-value">${data.jumiaOrders}</span>
            </div>
        </div>
        <p style="margin-top: 15px; font-style: italic;">Data saved to local storage. Submit a full report for detailed tracking.</p>
    `;
    
    modal.style.display = 'flex';
    
    // Add styles for modal
    if (!document.querySelector('#modal-styles')) {
        const style = document.createElement('style');
        style.id = 'modal-styles';
        style.textContent = `
            .summary-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                margin: 15px 0;
            }
            .summary-metric {
                background: white;
                padding: 10px;
                border-radius: 6px;
                border-left: 4px solid #3498db;
            }
            .metric-label {
                display: block;
                font-size: 0.9rem;
                color: #666;
            }
            .metric-value {
                font-size: 1.2rem;
                font-weight: bold;
                color: #2c3e50;
            }
            .metric-value.achieved {
                color: #27ae60;
            }
            .score {
                font-weight: bold;
                padding: 2px 8px;
                border-radius: 4px;
            }
            .score.high { background-color: #d4edda; color: #155724; }
            .score.medium { background-color: #fff3cd; color: #856404; }
            .score.low { background-color: #f8d7da; color: #721c24; }
        `;
        document.head.appendChild(style);
    }
}

function closeModal() {
    document.getElementById('summaryModal').style.display = 'none';
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('summaryModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}

// Load sample data for demonstration
function loadSampleData() {
    // Sample data for the past 7 days
    const sampleReports = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const dateString = date.toISOString().split('T')[0];
        
        sampleReports.push({
            date: dateString,
            bookings: Math.floor(Math.random() * 4), // 0-3 bookings
            messages: Math.floor(Math.random() * 10) + 15, // 15-25 messages
            followups: Math.floor(Math.random() * 6) + 5, // 5-10 followups
            jumiaOrders: Math.floor(Math.random() * 8), // 0-7 orders
            partnershipLeads: Math.floor(Math.random() * 3), // 0-2 leads
            timestamp: date.toISOString()
        });
    }
    
    // Save sample data
    localStorage.setItem('ensoReports', JSON.stringify(sampleReports));
    
    // Reload the page to show sample data
    location.reload();
}

// Initialize charts (will be implemented in chart-config.js)
function initializeCharts() {
    // This function is defined in chart-config.js
    if (typeof initCharts === 'function') {
        initCharts();
    }
}

// Export data function
function exportData() {
    const reports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    const dataStr = JSON.stringify(reports, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `enso-reports-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

// Import data function
function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            localStorage.setItem('ensoReports', JSON.stringify(importedData));
            alert('Data imported successfully!');
            loadRecentReports();
        } catch (error) {
            alert('Error importing data. Please check the file format.');
        }
    };
    reader.readAsText(file);
    // PWA Installation
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    // Update UI to show the install button
    if (installBtn) {
        installBtn.style.display = 'flex';
        installBtn.addEventListener('click', installPWA);
    }
    
    // Show install prompt after 5 seconds
    setTimeout(showInstallPrompt, 5000);
});

function installPWA() {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            showToast('App installed successfully!');
            if (installBtn) installBtn.style.display = 'none';
        } else {
            console.log('User dismissed the install prompt');
        }
        deferredPrompt = null;
    });
}

function showInstallPrompt() {
    if (deferredPrompt && !localStorage.getItem('installPromptShown')) {
        const prompt = document.createElement('div');
        prompt.className = 'install-prompt';
        prompt.innerHTML = `
            <div class="install-prompt-content">
                <h4><i class="fas fa-mobile-alt"></i> Install ENSO Dashboard</h4>
                <p>Install this app on your device for quick access and offline use.</p>
            </div>
            <div class="install-prompt-actions">
                <button class="btn btn-secondary" onclick="dismissInstallPrompt()">Later</button>
                <button class="btn btn-primary" onclick="installPWA()">Install</button>
            </div>
        `;
        document.body.appendChild(prompt);
        prompt.style.display = 'flex';
        localStorage.setItem('installPromptShown', 'true');
    }
}

function dismissInstallPrompt() {
    const prompt = document.querySelector('.install-prompt');
    if (prompt) prompt.remove();
}

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered: ', registration.scope);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            showToast('New version available! Refresh to update.');
                        }
                    });
                });
            })
            .catch(error => {
                console.log('ServiceWorker registration failed: ', error);
            });
    });
}

// Online/Offline Detection
window.addEventListener('online', () => {
    document.getElementById('offlineIndicator').style.display = 'none';
    showToast('Back online!');
});

window.addEventListener('offline', () => {
    document.getElementById('offlineIndicator').style.display = 'block';
});

// Lock/Unlock System
function checkLockStatus() {
    const isLocked = localStorage.getItem('ensoDashboardLocked') === 'true';
    const lockStatus = document.getElementById('lockStatus');
    
    if (lockStatus) {
        if (isLocked) {
            lockStatus.className = 'lock-status locked';
            lockStatus.innerHTML = '<i class="fas fa-lock"></i> <span>Locked</span>';
            
            // Check if we're on admin page
            if (!window.location.pathname.includes('admin-lock.html')) {
                // Redirect to lock page if not already there
                if (!window.location.pathname.includes('admin-lock.html')) {
                    window.location.href = 'admin-lock.html';
                }
            }
        } else {
            lockStatus.className = 'lock-status';
            lockStatus.innerHTML = '<i class="fas fa-lock-open"></i> <span>Unlocked</span>';
        }
    }
    
    return isLocked;
}

// Check lock status on page load
document.addEventListener('DOMContentLoaded', function() {
    // ... existing code ...
    
    // Check lock status
    checkLockStatus();
    
    // Add offline indicator to body
    const offlineIndicator = document.createElement('div');
    offlineIndicator.id = 'offlineIndicator';
    offlineIndicator.className = 'offline-indicator';
    offlineIndicator.innerHTML = '<i class="fas fa-wifi-slash"></i> You are offline. Some features may be limited.';
    offlineIndicator.style.display = 'none';
    document.body.appendChild(offlineIndicator);
});

// Toast notification function
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, 3000);
}

// Export functions for bonus reports
function generateBonusReport() {
    const reports = JSON.parse(localStorage.getItem('ensoFullReports') || '[]');
    const quickReports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    
    // Calculate monthly totals
    const monthlyData = calculateMonthlyTotals(reports, quickReports);
    
    return monthlyData;
}

function calculateMonthlyTotals(fullReports, quickReports) {
    const monthlyTotals = {};
    
    // Process full reports
    fullReports.forEach(report => {
        const month = report.date.substring(0, 7); // YYYY-MM
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = {
                bookings: 0,
                revenue: 0,
                incentives: 0,
                messages: 0,
                followups: 0,
                jumiaOrders: 0,
                partnershipLeads: 0,
                days: 0
            };
        }
        
        monthlyTotals[month].bookings += report.bookings || 0;
        monthlyTotals[month].revenue += report.revenue || 0;
        monthlyTotals[month].incentives += report.incentives || 0;
        monthlyTotals[month].messages += report.messages || 0;
        monthlyTotals[month].followups += report.followups || 0;
        monthlyTotals[month].jumiaOrders += report.jumiaOrders || 0;
        monthlyTotals[month].partnershipLeads += report.partnershipLeads || 0;
        monthlyTotals[month].days += 1;
    });
    
    // Process quick reports for missing data
    quickReports.forEach(report => {
        const month = report.date.substring(0, 7);
        if (!monthlyTotals[month]) {
            monthlyTotals[month] = {
                bookings: 0,
                revenue: 0,
                incentives: 0,
                messages: 0,
                followups: 0,
                jumiaOrders: 0,
                partnershipLeads: 0,
                days: 0
            };
        }
        
        // Only add if not already in full reports
        if (!fullReports.some(r => r.date === report.date)) {
            monthlyTotals[month].bookings += report.bookings || 0;
            monthlyTotals[month].messages += report.messages || 0;
            monthlyTotals[month].followups += report.followups || 0;
            monthlyTotals[month].jumiaOrders += report.jumiaOrders || 0;
            monthlyTotals[month].partnershipLeads += report.partnershipLeads || 0;
            monthlyTotals[month].days += 1;
        }
    });
    
    return monthlyTotals;
}

// Download PDF Report
function downloadPDFReport(type = 'monthly') {
    const data = generateBonusReport();
    const today = new Date();
    const currentMonth = today.toISOString().substring(0, 7);
    
    // Create PDF content
    const pdfContent = generatePDFContent(data, type);
    
    // Create download link
    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    
    link.href = url;
    link.download = `enso-${type}-report-${currentMonth}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} report downloaded!`, 'success');
}

// Generate PDF Content
function generatePDFContent(data, type) {
    // This is a simplified PDF generation
    // In a real app, you would use a library like jsPDF or pdfmake
    
    const today = new Date().toLocaleDateString();
    let content = `
ENSO Consultancy & Services Ltd.
${type.charAt(0).toUpperCase() + type.slice(1)} Bonus Report
Generated: ${today}
==================================================

`;
    
    if (type === 'monthly') {
        Object.entries(data).forEach(([month, totals]) => {
            const bookingBonus = totals.bookings * 500;
            const totalBonus = bookingBonus + (totals.incentives || 0);
            
            content += `
Month: ${month}
--------------------------------------------------
Bookings: ${totals.bookings} (Bonus: KES ${bookingBonus.toLocaleString()})
Revenue Generated: KES ${totals.revenue.toLocaleString()}
Total Incentives: KES ${totals.incentives.toLocaleString()}
Messages Sent: ${totals.messages}
Follow-ups: ${totals.followups}
Jumia Orders: ${totals.jumiaOrders}
Partnership Leads: ${totals.partnershipLeads}
Days Worked: ${totals.days}

TOTAL BONUS EARNED: KES ${totalBonus.toLocaleString()}
==================================================

`;
        });
    } else {
        // Daily report
        const quickReports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
        quickReports.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        quickReports.slice(0, 30).forEach(report => {
            const date = new Date(report.date).toLocaleDateString();
            const bookingBonus = (report.bookings || 0) * 500;
            
            content += `
Date: ${date}
--------------------------------------------------
Bookings: ${report.bookings || 0} (Bonus: KES ${bookingBonus.toLocaleString()})
Messages: ${report.messages || 0}/20
Follow-ups: ${report.followups || 0}/10
Jumia Orders: ${report.jumiaOrders || 0}
Partnership Leads: ${report.partnershipLeads || 0}

`;
        });
    }
    
    content += `
==================================================
Base Salary: KES 35,000/month
Booking Bonus: KES 500 per booking
==================================================
`;
    
    return content;
}

// Download Excel Report
function downloadExcelReport(type = 'monthly') {
    const data = generateBonusReport();
    const today = new Date().toISOString().split('T')[0];
    
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (type === 'monthly') {
        csvContent += "Month,Bookings,Booking Bonus,Revenue,Other Incentives,Total Bonus,Messages,Follow-ups,Jumia Orders,Partnership Leads,Days Worked\n";
        
        Object.entries(data).forEach(([month, totals]) => {
            const bookingBonus = totals.bookings * 500;
            const totalBonus = bookingBonus + (totals.incentives || 0);
            
            csvContent += `${month},${totals.bookings},${bookingBonus},${totals.revenue},${totals.incentives || 0},${totalBonus},${totals.messages},${totals.followups},${totals.jumiaOrders},${totals.partnershipLeads},${totals.days}\n`;
        });
    } else {
        csvContent += "Date,Bookings,Booking Bonus,Messages,Follow-ups,Jumia Orders,Partnership Leads,Response Time,Focus Area\n";
        
        const fullReports = JSON.parse(localStorage.getItem('ensoFullReports') || '[]');
        fullReports.sort((a, b) => new Date(b.date) - new Date(a.date));
        
        fullReports.forEach(report => {
            const bookingBonus = (report.bookings || 0) * 500;
            csvContent += `${report.date},${report.bookings || 0},${bookingBonus},${report.messages || 0},${report.followups || 0},${report.jumiaOrders || 0},${report.partnershipLeads || 0},${report.responseTime || ''},${report.focusArea || ''}\n`;
        });
    }
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `enso-${type}-report-${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} Excel report downloaded!`, 'success');
}

}
