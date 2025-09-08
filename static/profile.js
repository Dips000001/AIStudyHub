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