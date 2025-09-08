// Settings Page JavaScript

// Navigation functionality
function showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.settings-section');
    sections.forEach(section => section.classList.remove('active'));
    
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    
    // Show selected section
    const targetSection = document.getElementById(sectionName + '-section');
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Add active class to clicked nav item
    const targetNav = document.querySelector(`[onclick="showSection('${sectionName}')"]`);
    if (targetNav) {
        targetNav.classList.add('active');
    }
}

// Profile picture functionality
function removeProfilePicture() {
    const profileImg = document.getElementById('profileImg');
    if (profileImg) {
        // Reset to default avatar
        profileImg.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDEwMCAxMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjUwIiBmaWxsPSIjNjc3ZWVhIi8+Cjx0ZXh0IHg9IjUwIiB5PSI1NSIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIzMCI+VTwvdGV4dD4KPHN2Zz4=";
    }
    showNotification('Profile picture removed successfully', 'success');
}

// Form reset functionality
function resetForm(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.reset();
        showNotification('Form reset to original values', 'info');
    }
}

// Delete account modal functionality
function showDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

function closeDeleteAccountModal() {
    const modal = document.getElementById('deleteAccountModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        // Reset confirmation input
        const confirmInput = document.getElementById('deleteConfirmation');
        if (confirmInput) {
            confirmInput.value = '';
            updateDeleteButton();
        }
    }
}

function confirmDeleteAccount() {
    const confirmInput = document.getElementById('deleteConfirmation');
    if (confirmInput && confirmInput.value === 'DELETE') {
        // In a real application, this would make an API call
        showNotification('Account deletion initiated. You will receive a confirmation email.', 'warning');
        closeDeleteAccountModal();
        
        // Simulate redirect after a delay
        setTimeout(() => {
            // window.location.href = '/logout';
            alert('In a real application, you would be redirected to the login page.');
        }, 2000);
    }
}

function updateDeleteButton() {
    const confirmInput = document.getElementById('deleteConfirmation');
    const deleteBtn = document.getElementById('confirmDeleteBtn');
    
    if (confirmInput && deleteBtn) {
        deleteBtn.disabled = confirmInput.value !== 'DELETE';
    }
}

// Session management
function revokeSession(sessionId) {
    if (confirm('Are you sure you want to revoke this session?')) {
        // In a real application, this would make an API call
        showNotification(`Session ${sessionId} has been revoked`, 'success');
        
        // Remove the session item from the UI
        const sessionItem = event.target.closest('.session-item');
        if (sessionItem) {
            sessionItem.remove();
        }
    }
}

function revokeAllSessions() {
    if (confirm('Are you sure you want to sign out of all other sessions? You will remain signed in on this device.')) {
        // In a real application, this would make an API call
        showNotification('All other sessions have been revoked', 'success');
        
        // Remove all non-current session items
        const sessionItems = document.querySelectorAll('.session-item');
        sessionItems.forEach(item => {
            if (!item.querySelector('.session-status.current')) {
                item.remove();
            }
        });
    }
}

// Data export functionality
function exportData(dataType) {
    showNotification(`Preparing ${dataType.replace('-', ' ')} export...`, 'info');
    
    // Simulate export process
    setTimeout(() => {
        // In a real application, this would trigger a download
        const filename = `${dataType}-${new Date().toISOString().split('T')[0]}.json`;
        showNotification(`${filename} is ready for download`, 'success');
        
        // Create a mock download
        const mockData = {
            exportType: dataType,
            exportDate: new Date().toISOString(),
            data: `Mock ${dataType} data would be here`
        };
        
        const blob = new Blob([JSON.stringify(mockData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 1001;
        background: ${getNotificationColor(type)};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        max-width: 400px;
        animation: slideInRight 0.3s ease;
    `;
    
    const content = notification.querySelector('.notification-content');
    content.style.cssText = `
        display: flex;
        align-items: center;
        gap: 0.75rem;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        padding: 0;
        margin-left: auto;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#28a745';
        case 'error': return '#dc3545';
        case 'warning': return '#ffc107';
        default: return '#17a2b8';
    }
}

// Form submission handlers
function handleProfileFormSubmit(event) {
    event.preventDefault();
    
    // Get form data
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    
    // Simulate API call
    setTimeout(() => {
        showNotification('Profile updated successfully!', 'success');
    }, 1000);
    
    showNotification('Updating profile...', 'info');
}

function handlePasswordFormSubmit(event) {
    event.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Basic validation
    if (newPassword !== confirmPassword) {
        showNotification('New passwords do not match', 'error');
        return;
    }
    
    if (newPassword.length < 8) {
        showNotification('Password must be at least 8 characters long', 'error');
        return;
    }
    
    // Simulate API call
    showNotification('Updating password...', 'info');
    setTimeout(() => {
        showNotification('Password updated successfully!', 'success');
        event.target.reset();
    }, 1000);
}

// Theme handling
function handleThemeChange(theme) {
    // In a real application, this would apply the theme
    showNotification(`Theme changed to ${theme}`, 'success');
    
    // Store preference
    localStorage.setItem('theme', theme);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Set up form event listeners
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', handleProfileFormSubmit);
    }
    
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', handlePasswordFormSubmit);
    }
    
    // Set up profile picture upload
    const profilePictureInput = document.getElementById('profilePicture');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const profileImg = document.getElementById('profileImg');
                    if (profileImg) {
                        profileImg.src = e.target.result;
                    }
                };
                reader.readAsDataURL(file);
                showNotification('Profile picture updated!', 'success');
            }
        });
    }
    
    // Set up delete confirmation input
    const deleteConfirmInput = document.getElementById('deleteConfirmation');
    if (deleteConfirmInput) {
        deleteConfirmInput.addEventListener('input', updateDeleteButton);
    }
    
    // Set up theme selector
    const themeSelect = document.getElementById('theme');
    if (themeSelect) {
        // Load saved theme
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            themeSelect.value = savedTheme;
        }
        
        themeSelect.addEventListener('change', function() {
            handleThemeChange(this.value);
        });
    }
    
    // Set up toggle switches
    const toggleSwitches = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
    toggleSwitches.forEach(toggle => {
        toggle.addEventListener('change', function() {
            const label = this.closest('.toggle-setting').querySelector('.toggle-label').textContent;
            const status = this.checked ? 'enabled' : 'disabled';
            showNotification(`${label} ${status}`, 'info');
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('deleteAccountModal');
        if (event.target === modal) {
            closeDeleteAccountModal();
        }
    });
    
    // Handle escape key for modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeDeleteAccountModal();
        }
    });
    
    // Load user preferences (mock data)
    loadUserPreferences();
});

// Load user preferences
function loadUserPreferences() {
    // In a real application, this would load from an API
    const mockPreferences = {
        theme: localStorage.getItem('theme') || 'light',
        language: 'en',
        timezone: 'UTC',
        autoBookmark: true,
        readingReminders: true,
        emailNewBooks: true,
        emailReminders: true,
        emailUpdates: false,
        pushReminders: true,
        pushEvents: true,
        profileVisibility: true,
        dataAnalytics: true,
        twoFactorAuth: false
    };
    
    // Apply preferences to form elements
    Object.keys(mockPreferences).forEach(key => {
        const element = document.getElementById(key);
        if (element) {
            if (element.type === 'checkbox') {
                element.checked = mockPreferences[key];
            } else {
                element.value = mockPreferences[key];
            }
        }
    });
}

// Save preferences
function savePreferences() {
    // This would typically be called when forms are submitted
    // or when toggle switches are changed
    showNotification('Preferences saved successfully!', 'success');
}