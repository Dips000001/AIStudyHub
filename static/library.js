// Library page functionality

// Initialize library when page loads
document.addEventListener('DOMContentLoaded', function() {
    initializeLibrary();
    setupSearchFunctionality();
    setupViewControls();
    loadFavorites();
});

// Initialize library functionality
function initializeLibrary() {
    console.log('Library initialized');
    
    // Add event listeners for all interactive elements
    setupBookInteractions();
    setupFilterControls();
}

// Favorites management
let favorites = JSON.parse(localStorage.getItem('libraryFavorites')) || [];

function toggleFavorite(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    const bookAuthor = bookItem.querySelector('.author').textContent;
    const bookId = generateBookId(bookTitle, bookAuthor);
    
    // Add loading state
    button.classList.add('loading');
    
    setTimeout(() => {
        if (button.classList.contains('active')) {
            // Remove from favorites
            button.classList.remove('active');
            favorites = favorites.filter(fav => fav.id !== bookId);
            showNotification(`Removed "${bookTitle}" from favorites`, 'info');
        } else {
            // Add to favorites
            button.classList.add('active');
            const bookData = {
                id: bookId,
                title: bookTitle,
                author: bookAuthor,
                cover: bookItem.querySelector('.book-cover img')?.src || '',
                status: bookItem.querySelector('.book-status').textContent,
                category: bookItem.dataset.category
            };
            favorites.push(bookData);
            showNotification(`Added "${bookTitle}" to favorites`, 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('libraryFavorites', JSON.stringify(favorites));
        
        // Remove loading state
        button.classList.remove('loading');
    }, 500);
}

function generateBookId(title, author) {
    return btoa(title + author).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
}

function loadFavorites() {
    favorites.forEach(favorite => {
        const bookItems = document.querySelectorAll('.book-item');
        bookItems.forEach(item => {
            const title = item.querySelector('h4').textContent;
            const author = item.querySelector('.author').textContent;
            const bookId = generateBookId(title, author);
            
            if (bookId === favorite.id) {
                const favoriteBtn = item.querySelector('.action-btn.favorite');
                if (favoriteBtn) {
                    favoriteBtn.classList.add('active');
                }
            }
        });
    });
}

// Book actions
function readBook(bookId) {
    showNotification('Opening book reader...', 'info');
    // In a real application, this would navigate to the reading interface
    setTimeout(() => {
        window.open(`/reader/${bookId}`, '_blank');
    }, 1000);
}

function borrowBook(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    
    button.classList.add('loading');
    
    setTimeout(() => {
        // Update book status
        const statusElement = bookItem.querySelector('.book-status');
        statusElement.textContent = 'Borrowed';
        statusElement.className = 'book-status borrowed';
        
        // Update button
        button.innerHTML = '<i class="fas fa-check"></i> Borrowed';
        button.classList.remove('borrow', 'loading');
        button.classList.add('borrowed');
        button.disabled = true;
        
        showNotification(`Successfully borrowed "${bookTitle}"`, 'success');
        
        // Move to "My Bookshelf" section
        moveToMyBookshelf(bookItem);
    }, 1500);
}

function reserveBook(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    
    button.classList.add('loading');
    
    setTimeout(() => {
        // Update book status
        const statusElement = bookItem.querySelector('.book-status');
        statusElement.textContent = 'Reserved';
        statusElement.className = 'book-status reserved';
        
        // Update button
        button.innerHTML = '<i class="fas fa-clock"></i> Reserved';
        button.classList.remove('reserve', 'loading');
        button.classList.add('reserved');
        button.disabled = true;
        
        showNotification(`Reserved "${bookTitle}" - You'll be notified when available`, 'success');
    }, 1500);
}

function downloadEbook(bookId) {
    showNotification('Preparing download...', 'info');
    
    // Simulate download process
    setTimeout(() => {
        // Create a temporary download link
        const link = document.createElement('a');
        link.href = `#`; // In real app, this would be the actual file URL
        link.download = `${bookId}.pdf`;
        
        showNotification('Download started!', 'success');
        
        // In a real application, you would handle the actual file download
        console.log(`Downloading: ${bookId}`);
    }, 1000);
}

function viewDocument(documentPath) {
    showNotification('Opening document...', 'info');
    
    setTimeout(() => {
        // In a real application, this would open the document viewer
        window.open(`/documents/${documentPath}`, '_blank');
        showNotification('Document opened in new tab', 'success');
    }, 800);
}

function moveToMyBookshelf(bookItem) {
    const myBookshelf = document.getElementById('myBookshelf');
    const clonedItem = bookItem.cloneNode(true);
    
    // Update the cloned item for "My Bookshelf"
    clonedItem.dataset.category = 'borrowed';
    
    // Re-attach event listeners to the cloned item
    setupBookItemInteractions(clonedItem);
    
    // Add to my bookshelf with animation
    clonedItem.style.opacity = '0';
    clonedItem.style.transform = 'translateY(20px)';
    myBookshelf.appendChild(clonedItem);
    
    setTimeout(() => {
        clonedItem.style.transition = 'all 0.5s ease';
        clonedItem.style.opacity = '1';
        clonedItem.style.transform = 'translateY(0)';
    }, 100);
}

// Search functionality
function setupSearchFunctionality() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(this.value);
        }, 300);
    });
}

