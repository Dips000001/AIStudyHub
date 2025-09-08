// Library page functionality

// Initialize library when page loads
document.addEventListener('DOMContentLoaded', function() {
    loadLibraryData();
    setupSearchFunctionality();
    setupViewControls();
});

// Initialize library functionality
function initializeLibrary(libraryData) {
    console.log('Library initialized with data:', libraryData);
    
    // Update book displays with data from the server
    updateBookDisplays(libraryData);
    
    // Add event listeners for all interactive elements
    setupBookInteractions();
    setupFilterControls();
    loadFavorites(libraryData.favorites);
    
    // Keep track of reserved books
    window.reservedBooks = libraryData.reservedBooks || [];
}

// Load library data from the server
function loadLibraryData() {
    showNotification('Loading library data...', 'info');
    
    fetch('/api/library_data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load library data');
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 'success') {
                initializeLibrary(data.data);
                showNotification('Library loaded successfully', 'success');
            } else {
                showNotification('Error loading library: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('Error loading library data:', error);
            showNotification('Failed to load library data. Please try again.', 'error');
        });
}

// Favorites management
let favorites = [];

function toggleFavorite(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    const bookAuthor = bookItem.querySelector('.author').textContent;
    const bookIdFromDataset = bookItem.getAttribute('data-book-id');
    const bookId = bookIdFromDataset || generateBookId(bookTitle, bookAuthor);
    
    // Log for debugging
    console.log('Toggling favorite for book:', {
        title: bookTitle,
        id: bookId,
        element: bookItem
    });
    
    // Add loading state
    button.classList.add('loading');
    
    // Create request payload - ensure we're sending the correct parameter
    const payload = {
        book_id: parseInt(bookId) || bookId
    };
    
    // Send request to server
    fetch('/add_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log('Toggle favorite response:', data);
        
        if (data.status === 'success') {
            // Determine if the book was added or removed based on server response
            const wasAddedToFavorites = data.added_to_favorites;
            const wasRemovedFromFavorites = data.removed_from_favorites;
            
            if (wasRemovedFromFavorites) {
                // Book was successfully removed from favorites
                button.classList.remove('active');
                favorites = favorites.filter(id => String(id) !== String(bookId));
                console.log('Updated favorites after removal:', favorites);
                
                // If this book was in the bookshelf as a favorite, remove it
                const myBookshelf = document.getElementById('myBookshelf');
                if (myBookshelf) {
                    const bookshelfItems = myBookshelf.querySelectorAll(`.book-item[data-book-id="${bookId}"][data-category="favorite"]`);
                    bookshelfItems.forEach(item => {
                        item.style.opacity = '0';
                        setTimeout(() => {
                            item.remove();
                        }, 300);
                    });
                }
                
                showNotification(`Removed "${bookTitle}" from favorites`, 'info');
            } else if (wasAddedToFavorites) {
                // Book was successfully added to favorites
                button.classList.add('active');
                favorites.push(bookId);
                console.log('Updated favorites after addition:', favorites);
                
                // Check if it's already in the bookshelf as borrowed
                const myBookshelf = document.getElementById('myBookshelf');
                if (myBookshelf) {
                    const existingBorrowedBook = myBookshelf.querySelector(`.book-item[data-book-id="${bookId}"][data-category="borrowed"]`);
                    
                    // If it's not already in the bookshelf as borrowed, add it as favorite
                    if (!existingBorrowedBook) {
                        // If we have book details from the response, use that to create the element
                        if (data.book) {
                            const bookElement = createBookElement(data.book, 'favorite');
                            myBookshelf.appendChild(bookElement);
                            
                            // Add animation
                            bookElement.style.opacity = '0';
                            bookElement.style.transform = 'translateY(20px)';
                            setTimeout(() => {
                                bookElement.style.transition = 'all 0.5s ease';
                                bookElement.style.opacity = '1';
                                bookElement.style.transform = 'translateY(0)';
                            }, 100);
                        } else {
                            // Otherwise move the current item to the bookshelf
                            moveToMyBookshelf(bookItem, 'favorite');
                        }
                    }
                }
                
                showNotification(`Added "${bookTitle}" to favorites`, 'success');
            }
            
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
            // Reset button state
            if (favorites.includes(bookId)) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        }
    })
    .catch(error => {
        console.error('Error toggling favorite:', error);
        showNotification('Failed to update favorites. Please try again.', 'error');
        // Reset button state
        if (favorites.includes(bookId)) {
            button.classList.add('active');
        } else {
            button.classList.remove('active');
        }
    })
    .finally(() => {
        // Remove loading state
        button.classList.remove('loading');
    });
}

