// Dashboard functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Calendar functionality
function initializeCalendar() {
    generateCalendar(currentMonth, currentYear);
}

function generateCalendar(month, year) {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    
    // Update month display
    document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
    
    // Clear existing calendar days (except headers)
    const calendarGrid = document.querySelector('.calendar-grid');
    const headers = calendarGrid.querySelectorAll('.calendar-day.header');
    calendarGrid.innerHTML = '';
    
    // Re-add headers
    headers.forEach(header => calendarGrid.appendChild(header));
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day';
        calendarGrid.appendChild(emptyDay);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // Highlight today
        if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
            dayElement.classList.add('today');
        }
        
        // Mark days with events
        if (hasEvent(year, month, day)) {
            dayElement.classList.add('has-event');
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function hasEvent(year, month, day) {
    // Sample events - in a real app, this would come from a database
    const events = [
        { year: 2024, month: 0, day: 15 }, // January 15
        { year: 2024, month: 0, day: 18 }, // January 18
        { year: 2024, month: 0, day: 22 }  // January 22
    ];
    
    return events.some(event => 
        event.year === year && event.month === month && event.day === day
    );
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
}

// Continue reading functionality
function continueReading() {
    // In a real application, this would navigate to the reading page
    alert('Redirecting to reading page for "Statistics" by Gordon and Finch...');
    // window.location.href = '/reading/statistics-gordon-finch';
}

// Chart.js initializations
document.addEventListener('DOMContentLoaded', function() {
    initializeCalendar();
    initializeCharts();
});

function initializeCharts() {
    // Genre Chart (Doughnut)
    const genreCtx = document.getElementById('genreChart');
    if (genreCtx) {
        new Chart(genreCtx, {
            type: 'doughnut',
            data: {
                labels: ['Fiction', 'Non-Fiction', 'Academic'],
                datasets: [{
                    data: [5, 4, 3],
                    backgroundColor: ['#4285f4', '#34a853', '#fbbc04'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                cutout: '60%'
            }
        });
    }

    // CGPA Trend Chart (Line)
    const cgpaCtx = document.getElementById('cgpaChart');
    if (cgpaCtx) {
        new Chart(cgpaCtx, {
            type: 'line',
            data: {
                labels: ['Year1 Sem1', 'Year1 Sem2', 'Year1 Summer Sem', 'Year2 Sem1'],
                datasets: [{
                    label: 'CGPA',
                    data: [3.04, 3.08, 3.16, 3.20],
                    borderColor: '#4285f4',
                    backgroundColor: 'rgba(66, 133, 244, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4285f4',
                    pointBorderColor: '#ffffff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 3.0,
                        max: 3.25,
                        ticks: {
                            stepSize: 0.02
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}