function performSearch(query) {
    const bookItems = document.querySelectorAll('.book-item');
    const lowercaseQuery = query.toLowerCase();
    
    bookItems.forEach(item => {
        const title = item.querySelector('h4').textContent.toLowerCase();
        const author = item.querySelector('.author').textContent.toLowerCase();
        const status = item.querySelector('.book-status').textContent.toLowerCase();
        
        const matches = title.includes(lowercaseQuery) || 
                       author.includes(lowercaseQuery) || 
                       status.includes(lowercaseQuery);
        
        if (matches || query === '') {
            item.style.display = 'block';
            item.style.opacity = '1';
        } else {
            item.style.opacity = '0.3';
            setTimeout(() => {
                if (!item.querySelector('h4').textContent.toLowerCase().includes(lowercaseQuery) &&
                    !item.querySelector('.author').textContent.toLowerCase().includes(lowercaseQuery)) {
                    item.style.display = 'none';
                }
            }, 300);
        }
    });
    
    // Show search results count
    const visibleItems = Array.from(bookItems).filter(item => 
        item.style.display !== 'none' && item.style.opacity !== '0.3'
    );
    
    if (query) {
        showNotification(`Found ${visibleItems.length} results for "${query}"`, 'info');
    }
}

// View controls (grid/list view)
function setupViewControls() {
    const viewButtons = document.querySelectorAll('.view-btn');
    
    viewButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            viewButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Apply view mode
            const viewMode = this.dataset.view;
            applyViewMode(viewMode);
        });
    });
}

function applyViewMode(mode) {
    const booksContainers = document.querySelectorAll('.books-container');
    
    booksContainers.forEach(container => {
        if (mode === 'list') {
            container.classList.add('list-view');
            container.classList.remove('grid-view');
        } else {
            container.classList.add('grid-view');
            container.classList.remove('list-view');
        }
    });
}

// Filter controls
function setupFilterControls() {
    // This would be expanded for actual filter functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            applyFilter(filterType);
        });
    });
}

function applyFilter(filterType) {
    const bookItems = document.querySelectorAll('.book-item');
    
    bookItems.forEach(item => {
        if (filterType === 'all' || item.dataset.category === filterType) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Setup interactions for individual book items
function setupBookInteractions() {
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(item => {
        setupBookItemInteractions(item);
    });
}

function setupBookItemInteractions(bookItem) {
    // Add hover effects
    bookItem.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px)';
    });
    
    bookItem.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
    
    // Add click to view details (optional)
    bookItem.addEventListener('click', function(e) {
        // Don't trigger if clicking on action buttons
        if (!e.target.closest('.action-btn')) {
            showBookDetails(this);
        }
    });
}

function showBookDetails(bookItem) {
    const title = bookItem.querySelector('h4').textContent;
    const author = bookItem.querySelector('.author').textContent;
    const status = bookItem.querySelector('.book-status').textContent;
    
    // Create modal or detailed view
    const modal = createBookModal(title, author, status);
    document.body.appendChild(modal);
    
    // Show modal with animation
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
}

function createBookModal(title, author, status) {
    const modal = document.createElement('div');
    modal.className = 'book-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <p><strong>Author:</strong> ${author}</p>
                <p><strong>Status:</strong> ${status}</p>
                <p><strong>Description:</strong> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
            </div>
            <div class="modal-footer">
                <button class="btn btn-primary">Read Now</button>
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;
    
    return modal;
}

function closeModal(button) {
    const modal = button.closest('.book-modal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.remove();
    }, 300);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Show with animation
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    switch(type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    // Ctrl/Cmd + F to focus search
    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        document.getElementById('searchInput').focus();
    }
    
    // Escape to clear search
    if (e.key === 'Escape') {
        const searchInput = document.getElementById('searchInput');
        if (searchInput.value) {
            searchInput.value = '';
            performSearch('');
        }
    }
});

// Add CSS for notifications and modals
const additionalStyles = `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.15);
    padding: 1rem;
    z-index: 10000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    min-width: 300px;
}

.notification.show {
    transform: translateX(0);
}

.notification.success {
    border-left: 4px solid #28a745;
}

.notification.error {
    border-left: 4px solid #dc3545;
}

.notification.warning {
    border-left: 4px solid #ffc107;
}

.notification.info {
    border-left: 4px solid #17a2b8;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.book-modal {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.book-modal.show {
    opacity: 1;
}

.modal-content {
    background: white;
    border-radius: 12px;
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #dee2e6;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid #dee2e6;
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.close-modal {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
    color: #666;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.9rem;
}

.btn-primary {
    background-color: #4285f4;
    color: white;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.books-container.list-view {
    flex-direction: column;
}

.books-container.list-view .book-item {
    min-width: 100%;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.books-container.list-view .book-cover {
    margin-bottom: 0;
    flex-shrink: 0;
}

.books-container.list-view .book-info {
    flex: 1;
}

.books-container.list-view .book-actions {
    flex-shrink: 0;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', additionalStyles);