function generateBookId(title, author) {
    return btoa(title + author).replace(/[^a-zA-Z0-9]/g, '').substring(0, 10);
}

function loadFavorites(favoriteIds) {
    favorites = favoriteIds || [];
    console.log('Loading favorites:', favorites);
    
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(item => {
        const bookIdFromDataset = item.getAttribute('data-book-id');
        let bookId;
        
        if (bookIdFromDataset) {
            // Try to parse as integer if possible
            bookId = parseInt(bookIdFromDataset) || bookIdFromDataset;
        } else {
            const title = item.querySelector('h4').textContent;
            const author = item.querySelector('.author').textContent;
            bookId = generateBookId(title, author);
            // Set the ID on the element for future reference
            item.setAttribute('data-book-id', bookId);
        }
        
        const favoriteBtn = item.querySelector('.action-btn.favorite');
        if (favoriteBtn) {
            // Check if the book ID is in favorites list, handling both string and numeric IDs
            const isFavorite = favorites.some(id => {
                // Convert both to strings for comparison
                const favIdStr = String(id);
                const bookIdStr = String(bookId);
                return favIdStr === bookIdStr;
            });
            
            if (isFavorite) {
                favoriteBtn.classList.add('active');
                console.log(`Marked book ${bookId} as favorite`);
            }
        }
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
    const bookIdFromDataset = bookItem.getAttribute('data-book-id');
    
    if (!bookIdFromDataset) {
        showNotification('Error: Book ID not found', 'error');
        return;
    }
    
    const bookId = parseInt(bookIdFromDataset) || bookIdFromDataset;
    
    // Add loading state
    button.classList.add('loading');
    
    // Create request payload
    const payload = {
        bookId: bookId
    };
    
    // Send request to server
    fetch('/borrow_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            // Update book status
            const statusElement = bookItem.querySelector('.book-status');
            statusElement.textContent = 'Borrowed';
            statusElement.className = 'book-status borrowed';
            
            // Update button
            button.innerHTML = '<i class="fas fa-check"></i> Borrowed';
            button.classList.remove('borrow', 'loading');
            button.classList.add('borrowed');
            button.disabled = true;
            
            // Format the due date message if available
            let successMessage = `Successfully borrowed "${bookTitle}"`;
            if (data.dueDate) {
                successMessage += ` (Due: ${data.dueDate})`;
                
                // Add due date to the book item
                if (!bookItem.querySelector('.due-date')) {
                    const dueElement = document.createElement('div');
                    dueElement.className = 'due-date';
                    dueElement.innerHTML = `<i class="fas fa-calendar-alt"></i> Due: ${data.dueDate}`;
                    bookItem.querySelector('.book-info').appendChild(dueElement);
                }
            }
            
            showNotification(successMessage, 'success');
            
            // Move to "My Bookshelf" section
            moveToMyBookshelf(bookItem, 'borrowed');
            
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
            button.classList.remove('loading');
        }
    })
    .catch(error => {
        console.error('Error borrowing book:', error);
        showNotification('Failed to borrow book. Please try again.', 'error');
        button.classList.remove('loading');
    });
}

