// Profile Page JavaScript

// Generate contribution graph
document.addEventListener('DOMContentLoaded', function() {
    generateContributionGraph();
    setupTooltips();
    initializeProfileAnimations();
});

function generateContributionGraph() {
    const grid = document.getElementById('contributionGrid');
    if (!grid) return;
    
    const today = new Date();
    const oneYearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    
    // Calculate total days in the year
    const totalDays = Math.ceil((today - oneYearAgo) / (1000 * 60 * 60 * 24));
    
    // Generate contribution data (mock data)
    const contributions = generateMockContributions(totalDays);
    
    // Create grid squares
    for (let i = 0; i < totalDays; i++) {
        const day = new Date(oneYearAgo);
        day.setDate(day.getDate() + i);
        
        const square = document.createElement('div');
        square.className = `contribution-day level-${contributions[i]}`;
        square.dataset.date = day.toISOString().split('T')[0];
        square.dataset.count = getContributionCount(contributions[i]);
        
        // Add tooltip data
        const dayName = day.toLocaleDateString('en-US', { weekday: 'long' });
        const monthName = day.toLocaleDateString('en-US', { month: 'long' });
        const dayNum = day.getDate();
        const year = day.getFullYear();
        
        square.dataset.tooltip = `${getContributionCount(contributions[i])} reading activities on ${dayName}, ${monthName} ${dayNum}, ${year}`;
        
        grid.appendChild(square);
    }
}

function generateMockContributions(totalDays) {
    const contributions = [];
    
    for (let i = 0; i < totalDays; i++) {
        // Generate realistic reading patterns
        const dayOfWeek = (i + 1) % 7; // 0 = Sunday, 6 = Saturday
        let baseChance = 0.3; // Base 30% chance of reading
        
        // Higher chance on weekends
        if (dayOfWeek === 0 || dayOfWeek === 6) {
            baseChance = 0.6;
        }
        
        // Lower chance on Mondays and Fridays (busy days)
        if (dayOfWeek === 1 || dayOfWeek === 5) {
            baseChance = 0.2;
        }
        
        // Create reading streaks occasionally
        if (i > 0 && contributions[i-1] > 0 && Math.random() < 0.4) {
            baseChance = 0.7;
        }
        
        // Generate contribution level (0-4)
        const random = Math.random();
        let level = 0;
        
        if (random < baseChance) {
            if (random < baseChance * 0.3) level = 4; // Heavy reading day
            else if (random < baseChance * 0.5) level = 3; // Good reading day
            else if (random < baseChance * 0.7) level = 2; // Moderate reading
            else level = 1; // Light reading
        }
        
        contributions.push(level);
    }
    
    return contributions;
}

function getContributionCount(level) {
    switch(level) {
        case 0: return 0;
        case 1: return Math.floor(Math.random() * 2) + 1; // 1-2 activities
        case 2: return Math.floor(Math.random() * 3) + 3; // 3-5 activities
        case 3: return Math.floor(Math.random() * 4) + 6; // 6-9 activities
        case 4: return Math.floor(Math.random() * 6) + 10; // 10-15 activities
        default: return 0;
    }
}

function setupTooltips() {
    const squares = document.querySelectorAll('.contribution-day');
    const tooltip = createTooltip();
    
    squares.forEach(square => {
        square.addEventListener('mouseenter', function(e) {
            showTooltip(e, tooltip, this.dataset.tooltip);
        });
        
        square.addEventListener('mouseleave', function() {
            hideTooltip(tooltip);
        });
        
        square.addEventListener('mousemove', function(e) {
            updateTooltipPosition(e, tooltip);
        });
    });
}

function createTooltip() {
    const tooltip = document.createElement('div');
    tooltip.className = 'contribution-tooltip';
    document.body.appendChild(tooltip);
    return tooltip;
}

function showTooltip(event, tooltip, text) {
    tooltip.textContent = text;
    tooltip.classList.add('show');
    updateTooltipPosition(event, tooltip);
}

function hideTooltip(tooltip) {
    tooltip.classList.remove('show');
}

function updateTooltipPosition(event, tooltip) {
    const rect = tooltip.getBoundingClientRect();
    let left = event.pageX + 10;
    let top = event.pageY - rect.height - 10;
    
    // Adjust if tooltip goes off screen
    if (left + rect.width > window.innerWidth) {
        left = event.pageX - rect.width - 10;
    }
    
    if (top < 0) {
        top = event.pageY + 10;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}

function initializeProfileAnimations() {
    // Animate achievement badges
    const badges = document.querySelectorAll('.achievement-badge');
    badges.forEach((badge, index) => {
        badge.style.animationDelay = `${index * 0.1}s`;
        badge.classList.add('animate-in');
    });
    
    // Add hover effects to profile sections
    const sections = document.querySelectorAll('.section-item');
    sections.forEach(section => {
        section.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
            this.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
        });
        
        section.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = 'none';
        });
    });
}

// Additional profile functionality
function editProfile() {
    // In a real application, this would open an edit modal or navigate to edit page
    alert('Edit profile functionality would be implemented here');
}

