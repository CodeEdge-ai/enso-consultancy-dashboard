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
}
