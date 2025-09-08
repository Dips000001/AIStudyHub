// Carousel for Welcome Banner
let slideIndex = 1;
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

// showSlides(slideIndex);

// function currentSlide(n) {
//     showSlides(slideIndex = n);
// }

// function showSlides(n) {
//     let i;
//     let slides = document.getElementsByClassName("carousel-slide");
//     let indicators = document.getElementsByClassName("indicator");
//     if (n > slides.length) {slideIndex = 1}
//     if (n < 1) {slideIndex = slides.length}
//     for (i = 0; i < slides.length; i++) {
//         slides[i].style.display = "none";
//     }
//     for (i = 0; i < indicators.length; i++) {
//         indicators[i].className = indicators[i].className.replace(" active", "");
//     }
//     slides[slideIndex-1].style.display = "block";
//     indicators[slideIndex-1].className += " active";
// }

// Generate random encouragement message
function generateEncouragementMessage() {
    const randomIndex = Math.floor(Math.random() * encouragementMessages.length);
    const encouragementElement = document.getElementById('encouragementText');
    if (encouragementElement) {
        encouragementElement.textContent = encouragementMessages[randomIndex];
    }
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

// Chart.js initializations
document.addEventListener('DOMContentLoaded', function() {
    initializeCarousel();
    // initializeCharts();
    initializeCalendar();
    generateEncouragementMessage();

    // Genre Chart
    var genreCtx = document.getElementById('genreChart').getContext('2d');
    var genreChart = new Chart(genreCtx, {
        type: 'doughnut',
        data: {
            labels: ['Fiction', 'Non-Fiction', 'Academic'],
            datasets: [{
                data: [5, 4, 3],
                backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: { display: false }
        }
    });

    // Performance Chart
    var performanceCtx = document.getElementById('performanceChart').getContext('2d');
    var performanceChart = new Chart(performanceCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'CGPA Trend',
                data: [3.05, 3.10, 3.15, 3.20],
                borderColor: '#007bff',
                fill: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Reading Hours Chart
    var readingHoursCtx = document.getElementById('readingHoursChart').getContext('2d');
    var readingHoursChart = new Chart(readingHoursCtx, {
        type: 'bar',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Hours Read',
                data: [10, 12, 8, 15],
                backgroundColor: [
                    'rgba(66, 133, 244, 0.8)',
                    'rgba(52, 168, 83, 0.8)',
                    'rgba(251, 188, 4, 0.8)',
                    'rgba(234, 67, 53, 0.8)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});