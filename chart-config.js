// Chart Configuration for Dashboard

function initCharts() {
    // Get data from localStorage
    const reports = JSON.parse(localStorage.getItem('ensoReports') || '[]');
    
    // Sort reports by date
    reports.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Get last 7 days of data
    const last7Days = reports.slice(-7);
    
    // Prepare data for charts
    const dates = last7Days.map(report => {
        const date = new Date(report.date);
        return date.toLocaleDateString('en-US', { weekday: 'short' });
    });
    
    const bookingsData = last7Days.map(report => report.bookings || 0);
    const messagesData = last7Days.map(report => report.messages || 0);
    const followupsData = last7Days.map(report => report.followups || 0);
    
    // Weekly Performance Chart
    const weeklyCtx = document.getElementById('weeklyChart').getContext('2d');
    new Chart(weeklyCtx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Bookings',
                    data: bookingsData,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Messages',
                    data: messagesData,
                    borderColor: '#2ecc71',
                    backgroundColor: 'rgba(46, 204, 113, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Follow-ups',
                    data: followupsData,
                    borderColor: '#9b59b6',
                    backgroundColor: 'rgba(155, 89, 182, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Last 7 Days Performance'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Count'
                    }
                }
            }
        }
    });
    
    // Activity Distribution Chart
    const activityCtx = document.getElementById('activityChart').getContext('2d');
    
    // Calculate totals for pie chart
    const totalBookings = bookingsData.reduce((a, b) => a + b, 0);
    const totalMessages = messagesData.reduce((a, b) => a + b, 0);
    const totalFollowups = followupsData.reduce((a, b) => a + b, 0);
    
    new Chart(activityCtx, {
        type: 'doughnut',
        data: {
            labels: ['Bookings', 'Messages', 'Follow-ups'],
            datasets: [{
                data: [totalBookings, totalMessages, totalFollowups],
                backgroundColor: [
                    'rgba(52, 152, 219, 0.8)',
                    'rgba(46, 204, 113, 0.8)',
                    'rgba(155, 89, 182, 0.8)'
                ],
                borderColor: [
                    'rgb(52, 152, 219)',
                    'rgb(46, 204, 113)',
                    'rgb(155, 89, 182)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                },
                title: {
                    display: true,
                    text: 'Activity Distribution (Last 7 Days)'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// Initialize charts when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit to ensure DOM is fully loaded
    setTimeout(initCharts, 500);
});
