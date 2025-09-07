// Carousel for Welcome Banner
let slideIndex = 1;
showSlides(slideIndex);

function currentSlide(n) {
    showSlides(slideIndex = n);
}

function showSlides(n) {
    let i;
    let slides = document.getElementsByClassName("carousel-slide");
    let indicators = document.getElementsByClassName("indicator");
    if (n > slides.length) {slideIndex = 1}
    if (n < 1) {slideIndex = slides.length}
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    }
    for (i = 0; i < indicators.length; i++) {
        indicators[i].className = indicators[i].className.replace(" active", "");
    }
    slides[slideIndex-1].style.display = "block";
    indicators[slideIndex-1].className += " active";
}

// Chart.js initializations
document.addEventListener('DOMContentLoaded', function() {
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
                backgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});