function followUser() {
    // In a real application, this would make an API call to follow/unfollow
    const followBtn = event.target;
    const isFollowing = followBtn.textContent.includes('Following');
    
    if (isFollowing) {
        followBtn.textContent = 'Follow';
        followBtn.classList.remove('following');
    } else {
        followBtn.textContent = 'Following';
        followBtn.classList.add('following');
    }
}

// Export functions for potential use in other modules
window.ProfileModule = {
    generateContributionGraph,
    setupTooltips,
    initializeProfileAnimations,
    editProfile,
    followUser
};

// Resources Allocated Functionality
document.addEventListener('DOMContentLoaded', function() {
    initializeResources();
});

function initializeResources() {
    // Resource data
    const resourceData = {
        printing: {
            title: 'Printing Quota',
            used: 750,
            total: 1000,
            unit: 'pages',
            color: '#e91e63',
            details: {
                'Total Quota': '1000 pages',
                'Used': '750 pages',
                'Remaining': '250 pages',
                'Reset Date': 'September 30, 2025',
                'Last Used': 'September 7, 2025'
            }
        },
        studyroom: {
            title: 'Study Room Hours',
            used: 18,
            total: 40,
            unit: 'hours',
            color: '#9e9e9e',
            details: {
                'Total Quota': '40 hours/month',
                'Used': '18 hours',
                'Remaining': '22 hours',
                'Reset Date': 'September 30, 2025',
                'Last Booking': 'September 5, 2025'
            }
        },
        devices: {
            title: 'Device Lending',
            used: 27,
            total: 30,
            unit: 'days',
            color: '#4caf50',
            details: {
                'Total Quota': '30 days/month',
                'Used': '27 days',
                'Remaining': '3 days',
                'Reset Date': 'September 30, 2025',
                'Current Device': 'iPad Pro (due Sep 12)'
            }
        },
        workshops: {
            title: 'Workshop Bookings',
            used: 1,
            total: 4,
            unit: 'bookings',
            color: '#ff5722',
            details: {
                'Total Quota': '4 bookings/month',
                'Used': '1 booking',
                'Remaining': '3 bookings',
                'Reset Date': 'September 30, 2025',
                'Next Workshop': '3D Printer Intro (Sep 10)'
            }
        }
    };

    // Initialize progress rings
    document.querySelectorAll('.resource-item').forEach(item => {
        const resourceType = item.dataset.resource;
        const data = resourceData[resourceType];
        const percentage = Math.round((data.used / data.total) * 100);
        
        // Animate progress ring
        const circle = item.querySelector('.progress-ring-circle');
        if (circle) {
            const circumference = 2 * Math.PI * 40; // radius = 40 (updated for smaller charts)
            const offset = circumference - (percentage / 100) * circumference;
            
            setTimeout(() => {
                circle.style.strokeDashoffset = offset;
            }, 500);
        }
        
        // Add click event for modal
        item.addEventListener('click', () => {
            showResourceModal(resourceType, data);
        });
        
        // Add hover events for tooltip
        item.addEventListener('mouseenter', (e) => {
            showResourceTooltip(e, data, percentage);
        });
        
        item.addEventListener('mouseleave', () => {
            hideResourceTooltip();
        });
        
        item.addEventListener('mousemove', (e) => {
            updateTooltipPosition(e);
        });
    });
    
    // Modal close functionality
    const modal = document.getElementById('resourceModal');
    const closeBtn = document.querySelector('.resource-modal-close');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
}

function showResourceModal(resourceType, data) {
    const modal = document.getElementById('resourceModal');
    const title = document.getElementById('resourceModalTitle');
    const body = document.getElementById('resourceModalBody');
    
    title.textContent = data.title;
    
    // Create modal content
    let modalContent = '';
    for (const [key, value] of Object.entries(data.details)) {
        modalContent += `
            <div class="modal-detail-item">
                <span class="modal-detail-label">${key}:</span>
                <span class="modal-detail-value">${value}</span>
            </div>
        `;
    }
    
    body.innerHTML = modalContent;
    modal.style.display = 'block';
}

function showResourceTooltip(e, data, percentage) {
    const tooltip = document.getElementById('resourceTooltip');
    const remaining = data.total - data.used;
    
    tooltip.innerHTML = `
        <strong>${data.title}</strong><br>
        Used: ${data.used} ${data.unit} (${percentage}%)<br>
        Remaining: ${remaining} ${data.unit}
    `;
    
    tooltip.classList.add('show');
    updateTooltipPosition(e);
}

function hideResourceTooltip() {
    const tooltip = document.getElementById('resourceTooltip');
    tooltip.classList.remove('show');
}

function updateTooltipPosition(e) {
    const tooltip = document.getElementById('resourceTooltip');
    const rect = tooltip.getBoundingClientRect();
    
    let left = e.pageX - rect.width / 2;
    let top = e.pageY - rect.height - 10;
    
    // Prevent tooltip from going off screen
    if (left < 0) left = 10;
    if (left + rect.width > window.innerWidth) left = window.innerWidth - rect.width - 10;
    if (top < 0) top = e.pageY + 10;
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}