function reserveBook(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    const bookIdFromDataset = bookItem.getAttribute('data-book-id');
    
    if (!bookIdFromDataset) {
        showNotification('Error: Book ID not found', 'error');
        return;
    }
    
    const bookId = parseInt(bookIdFromDataset) || bookIdFromDataset;
    
    // Add loading state
    button.classList.add('loading');
    
    // Create request payload
    const payload = {
        bookId: bookId
    };
    
    // Send request to server
    fetch('/reserve_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            // Update book status
            const statusElement = bookItem.querySelector('.book-status');
            statusElement.textContent = 'Reserved';
            statusElement.className = 'book-status reserved';
            
            // Update button
            button.innerHTML = '<i class="fas fa-clock"></i> Reserved';
            button.classList.remove('reserve', 'loading');
            button.classList.add('reserved');
            button.disabled = true;
            
            showNotification(`Successfully reserved "${bookTitle}" - You'll be notified when available`, 'success');
            
            // Move to "My Bookshelf" section with reserved status
            moveToMyBookshelf(bookItem, 'reserved');
            
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
            button.classList.remove('loading');
        }
    })
    .catch(error => {
        console.error('Error reserving book:', error);
        showNotification('Failed to reserve book. Please try again.', 'error');
        button.classList.remove('loading');
    });
}

// Function to unreserve a book
function unreserveBook(button) {
    const bookItem = button.closest('.book-item');
    const bookTitle = bookItem.querySelector('h4').textContent;
    const bookIdFromDataset = bookItem.getAttribute('data-book-id');
    
    if (!bookIdFromDataset) {
        showNotification('Error: Book ID not found', 'error');
        return;
    }
    
    const bookId = parseInt(bookIdFromDataset) || bookIdFromDataset;
    
    // Add loading state
    button.classList.add('loading');
    
    // Create request payload
    const payload = {
        bookId: bookId
    };
    
    // Send request to server
    fetch('/unreserve_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            showNotification(`Successfully cancelled reservation for "${bookTitle}"`, 'success');
            
            // Remove the book item from My Bookshelf
            bookItem.classList.add('fade-out');
            setTimeout(() => {
                bookItem.remove();
            }, 500);
            
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
            button.classList.remove('loading');
        }
    })
    .catch(error => {
        console.error('Error cancelling reservation:', error);
        showNotification('Failed to cancel reservation. Please try again.', 'error');
        button.classList.remove('loading');
    });
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

