// Dashboard functionality
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();

// Get user events from backend data (passed from template)
let userEvents = [];

// Initialize user events from backend data
function initializeUserEvents() {
    if (window.userEventsData) {
        userEvents = window.userEventsData.map(event => ({
            id: event.title + '_' + event.date_sort, // Create unique ID
            title: event.title,
            date: event.date_sort,
            startTime: event.time,
            endTime: event.end_time || '', // Use end_time from backend
            venue: event.location || '', // Use location from backend
            type: event.type
        }));
    }
}

// Calendar functionality
function initializeCalendar() {
    initializeUserEvents(); // Initialize events from backend data first
    generateCalendar(currentMonth, currentYear);
    generateUpcomingEvents();
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
    
    // Get events for current month
    const currentMonthEvents = getEventsForMonth(month, year);
    
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
        
        // Check if this day has events and highlight it
        const dayDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dayEvents = userEvents.filter(event => event.date === dayDate);
        
        if (dayEvents.length > 0) {
            dayElement.classList.add('has-event');
            dayElement.title = `${dayEvents.length} event${dayEvents.length > 1 ? 's' : ''}: ${dayEvents.map(e => e.title).join(', ')}`;
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

function getEventsForMonth(month, year) {
    const monthStr = String(month + 1).padStart(2, '0');
    const yearStr = String(year);
    
    return userEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
}

function hasEvent(year, month, day) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return userEvents.some(event => event.date === dateStr);
}

function generateUpcomingEvents() {
    const today = new Date();
    const fifteenDaysFromNow = new Date();
    fifteenDaysFromNow.setDate(today.getDate() + 15);
    
    // Filter events within next 15 days
    const upcomingEvents = userEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate >= today && eventDate <= fifteenDaysFromNow;
    }).sort((a, b) => {
        // Sort by date first, then by time
        const dateComparison = new Date(a.date) - new Date(b.date);
        if (dateComparison !== 0) {
            return dateComparison;
        }
        
        // If dates are the same, sort by time
        const timeA = a.startTime || '00:00';
        const timeB = b.startTime || '00:00';
        
        // Handle time ranges (e.g., "10:00-12:00" becomes "10:00")
        const startTimeA = timeA.includes('-') ? timeA.split('-')[0] : timeA;
        const startTimeB = timeB.includes('-') ? timeB.split('-')[0] : timeB;
        
        return startTimeA.localeCompare(startTimeB);
    });
    
    // Update the upcoming events display
    const eventList = document.querySelector('.event-list');
    if (eventList) {
        eventList.innerHTML = '';
        
        if (upcomingEvents.length === 0) {
            eventList.innerHTML = '<div class="no-events">No upcoming events in the next 15 days</div>';
            return;
        }
        
        upcomingEvents.forEach(event => {
            const eventDate = new Date(event.date);
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                              'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            
            const eventItem = document.createElement('div');
            eventItem.className = 'event-item';
            eventItem.innerHTML = `
                <div class="event-date">${monthNames[eventDate.getMonth()]} ${eventDate.getDate()}</div>
                <div class="event-details">
                    <span class="event-title">${event.title}</span>
                    <div class="event-info">
                        <div class="event-time-info">
                            <i class="fas fa-clock"></i>
                            <span>${event.startTime} - ${event.endTime}</span>
                        </div>
                        <div class="event-venue-info">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${event.venue}</span>
                        </div>
                    </div>
                </div>
            `;
            eventList.appendChild(eventItem);
        });
    }
}

function previousMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    generateCalendar(currentMonth, currentYear);
    generateUpcomingEvents();
}

function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    generateCalendar(currentMonth, currentYear);
    generateUpcomingEvents();
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

// Book Modal Functions
function showBookDetails() {
    const modal = document.getElementById('bookModal');
    modal.style.display = 'block';
    
    // Add event listener for close button
    const closeBtn = document.querySelector('.book-modal-close');
    if (closeBtn) {
        closeBtn.onclick = closeBookModal;
    }
    
    // Close modal when clicking outside
    window.onclick = function(event) {
        if (event.target === modal) {
            closeBookModal();
        }
    }
    
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function closeBookModal() {
    const modal = document.getElementById('bookModal');
    modal.style.display = 'none';
    
    // Restore body scroll
    document.body.style.overflow = 'auto';
    
    // Remove window click listener
    window.onclick = null;
}

function continueReading() {
    // Close modal first
    closeBookModal();
    
    // Simulate navigation to reading page
    // In a real application, this would navigate to the actual reading interface
    alert('Continuing reading "Statistics" by Gordon and Finch...This would normally open the book reader interface.');
    
    // You could replace the alert with actual navigation:
    // window.location.href = '/read/statistics-gordon-finch';
}

// Initialize modal functionality when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Add keyboard support for modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            const modal = document.getElementById('bookModal');
            if (modal && modal.style.display === 'block') {
                closeBookModal();
            }
        }
    });
});