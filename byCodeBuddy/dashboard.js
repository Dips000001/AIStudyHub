// Global variables
let currentSlideIndex = 0;
let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let slideInterval;

// Encouragement messages
const encouragementMessages = [
    "Every page you read is a step closer to your dreams. Keep pushing forward!",
    "Your dedication to learning is inspiring. Today is another opportunity to grow!",
    "Success is the sum of small efforts repeated day in and day out. You're doing amazing!",
    "Knowledge is power, and you're building an incredible foundation. Stay curious!",
    "Reading opens doors to infinite possibilities. You're on the right path!",
    "Each book you complete makes you stronger and wiser. Keep going!",
    "Your commitment to learning will pay off in ways you can't imagine yet.",
    "Great minds read great books. You're developing yours every day!"
];

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    initializeCharts();
    initializeCalendar();
    generateEncouragementMessage();
});

// Carousel functionality
function initializeCarousel() {
    startCarousel();
}

function startCarousel() {
    slideInterval = setInterval(() => {
        nextSlide();
    }, 5000); // Change slide every 5 seconds
}

function stopCarousel() {
    clearInterval(slideInterval);
}

function currentSlide(n) {
    stopCarousel();
    showSlide(n - 1);
    startCarousel();
}

function nextSlide() {
    currentSlideIndex = (currentSlideIndex + 1) % 3;
    showSlide(currentSlideIndex);
}

function showSlide(n) {
    const slides = document.querySelectorAll('.carousel-slide');
    const indicators = document.querySelectorAll('.indicator');
    
    slides.forEach(slide => slide.classList.remove('active'));
    indicators.forEach(indicator => indicator.classList.remove('active'));
    
    slides[n].classList.add('active');
    indicators[n].classList.add('active');
    
    currentSlideIndex = n;
}

// Generate random encouragement message
function generateEncouragementMessage() {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    const encouragementElement = document.getElementById('encouragementText');
    if (encouragementElement) {
        encouragementElement.textContent = encouragementMessages[randomIndex];
    }
}

// Account dropdown functionality
function toggleDropdown() {
    const dropdown = document.getElementById('dropdownMenu');
    dropdown.classList.toggle('show');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.getElementById('dropdownMenu');
    const accountBtn = document.querySelector('.account-btn');
    
    if (!accountBtn.contains(event.target) && !dropdown.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});

// Initialize charts
function initializeCharts() {
    initializeGenreChart();
    initializePerformanceChart();
    initializeReadingHoursChart();
}

// Genre distribution chart (doughnut)
function initializeGenreChart() {
    const ctx = document.getElementById('genreChart').getContext('2d');
    new Chart(ctx, {
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
                legend: {
                    display: false
                }
            },
            cutout: '60%'
        }
    });
}

// Performance chart (line chart)
function initializePerformanceChart() {
    const ctx = document.getElementById('performanceChart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'CGPA',
                data: [2.8, 3.0, 3.1, 3.2],
                borderColor: '#4285f4',
                backgroundColor: 'rgba(66, 133, 244, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 2.5,
                    max: 4.0
                }
            }
        }
    });
}

// Reading hours chart (bar chart)
function initializeReadingHoursChart() {
    const ctx = document.getElementById('readingHoursChart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Hours',
                data: [8, 12, 15, 10],
                backgroundColor: [
                    'rgba(66, 133, 244, 0.8)',
                    'rgba(52, 168, 83, 0.8)',
                    'rgba(251, 188, 4, 0.8)',
                    'rgba(234, 67, 53, 0.8)'
                ],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

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

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // In a real application, you would handle navigation here
            const page = this.getAttribute('href').substring(1);
            console.log(`Navigating to ${page} page`);
        });
    });
});

// Dropdown menu functionality
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const action = this.getAttribute('href').substring(1);
            
            switch(action) {
                case 'profile':
                    alert('Navigating to profile page...');
                    break;
                case 'settings':
                    alert('Navigating to settings page...');
                    break;
                case 'logout':
                    if (confirm('Are you sure you want to logout?')) {
                        alert('Logging out...');
                        // window.location.href = '/login';
                    }
                    break;
            }
            
            // Close dropdown
            document.getElementById('dropdownMenu').classList.remove('show');
        });
    });
});

// Keyword cloud interaction
document.addEventListener('DOMContentLoaded', function() {
    const keywords = document.querySelectorAll('.keyword');
    
    keywords.forEach(keyword => {
        keyword.addEventListener('click', function() {
            const keywordText = this.textContent;
            alert(`Searching for content related to: ${keywordText}`);
            // In a real app, this would trigger a search or filter
        });
    });
});

// Responsive chart resizing
window.addEventListener('resize', function() {
    // Charts will automatically resize due to responsive: true option
    // This is just a placeholder for any additional resize logic
});

// Performance metrics animation
function animateMetrics() {
    const metrics = document.querySelectorAll('.metric-number');
    
    metrics.forEach(metric => {
        const finalValue = parseInt(metric.textContent);
        let currentValue = 0;
        const increment = finalValue / 50; // Animate over 50 steps
        
        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= finalValue) {
                currentValue = finalValue;
                clearInterval(timer);
            }
            
            if (metric.textContent.includes('.')) {
                metric.textContent = currentValue.toFixed(2);
            } else {
                metric.textContent = Math.floor(currentValue);
            }
        }, 20);
    });
}

// Initialize animations when page loads
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(animateMetrics, 500); // Start animation after a short delay
});

// Add smooth scrolling for internal links
document.addEventListener('DOMContentLoaded', function() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
});