function moveToMyBookshelf(bookItem, category = 'borrowed') {
    const myBookshelf = document.getElementById('myBookshelf');
    const clonedItem = bookItem.cloneNode(true);
    
    // Update the cloned item for "My Bookshelf"
    clonedItem.dataset.category = category;
    
    // Update the status element
    const statusElement = clonedItem.querySelector('.book-status');
    if (statusElement) {
        if (category === 'borrowed') {
            statusElement.textContent = 'Borrowed';
        } else if (category === 'favorite') {
            statusElement.textContent = 'Favorite';
        } else if (category === 'reserved') {
            statusElement.textContent = 'Reserved';
        }
        statusElement.className = `book-status ${category}`;
    }
    
    // Update action buttons as needed
    const borrowBtn = clonedItem.querySelector('.action-btn.borrow');
    if (borrowBtn && category === 'borrowed') {
        borrowBtn.innerHTML = '<i class="fas fa-check"></i> Borrowed';
        borrowBtn.classList.remove('borrow');
        borrowBtn.classList.add('borrowed');
        borrowBtn.disabled = true;
    }
    
    // Update action buttons for reserved books
    const reserveBtn = clonedItem.querySelector('.action-btn.reserve');
    if (reserveBtn && category === 'reserved') {
        reserveBtn.innerHTML = '<i class="fas fa-times"></i> Cancel Reservation';
        reserveBtn.classList.remove('reserve');
        reserveBtn.classList.add('unreserve');
        reserveBtn.disabled = false;
        
        // Update the onclick handler
        reserveBtn.onclick = function() { 
            unreserveBook(this); 
        };
    }
    
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

// Update book displays from API data
function updateBookDisplays(libraryData) {
    // Update My Bookshelf section (showing both borrowed and favorite books)
    const myBookshelf = document.getElementById('myBookshelf');
    if (myBookshelf) {
        // Clear existing placeholder content
        myBookshelf.innerHTML = '';
        
        const allBooks = libraryData.libraryBooks.concat(libraryData.ebooks, libraryData.internalMaterials);
        const bookMap = {};
        allBooks.forEach(book => {
            bookMap[book.id] = book;
        });
        
        // First add borrowed books
        if (libraryData.borrowedBooks && libraryData.borrowedBooks.length > 0) {
            libraryData.borrowedBooks.forEach(bookId => {
                const book = bookMap[bookId];
                if (book) {
                    const bookElement = createBookElement(book, 'borrowed');
                    myBookshelf.appendChild(bookElement);
                }
            });
        }
        
        // Add reserved books
        if (libraryData.reservedBooks && libraryData.reservedBooks.length > 0) {
            libraryData.reservedBooks.forEach(bookId => {
                const book = bookMap[bookId];
                if (book) {
                    const bookElement = createBookElement(book, 'reserved');
                    myBookshelf.appendChild(bookElement);
                }
            });
        }
        
        // Then add favorite books that weren't already added as borrowed or reserved
        if (libraryData.favorites && libraryData.favorites.length > 0) {
            const borrowedBookIds = libraryData.borrowedBooks || [];
            const reservedBookIds = libraryData.reservedBooks || [];
            const favoritesOnly = libraryData.favorites.filter(id => 
                !borrowedBookIds.includes(id) && !reservedBookIds.includes(id)
            );
            
            favoritesOnly.forEach(bookId => {
                const book = bookMap[bookId];
                if (book) {
                    const bookElement = createBookElement(book, 'favorite');
                    myBookshelf.appendChild(bookElement);
                }
            });
        }
        
        // If no books, show a message
        if ((libraryData.borrowedBooks?.length || 0) === 0 && 
            (libraryData.favorites?.length || 0) === 0 && 
            (libraryData.reservedBooks?.length || 0) === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-shelf-message';
            emptyMessage.textContent = 'Your bookshelf is empty. Borrow, reserve or favorite some books!';
            myBookshelf.appendChild(emptyMessage);
        }
    }
    
    // Update School Library section
    if (libraryData.libraryBooks && libraryData.libraryBooks.length > 0) {
        updateBookSection('schoolLibrary', libraryData.libraryBooks);
    }
    
    // Update E-books section
    if (libraryData.ebooks && libraryData.ebooks.length > 0) {
        updateBookSection('ebooks', libraryData.ebooks);
    }
    
    // Update Internal Materials section
    if (libraryData.internalMaterials && libraryData.internalMaterials.length > 0) {
        updateBookSection('internalMaterials', libraryData.internalMaterials);
    }
}

function updateBookSection(sectionId, books) {
    const container = document.getElementById(sectionId);
    if (!container) return;
    
    // Clear existing placeholder content
    container.innerHTML = '';
    
    // Add books to the section
    books.forEach(book => {
        let category;
        
        // Check if this book is already reserved or borrowed by the user
        const isReservedByUser = book.isReservedByUser;
        const isBorrowedByUser = book.isBorrowedByUser;
        
        if (sectionId === 'schoolLibrary') {
            // For School Library, if the book is borrowed or reserved by this user, show it differently
            if (isBorrowedByUser) {
                category = 'user-borrowed';
            } else if (isReservedByUser) {
                category = 'user-reserved';
            } else {
                category = book.status === 'unavailable' || (book.availableCopies === 0) ? 'unavailable' : 'available';
            }
        } else if (sectionId === 'ebooks') {
            category = 'ebook';
        } else if (sectionId === 'internalMaterials') {
            category = book.course ? 'past-paper' : 'catalogue';
        }
        
        const bookElement = createBookElement(book, category);
        container.appendChild(bookElement);
    });
}

function createBookElement(book, category) {
    const bookItem = document.createElement('div');
    bookItem.className = 'book-item';
    bookItem.dataset.category = category;
    bookItem.setAttribute('data-book-id', book.id);
    
    // Create cover based on type
    let coverHTML;
    if (category === 'ebook') {
        coverHTML = `
            <div class="book-cover digital">
                <img src="${book.img || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjMDBCQ0Q0Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+JHt0aXRsZX08L3RleHQ+CjwvdGV4dD4KPC9zdmc+'}" alt="${book.title}" onerror="handleImageError(this, '${book.title.replace(/'/g, "\\'")}')">
                <div class="digital-badge">
                    <i class="fas fa-download"></i>
                </div>
            </div>`;
    } else if (category === 'past-paper' || category === 'catalogue' || category === 'brochure') {
        coverHTML = `
            <div class="book-cover document">
                <div class="document-icon">
                    <i class="fas fa-file-pdf"></i>
                </div>
                <div class="document-title">${book.title}</div>
                <div class="document-year">${book.year || book.semester || ''}</div>
            </div>`;
    } else {
        coverHTML = `
            <div class="book-cover">
                <img src="${book.img || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNDI4NUY0Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI0MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMCI+JHt0aXRsZX08L3RleHQ+CjwvdGV4dD4KPC9zdmc+'}" alt="${book.title}" onerror="handleImageError(this, '${book.title.replace(/'/g, "\\'")}')">
            </div>`;
    }
    
    // Create info section with appropriate actions
    let actions;
    if (category === 'borrowed' || category === 'favorite' || category === 'reserved') {
        // Determine if this is a library book (physical) or an ebook/internal material
        const isPhysicalBook = book.bookType === 'physical' || (!book.format && !book.documentType && !book.fileSize);
        const isReserved = category === 'reserved';
        
        // Create buttons based on book type and status
        let buttons = '';
        
        // Always show the favorite button
        buttons += `
            <button class="action-btn favorite" onclick="toggleFavorite(this)">
                <i class="fas fa-heart"></i>
            </button>
        `;
        
        // Only show read button for ebooks and internal materials
        if (!isPhysicalBook) {
            buttons += `
                <button class="action-btn read" onclick="readBook('${book.id}')">
                    <i class="fas fa-book-open"></i>
                </button>
            `;
        }
        
        // Add unreserve button for reserved books
        if (isReserved) {
            buttons += `
                <button class="action-btn unreserve" onclick="unreserveBook(this)">
                    <i class="fas fa-times"></i> Cancel
                </button>
            `;
        }
        
        actions = `<div class="book-actions">${buttons}</div>`;
    } else if (category === 'available' || category === 'unavailable' || category === 'user-reserved' || category === 'user-borrowed') {
        let actionButton;
        
        // Special case for books already borrowed by this user in School Library
        if (category === 'user-borrowed') {
            actionButton = `<button class="action-btn borrowed" disabled>
                <i class="fas fa-check"></i> Borrowed
            </button>`;
        }
        // Special case for books already reserved by this user in School Library
        else if (category === 'user-reserved') {
            actionButton = `<button class="action-btn unreserve" onclick="unreserveBook(this)">
                <i class="fas fa-times"></i> Cancel Reservation
            </button>`;
        } else {
            // Regular case for available/unavailable books
            const isAvailable = book.status !== 'unavailable' && (book.availableCopies > 0);
            actionButton = isAvailable 
                ? `<button class="action-btn borrow" onclick="borrowBook(this)">
                     <i class="fas fa-plus"></i> Borrow
                   </button>`
                : `<button class="action-btn reserve" onclick="reserveBook(this)">
                     <i class="fas fa-clock"></i> Reserve
                   </button>`;
        }
        
        actions = `
            <div class="book-actions">
                <button class="action-btn favorite" onclick="toggleFavorite(this)">
                    <i class="fas fa-heart"></i>
                </button>
                ${actionButton}
            </div>`;
    } else if (category === 'ebook') {
        actions = `
            <div class="book-actions">
                <button class="action-btn favorite" onclick="toggleFavorite(this)">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn download" onclick="downloadEbook('${book.id}')">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>`;
    } else if (category === 'past-paper' || category === 'catalogue' || category === 'brochure') {
        actions = `
            <div class="book-actions">
                <button class="action-btn favorite" onclick="toggleFavorite(this)">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="action-btn view" onclick="viewDocument('${book.id}')">
                    <i class="fas fa-eye"></i> View
                </button>
            </div>`;
    }
    
    // Add due date info if available for borrowed books
    let dueDateHTML = '';
    if (category === 'borrowed' && book.dueDate) {
        dueDateHTML = `<div class="due-date"><i class="fas fa-calendar-alt"></i> Due: ${book.dueDate}</div>`;
    }
    
    bookItem.innerHTML = `
        ${coverHTML}
        <div class="book-info">
            <h4>${book.title}</h4>
            <p class="author">${book.author || 'Unknown'}</p>
            <div class="book-status ${category}">${getCategoryDisplay(category)}</div>
            ${dueDateHTML}
            ${actions}
        </div>
    `;
    
    // Make sure we only set up the interactions once
    if (!bookItem.hasAttribute('data-interactions-setup')) {
        setupBookItemInteractions(bookItem);
    }
    return bookItem;
}

function getCategoryDisplay(category) {
    switch (category) {
        case 'borrowed': return 'Borrowed';
        case 'favorite': return 'Favorite';
        case 'available': return 'Available';
        case 'unavailable': return 'Checked Out';
        case 'reserved': return 'Reserved';
        case 'user-reserved': return 'Reserved by You';
        case 'user-borrowed': return 'Borrowed by You';
        case 'ebook': return 'E-book';
        case 'past-paper': return 'Past Paper';
        case 'catalogue': return 'Catalogue';
        case 'brochure': return 'App Guide';
        default: return category;
    }
}

// Setup interactions for individual book items
function setupBookInteractions() {
    const bookItems = document.querySelectorAll('.book-item');
    bookItems.forEach(item => {
        setupBookItemInteractions(item);
    });
}

function setupBookItemInteractions(bookItem) {
    // Remove any existing event listeners first by cloning and replacing the element
    const cloned = bookItem.cloneNode(true);
    
    // Add a flag to track if this book item has already been set up
    if (bookItem.hasAttribute('data-interactions-setup')) {
        return; // Skip if already set up
    }
    bookItem.setAttribute('data-interactions-setup', 'true');
    
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
            // Prevent event bubbling to avoid multiple triggers
            e.stopPropagation();
            showBookDetails(this);
        }
    }, { once: true }); // 'once: true' ensures the event only fires once
}

function showBookDetails(bookItem) {
    // Check if there's already a modal open and close it if so
    const existingModal = document.querySelector('.book-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get basic book details from DOM
    const title = bookItem.querySelector('h4').textContent;
    const author = bookItem.querySelector('.author').textContent;
    const status = bookItem.querySelector('.book-status').textContent;
    const bookId = bookItem.getAttribute('data-book-id');
    
    if (!bookId) {
        console.error('No book ID found');
        // Create a simple modal with available information
        const modal = createBookModal({
            title,
            author,
            status,
            description: 'No detailed information available.'
        });
        document.body.appendChild(modal);
        
        // Show modal with animation
        setTimeout(() => {
            modal.classList.add('show');
        }, 10);
        return;
    }
    
    // Show loading modal
    const loadingModal = createLoadingModal(title);
    document.body.appendChild(loadingModal);
    setTimeout(() => {
        loadingModal.classList.add('show');
    }, 10);
    
    // Fetch detailed book information from the server
    fetch(`/api/book/${bookId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch book details');
            }
            return response.json();
        })
        .then(data => {
            // Remove loading modal
            loadingModal.remove();
            
            if (data.status === 'success' && data.book) {
                // Create modal with full details
                const modal = createBookModal(data.book);
                document.body.appendChild(modal);
                
                // Show modal with animation
                setTimeout(() => {
                    modal.classList.add('show');
                }, 10);
                
                console.log(`Showing details for book: ${data.book.title}`);
            } else {
                throw new Error('Book details not found');
            }
        })
        .catch(error => {
            // Remove loading modal
            loadingModal.remove();
            
            console.error('Error fetching book details:', error);
            showNotification('Failed to load book details. Please try again.', 'error');
            
            // Create a simple modal with available information as fallback
            const modal = createBookModal({
                title,
                author,
                status,
                description: 'Could not retrieve detailed information at this time.'
            });
            document.body.appendChild(modal);
            
            // Show modal with animation
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
}

function createLoadingModal(title) {
    const modal = document.createElement('div');
    modal.className = 'book-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body text-center">
                <div class="loading-spinner"></div>
                <p>Loading book details...</p>
            </div>
        </div>
    `;
    
    return modal;
}

function createBookModal(book) {
    const modal = document.createElement('div');
    modal.className = 'book-modal';
    
    // Handle both passing a book object or individual properties
    const title = book.title || book;
    const author = book.author || arguments[1] || 'Unknown';
    const status = book.status || arguments[2] || '';
    const description = book.description || arguments[3] || 'No description available.';
    
    // Create additional book details HTML if available
    let additionalDetails = '';
    if (typeof book === 'object') {
        if (book.isbn) additionalDetails += `<p><strong>ISBN:</strong> ${book.isbn}</p>`;
        if (book.publisher) additionalDetails += `<p><strong>Publisher:</strong> ${book.publisher}</p>`;
        if (book.year) additionalDetails += `<p><strong>Year:</strong> ${book.year}</p>`;
        if (book.edition) additionalDetails += `<p><strong>Edition:</strong> ${book.edition}</p>`;
        if (book.level) additionalDetails += `<p><strong>Level:</strong> ${book.level}</p>`;
        if (book.subject) additionalDetails += `<p><strong>Subject:</strong> ${book.subject}</p>`;
        if (book.location) additionalDetails += `<p><strong>Location:</strong> ${book.location}</p>`;
    }
    
    // Create book cover HTML if image is available
    let coverHTML = '';
    if (typeof book === 'object' && book.img) {
        coverHTML = `
            <div class="modal-cover">
                <img src="${book.img}" alt="${title}" 
                    onerror="handleImageError(this, '${title.replace(/'/g, "\\'")}')">
            </div>
        `;
    }
    
    // Create due date display if available
    let dueDateHTML = '';
    if (typeof book === 'object' && book.dueDate) {
        dueDateHTML = `
            <div class="modal-due-date">
                <i class="fas fa-calendar-alt"></i> Due Date: ${book.dueDate}
            </div>
        `;
    }
    
    // Create action buttons based on book status and if the user has already borrowed it
    let actionButtons = '';
    if (typeof book === 'object') {
        // Create a hidden book item that the borrow/reserve functions can work with
        const bookId = book.id;
        
        // Check if book is already borrowed by this user
        if (book.isBorrowedByUser) {
            actionButtons = `
                <button class="btn btn-success" disabled>
                    <i class="fas fa-check"></i> Borrowed
                </button>
                ${dueDateHTML}
            `;
        } else if (book.status === 'available' && (book.availableCopies > 0)) {
            actionButtons = `
                <button class="btn btn-primary" onclick="borrowFromModal(${bookId})">Borrow Now</button>
            `;
        } else if (book.status === 'unavailable' || (book.availableCopies === 0)) {
            actionButtons = `
                <button class="btn btn-warning" onclick="reserveFromModal(${bookId})">Reserve</button>
            `;
        } else if (book.link) {
            actionButtons = `
                <button class="btn btn-primary" onclick="window.open('${book.link}', '_blank')">Read Now</button>
            `;
        } else {
            actionButtons = `<button class="btn btn-primary">Read Now</button>`;
        }
    } else {
        actionButtons = `<button class="btn btn-primary">Read Now</button>`;
    }
    
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="close-modal" onclick="closeModal(this)">&times;</button>
            </div>
            <div class="modal-body">
                <div class="modal-details">
                    ${coverHTML}
                    <div class="modal-info">
                        <p><strong>Author:</strong> ${author}</p>
                        <p><strong>Status:</strong> ${status}</p>
                        ${additionalDetails}
                        <div class="description">
                            <h4>Description:</h4>
                            <p>${description}</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                ${actionButtons}
                <button class="btn btn-secondary" onclick="closeModal(this)">Close</button>
            </div>
        </div>
    `;
    
    return modal;
}

function closeModal(button) {
    const modal = button.closest('.book-modal');
    if (modal) {
        // Log for debugging
        console.log('Closing modal');
        
        // Fade out animation
        modal.classList.remove('show');
        
        // Remove from DOM after animation completes
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
}

// Helper functions to borrow or reserve from the modal
function borrowFromModal(bookId) {
    // Close the modal first
    const modal = document.querySelector('.book-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Create request payload
    const payload = {
        bookId: bookId
    };
    
    // Show loading notification
    showNotification('Processing borrow request...', 'info');
    
    // Send request to server
    fetch('/borrow_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            // Format success message with due date if available
            let successMessage = `Successfully borrowed "${data.book.title}"`;
            if (data.dueDate) {
                successMessage += ` (Due: ${data.dueDate})`;
            }
            
            showNotification(successMessage, 'success');
            
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error borrowing book:', error);
        showNotification('Failed to borrow book. Please try again.', 'error');
    });
}

function reserveFromModal(bookId) {
    // Close the modal first
    const modal = document.querySelector('.book-modal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
    
    // Create request payload
    const payload = {
        bookId: bookId
    };
    
    // Show loading notification
    showNotification('Processing reservation request...', 'info');
    
    // Send request to server
    fetch('/reserve_book', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === 'success') {
            showNotification(`Successfully reserved "${data.book.title}" - You'll be notified when available`, 'success');
            // Refresh library data to keep everything in sync
            loadLibraryData();
        } else {
            showNotification('Error: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('Error reserving book:', error);
        showNotification('Failed to reserve book. Please try again.', 'error');
    });
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
    max-width: 700px;
    width: 90%;
    max-height: 85vh;
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

.modal-details {
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
}

.modal-cover {
    flex: 0 0 150px;
}

.modal-cover img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.modal-info {
    flex: 1;
    min-width: 250px;
}

.description {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #eee;
}

.description h4 {
    margin-bottom: 0.5rem;
}

.text-center {
    text-align: center;
}

.loading-spinner {
    display: inline-block;
    width: 40px;
    height: 40px;
    border: 4px solid rgba(0, 0, 0, 0.1);
    border-left-color: #4285f4;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
}

@keyframes spin {
    to {transform: rotate(360deg);}
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

// Function to handle image loading errors
function handleImageError(img, title) {
    img.onerror = null; // Prevent infinite loop
    
    // Sanitize the title for SVG - replace special characters with safe ones
    let safeTitle = title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    
    // Truncate if too long
    safeTitle = safeTitle.substring(0, 10) + (safeTitle.length > 10 ? '...' : '');
    
    try {
        // Create a fallback SVG with the book title
        const svgContent = `<svg width="100" height="120" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="120" fill="#4285F4"/>
            <text x="50" y="60" fill="white" text-anchor="middle" font-family="Arial" font-size="12">${safeTitle}</text>
        </svg>`;
        
        // Use Base64 encoding for the SVG
        const fallbackSvg = `data:image/svg+xml;base64,${btoa(svgContent)}`;
        img.src = fallbackSvg;
    } catch (e) {
        // If btoa fails (due to Unicode characters), use a simpler fallback
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjNDI4NUY0Ii8+Cjx0ZXh0IHg9IjUwIiB5PSI2MCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiI+Qm9vazwvdGV4dD4KPC9zdmc+';
        console.error('Error creating fallback image:', e);
    }
}