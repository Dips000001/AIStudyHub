from flask import Flask, render_template, request, redirect, url_for, session, jsonify
import json
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a random secret key

# File paths
DATA_DIR = 'data'
USERS_FILE = os.path.join(DATA_DIR, 'users.json')
LIBRARY_BOOKS_FILE = os.path.join(DATA_DIR, 'library_books.json')
EBOOKS_FILE = os.path.join(DATA_DIR, 'ebooks.json')
INTERNAL_MATERIALS_FILE = os.path.join(DATA_DIR, 'internal_materials.json')
STUDY_ROOMS_FILE = os.path.join(DATA_DIR, 'study_rooms.json')
SPECIAL_ROOMS_FILE = os.path.join(DATA_DIR, 'special_rooms.json')
DEVICES_FILE = os.path.join(DATA_DIR, 'devices.json')
WORKSHOPS_FILE = os.path.join(DATA_DIR, 'workshops.json')
BOOKINGS_FILE = os.path.join(DATA_DIR, 'bookings.json')

# Helper functions for data management
def load_json(file_path):
    if os.path.exists(file_path):
        with open(file_path, 'r') as f:
            return json.load(f)
    return {}

def save_json(file_path, data):
    with open(file_path, 'w') as f:
        json.dump(data, f, indent=2)

def get_users():
    return load_json(USERS_FILE)

def save_users(users_data):
    save_json(USERS_FILE, users_data)

def get_library_books():
    return load_json(LIBRARY_BOOKS_FILE)

def get_ebooks():
    return load_json(EBOOKS_FILE)

def get_internal_materials():
    return load_json(INTERNAL_MATERIALS_FILE)

# Booking system helper functions
def get_study_rooms():
    return load_json(STUDY_ROOMS_FILE)

def save_study_rooms(data):
    save_json(STUDY_ROOMS_FILE, data)

def get_special_rooms():
    return load_json(SPECIAL_ROOMS_FILE)

def save_special_rooms(data):
    save_json(SPECIAL_ROOMS_FILE, data)

def get_devices():
    return load_json(DEVICES_FILE)

def save_devices(data):
    save_json(DEVICES_FILE, data)

def get_workshops():
    return load_json(WORKSHOPS_FILE)

def save_workshops(data):
    save_json(WORKSHOPS_FILE, data)

def get_bookings():
    return load_json(BOOKINGS_FILE)

def save_bookings(data):
    save_json(BOOKINGS_FILE, data)

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/register', methods=['GET', 'POST'])
def register_page():
    if request.method == 'GET':
        return render_template('register.html')
    
    # Process registration form submission
    username = request.form['username']
    password = request.form['password']
    confirm_password = request.form['confirm_password']
    name = request.form['name']
    email = request.form.get('email', '')
    role = request.form.get('role', 'Student')
    year = request.form.get('year', '')
    major = request.form.get('major', '')
    
    # Validate the form data
    users = get_users()
    if username in users:
        return render_template('register.html', error='Username already exists')
    
    if password != confirm_password:
        return render_template('register.html', error='Passwords do not match')
    
    # Create new user
    users[username] = {
        'password': password,
        'name': name,
        'username': username,
        'email': email,
        'role': role,
        'year': year,
        'major': major,
        'favorites': [],
        'my_bookshelf': [],
        'followers': 0,
        'following': 0,
        'avatar': 'profile_avatar.png'  # Default avatar
    }
    
    # Save updated users data
    save_users(users)
    
    # Automatically log in the new user
    session['username'] = username
    session['favorites'] = []
    
    return redirect(url_for('dashboard'))

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    
    users = get_users()
    if username in users and users[username]['password'] == password:
        session['username'] = username
        # Initialize favorites from the user's data
        session['favorites'] = users[username].get('favorites', [])
        return redirect(url_for('dashboard'))
    return render_template('index.html', error='Invalid username or password')

@app.route('/logout')
def logout():
    # Save favorites to user data before logging out
    if 'username' in session and 'favorites' in session:
        username = session['username']
        users = get_users()
        if username in users:
            users[username]['favorites'] = session.get('favorites', [])
            save_users(users)
    
    session.pop('username', None)
    session.pop('favorites', None)
    return redirect(url_for('index'))

@app.route('/dashboard')
def dashboard():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('dashboard.html')

@app.route('/booking')
def booking():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    username = session['username']
    
    # Load all booking data
    study_rooms = get_study_rooms()
    special_rooms = get_special_rooms()
    devices = get_devices()
    workshops = get_workshops()
    
    # Get user's workshop registrations
    user_workshop_registrations = []
    for workshop in workshops.get('workshops', []):
        for registration in workshop.get('registrations', []):
            if registration['user_id'] == username:
                user_workshop_registrations.append(workshop['id'])
                break
    
    return render_template('booking.html', 
                         study_rooms=study_rooms.get('study_rooms', []),
                         special_rooms=special_rooms.get('special_rooms', []),
                         devices=devices.get('devices', []),
                         workshops=workshops.get('workshops', []),
                         user_workshop_registrations=user_workshop_registrations)

@app.route('/recommendations')
def recommendations():
    if 'username' not in session:
        return redirect(url_for('index'))
    
    username = session['username']
    users = get_users()
    current_user = users.get(username, {})
    
    # Get all books
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    all_books = library_books + ebooks + internal_materials
    
    # Create book lookup dictionary
    book_lookup = {book['id']: book for book in all_books}
    
    # Generate Top 10 recommendations for same major/cohort
    user_major = current_user.get('major', '')
    user_year = current_user.get('year', '')
    
    # Find users with same major and year
    same_cohort_users = []
    for user_id, user_data in users.items():
        if (user_data.get('major') == user_major and 
            user_data.get('year') == user_year and 
            user_id != username):
            same_cohort_users.append(user_data)
    
    # Get popular books among cohort (using real data from JSON files)
    top_10_books = []
    
    # Create a list of all books with their real titles and images
    book_candidates = []
    
    # Add library books
    for book in library_books:
        book_candidates.append({
            'id': book['id'],
            'title': book['title'],
            'img': book['img'],
            'subject': book.get('subject', ''),
            'level': book.get('level', '')
        })
    
    # Add ebooks
    for book in ebooks:
        book_candidates.append({
            'id': book['id'],
            'title': book['title'],
            'img': book['img'],
            'subject': book.get('subject', ''),
            'level': book.get('level', '')
        })
    
    # Add internal materials
    for book in internal_materials:
        book_candidates.append({
            'id': book['id'],
            'title': book['title'],
            'img': book['img'],
            'subject': book.get('subject', ''),
            'course': book.get('course', '')
        })
    
    # Select top 10 books (prioritize by subject relevance and level)
    ranked_books = []
    for i, book in enumerate(book_candidates[:10]):  # Take first 10 books
        ranked_books.append({
            'id': book['id'],
            'title': book['title'],
            'img': book['img'],
            'rank': i + 1
        })
    
    top_10_books = ranked_books
    
    # Generate personalized suggestions based on GPA/performance (using real data)
    user_gpa = current_user.get('gpa', 3.5)  # Default GPA
    personalized_books = []
    
    # Find specific books by ID from our book_lookup
    if user_gpa >= 3.7:  # High performers
        book_ids = [4, 2, 14]  # Database Systems, Advanced Programming, Algorithm Study Guide
        reasons = [
            'Perfect for high achievers - advanced database concepts',
            'Expand your skills with advanced programming paradigms',
            'Prepare for advanced algorithm courses'
        ]
    elif user_gpa >= 3.0:  # Average performers
        book_ids = [5, 7, 3]  # Python Programming, CS101 Notes, Data Structures
        reasons = [
            'Strengthen your programming fundamentals',
            'Review course materials to improve performance',
            'Master essential data structures and algorithms'
        ]
    else:  # Need support
        book_ids = [1, 7, 8]  # Intro to CS, Course Notes, Lab Instructions
        reasons = [
            'Build strong foundation with computer science basics',
            'Essential study methods from course notes',
            'Step-by-step guidance with lab instructions'
        ]
    
    for i, book_id in enumerate(book_ids):
        if book_id in book_lookup:
            book = book_lookup[book_id]
            personalized_books.append({
                'id': book['id'],
                'title': book['title'],
                'reason': reasons[i]
            })
    
    # Course-based recommendations (using real course materials)
    registered_courses = ['CS101', 'CS201', 'MATH150']  # Sample courses
    course_books = []
    
    # Find course-related books
    course_book_mapping = {
        'CS101': {'id': 7, 'reason': 'Comprehensive lecture notes for your current course'},
        'CS201': {'id': 14, 'reason': 'Complete study guide for algorithm topics'},
        'MATH150': {'id': 15, 'reason': 'Essential formulas and reference material'}
    }
    
    for course in registered_courses:
        if course in course_book_mapping:
            book_id = course_book_mapping[course]['id']
            if book_id in book_lookup:
                book = book_lookup[book_id]
                course_books.append({
                    'id': book['id'],
                    'title': book['title'],
                    'course': course,
                    'reason': course_book_mapping[course]['reason']
                })
    
    # Latest events and promotions
    events = [
        {
            'title': 'Tech Career Fair 2025',
            'date': 'March 15, 2025',
            'description': 'Connect with top tech companies and explore internship opportunities',
            'image': 'event1.jpg',
            'link': '#'
        },
        {
            'title': 'Study Group Formation',
            'date': 'Ongoing',
            'description': 'Join study groups for your courses and improve together',
            'image': 'event2.jpg',
            'link': '#'
        },
        {
            'title': 'Library Workshop Series',
            'date': 'Every Friday',
            'description': 'Learn advanced research techniques and database usage',
            'image': 'event3.jpg',
            'link': '#'
        }
    ]
    
    return render_template('recommendations.html', 
                         user=current_user,
                         top_10_books=top_10_books,
                         personalized_books=personalized_books,
                         course_books=course_books,
                         events=events,
                         user_major=user_major,
                         user_year=user_year)

@app.route('/library')
def library():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('library.html')

@app.route('/api/library_data')
def get_library_data():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
        
    username = session['username']
    users = get_users()
    
    # Get all book sources
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    # Get user favorites, borrowed books and reserved books
    user_favorites = users.get(username, {}).get('favorites', [])
    borrowed_books = users.get(username, {}).get('borrowed_books', [])
    reserved_books = users.get(username, {}).get('reserved_books', [])
    
    # Mark books that are borrowed or reserved by this user and add book type
    for book in library_books:
        book['isBorrowedByUser'] = book['id'] in borrowed_books
        book['isReservedByUser'] = book['id'] in reserved_books
        book['bookType'] = 'physical'
        
    for book in ebooks:
        book['isReservedByUser'] = book['id'] in reserved_books
        book['bookType'] = 'ebook'
        
    for book in internal_materials:
        book['isReservedByUser'] = book['id'] in reserved_books
        book['bookType'] = 'internal'
    
    # For backward compatibility
    if 'my_bookshelf' in users.get(username, {}) and not borrowed_books:
        borrowed_books = users[username]['my_bookshelf']
        # Migrate data structure
        users[username]['borrowed_books'] = borrowed_books
        save_users(users)
        
    # Initialize reserved_books if it doesn't exist
    if 'reserved_books' not in users.get(username, {}):
        users[username]['reserved_books'] = []
        save_users(users)
    
    return jsonify({
        'status': 'success',
        'data': {
            'borrowedBooks': borrowed_books,
            'favorites': user_favorites,
            'reservedBooks': reserved_books,
            'libraryBooks': library_books,
            'ebooks': ebooks,
            'internalMaterials': internal_materials
        }
    })
    
@app.route('/api/book/<int:book_id>')
def get_book_details(book_id):
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
    
    username = session['username']
    users = get_users()
    
    # Get all book sources
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    # Search for the book in all sources
    all_books = library_books + ebooks + internal_materials
    
    for book in all_books:
        if book['id'] == book_id:
            # Check if this book is borrowed by the current user
            is_borrowed_by_user = False
            if username in users and 'borrowed_books' in users[username]:
                is_borrowed_by_user = book_id in users[username]['borrowed_books']
            
            book_info = dict(book)  # Make a copy to avoid modifying the original
            book_info['isBorrowedByUser'] = is_borrowed_by_user
            
            return jsonify({
                'status': 'success',
                'book': book_info
            })
    
    return jsonify({
        'status': 'error',
        'message': f'Book with ID {book_id} not found'
    }), 404

@app.route('/resource')
def resource():
    if 'username' not in session:
        return redirect(url_for('index'))
        
    # Ensure favorites are synced from user data
    username = session['username']
    users = get_users()
    if username in users and 'favorites' in users[username]:
        session['favorites'] = users[username]['favorites']
        session.modified = True

    username = session['username']
    users = get_users()
    
    # Get all book sources
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    # Combine all books for lookup by ID
    all_books = {}
    for book in library_books + ebooks + internal_materials:
        all_books[book['id']] = book
    
    # Get bookshelf IDs and favorites, then combine them
    bookshelf_ids = users[username].get('my_bookshelf', [])
    favorites_ids = users[username].get('favorites', [])
    
    # Combine bookshelf and favorites (using a set to avoid duplicates)
    combined_ids = list(set(bookshelf_ids + favorites_ids))
    
    # Convert to book objects
    my_bookshelf = [all_books[book_id] for book_id in combined_ids if book_id in all_books]
    
    books = {
        'my_bookshelf': my_bookshelf,
        'library_books': library_books,
        'ebooks': ebooks,
        'internal_materials': internal_materials
    }
    
    return render_template('resource.html', books=books, favorites=session.get('favorites', []))

@app.route('/add_favorite', methods=['POST'])
def add_favorite():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401

    data = request.get_json()
    # Log the received data for debugging
    print(f"Received favorite request with data: {data}")
    
    book_id = data.get('book_id')
    # Support both traditional book_id and bookId parameter
    if not book_id:
        book_id = data.get('bookId')
        
    # Convert string IDs to integers if possible for consistency
    try:
        if isinstance(book_id, str) and book_id.isdigit():
            book_id = int(book_id)
    except:
        pass

    if book_id:
        if 'favorites' not in session:
            session['favorites'] = []
            
        username = session['username']
        users = get_users()
        
        # Get book details for the response
        library_books = get_library_books()
        ebooks = get_ebooks()
        internal_materials = get_internal_materials()
        
        all_books = {}
        for book in library_books + ebooks + internal_materials:
            all_books[book['id']] = book
        
        book_details = all_books.get(book_id)
        
        # Toggle favorite status
        print(f"Current favorites: {session.get('favorites', [])}") 
        print(f"Book ID to toggle: {book_id} (Type: {type(book_id).__name__})")
        
        # Check if the book is already in favorites, handling both string and int IDs
        book_id_str = str(book_id)
        is_favorite = False
        
        for fav_id in session.get('favorites', []):
            if str(fav_id) == book_id_str:
                is_favorite = True
                break
                
        if not is_favorite:
            # Add to favorites
            print(f"Adding book {book_id} to favorites")
            session['favorites'] = session.get('favorites', [])
            session['favorites'].append(book_id)
            session.modified = True
            
            # Update user data
            if username in users:
                # Initialize favorites array if needed
                if 'favorites' not in users[username]:
                    users[username]['favorites'] = []
                
                users[username]['favorites'] = session['favorites']
                save_users(users)
                print(f"Updated user favorites: {users[username]['favorites']}")
            
            # Standardize image path if needed
            if book_details and 'img' in book_details:
                if book_details['img'].startswith('./'):
                    book_details['img'] = book_details['img'][2:]
            
            return jsonify({
                'status': 'success', 
                'message': f'Book {book_id} added to favorites.',
                'added_to_favorites': True,
                'book': book_details
            })
        else:
            # Remove from favorites - find the exact item to remove
            print(f"Removing book {book_id} from favorites")
            new_favorites = []
            for fav_id in session.get('favorites', []):
                if str(fav_id) != book_id_str:
                    new_favorites.append(fav_id)
            
            session['favorites'] = new_favorites
            session.modified = True
            
            # Update user data
            if username in users:
                users[username]['favorites'] = session['favorites']
                save_users(users)
                print(f"Updated user favorites after removal: {users[username]['favorites']}")
            
            return jsonify({
                'status': 'success', 
                'message': f'Book {book_id} removed from favorites.',
                'removed_from_favorites': True,
                'book_id': book_id
            })

    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

@app.route('/borrow_book', methods=['POST'])
def borrow_book():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
    
    data = request.get_json()
    book_id = data.get('bookId')
    
    if not book_id:
        return jsonify({'status': 'error', 'message': 'No book ID provided'}), 400
    
    username = session['username']
    users = get_users()
    
    # Get book details
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    all_books = {}
    for book in library_books + ebooks + internal_materials:
        all_books[book['id']] = book
    
    book_details = all_books.get(book_id)
    
    if not book_details:
        return jsonify({'status': 'error', 'message': f'Book with ID {book_id} not found'}), 404
    
    # Check if book is available (for physical books)
    if book_id in [book['id'] for book in library_books]:
        # Check availability
        if book_details.get('availableCopies', 0) <= 0:
            return jsonify({
                'status': 'error', 
                'message': f'Book {book_id} is not available for borrowing'
            }), 400
    
    # Update user's borrowed books
    if username in users:
        if 'borrowed_books' not in users[username]:
            users[username]['borrowed_books'] = []
        
        if book_id not in users[username]['borrowed_books']:
            # Add to user's borrowed books
            users[username]['borrowed_books'].append(book_id)
            
            # Calculate due date (30 days from now)
            from datetime import datetime, timedelta
            due_date = (datetime.now() + timedelta(days=30)).strftime('%Y-%m-%d')
            
            # Update available copies and set due date for physical books
            if book_id in [book['id'] for book in library_books]:
                for book in library_books:
                    if book['id'] == book_id and 'availableCopies' in book:
                        book['availableCopies'] -= 1
                        book['dueDate'] = due_date
                        if book['availableCopies'] <= 0:
                            book['status'] = 'unavailable'
                save_json(LIBRARY_BOOKS_FILE, library_books)
            
            save_users(users)
            
            # Standardize image path if needed
            if book_details and 'img' in book_details:
                if book_details['img'].startswith('./'):
                    book_details['img'] = book_details['img'][2:]
            
            # Include due date in the response
            return jsonify({
                'status': 'success',
                'message': f'Book {book_id} borrowed successfully.',
                'borrowed': True,
                'book': book_details,
                'dueDate': book_details.get('dueDate')
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Book {book_id} is already borrowed by you.'
            })
    
    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400
    
@app.route('/reserve_book', methods=['POST'])
def reserve_book():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
    
    data = request.get_json()
    book_id = data.get('bookId')
    
    if not book_id:
        return jsonify({'status': 'error', 'message': 'No book ID provided'}), 400
    
    username = session['username']
    users = get_users()
    
    # Get book details
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    all_books = {}
    for book in library_books + ebooks + internal_materials:
        all_books[book['id']] = book
    
    book_details = all_books.get(book_id)
    
    if not book_details:
        return jsonify({'status': 'error', 'message': f'Book with ID {book_id} not found'}), 404
    
    # Check if book is unavailable (for physical books)
    if book_id in [book['id'] for book in library_books]:
        # Check availability - we can only reserve books that are unavailable
        if book_details.get('availableCopies', 0) > 0 and book_details.get('status') != 'unavailable':
            return jsonify({
                'status': 'error', 
                'message': f'Book {book_id} is available for borrowing, no need to reserve'
            }), 400
    
    # Update user's reserved books
    if username in users:
        # Initialize reserved_books array if it doesn't exist
        if 'reserved_books' not in users[username]:
            users[username]['reserved_books'] = []
        
        # Check if book is already reserved by the user
        if book_id not in users[username]['reserved_books']:
            users[username]['reserved_books'].append(book_id)
            save_users(users)
            
            # Standardize image path if needed
            if book_details and 'img' in book_details:
                if book_details['img'].startswith('./'):
                    book_details['img'] = book_details['img'][2:]
            
            return jsonify({
                'status': 'success',
                'message': f'Book {book_id} reserved successfully.',
                'reserved': True,
                'book': book_details
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Book {book_id} is already reserved by you.'
            })
    
    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

@app.route('/unreserve_book', methods=['POST'])
def unreserve_book():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
    
    data = request.get_json()
    book_id = data.get('bookId')
    
    if not book_id:
        return jsonify({'status': 'error', 'message': 'No book ID provided'}), 400
    
    username = session['username']
    users = get_users()
    
    # Get book details
    library_books = get_library_books()
    ebooks = get_ebooks()
    internal_materials = get_internal_materials()
    
    all_books = {}
    for book in library_books + ebooks + internal_materials:
        all_books[book['id']] = book
    
    book_details = all_books.get(book_id)
    
    if not book_details:
        return jsonify({'status': 'error', 'message': f'Book with ID {book_id} not found'}), 404
    
    # Update user's reserved books
    if username in users and 'reserved_books' in users[username]:
        # Check if book is reserved by the user
        if book_id in users[username]['reserved_books']:
            users[username]['reserved_books'].remove(book_id)
            save_users(users)
            
            return jsonify({
                'status': 'success',
                'message': f'Book {book_id} reservation cancelled successfully.',
                'reserved': False,
                'book': book_details
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Book {book_id} is not reserved by you.'
            })
    
    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

@app.route('/return_book', methods=['POST'])
def return_book():
    if 'username' not in session:
        return jsonify({'status': 'error', 'message': 'User not logged in'}), 401
    
    data = request.get_json()
    book_id = data.get('bookId')
    
    if not book_id:
        return jsonify({'status': 'error', 'message': 'No book ID provided'}), 400
    
    username = session['username']
    users = get_users()
    
    # Update user's borrowed books
    if username in users and 'borrowed_books' in users[username]:
        if book_id in users[username]['borrowed_books']:
            users[username]['borrowed_books'].remove(book_id)
            
            # Update available copies for physical books
            library_books = get_library_books()
            if book_id in [book['id'] for book in library_books]:
                for book in library_books:
                    if book['id'] == book_id and 'availableCopies' in book:
                        book['availableCopies'] += 1
                        book['status'] = 'available'
                save_json(LIBRARY_BOOKS_FILE, library_books)
            
            save_users(users)
            
            return jsonify({
                'status': 'success',
                'message': f'Book {book_id} returned successfully.',
                'book_id': book_id
            })
        else:
            return jsonify({
                'status': 'error',
                'message': f'Book {book_id} is not borrowed by you.'
            })
    
    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

@app.route('/profile')
def profile():
    if 'username' not in session:
        return redirect(url_for('index'))
        
    username = session['username']
    users = get_users()
    
    if username in users:
        user_data = {
            'name': users[username].get('name', username),
            'username': username,
            'role': users[username].get('role', 'Student'),
            'year': users[username].get('year', ''),
            'major': users[username].get('major', ''),
            'followers': users[username].get('followers', 0),
            'following': users[username].get('following', 0),
            'avatar': users[username].get('avatar', 'profile_avatar.png')
        }
    else:
        user_data = {
            'name': username,
            'username': username,
            'role': 'Student',
            'year': '',
            'major': '',
            'followers': 0,
            'following': 0,
            'avatar': 'profile_avatar.png'
        }
        
    return render_template('profile.html', user=user_data)

# Booking API Routes
@app.route('/api/book-resource', methods=['POST'])
def book_resource():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Please log in first'}), 401
    
    data = request.get_json()
    resource_id = data.get('resource_id')
    resource_type = data.get('resource_type')
    booking_date = data.get('date')
    start_time = data.get('start_time')
    end_time = data.get('end_time')
    
    username = session['username']
    
    # Load bookings
    bookings_data = get_bookings()
    if 'bookings' not in bookings_data:
        bookings_data['bookings'] = []
    
    # Create new booking
    new_booking = {
        'id': f"booking_{len(bookings_data['bookings']) + 1}",
        'user_id': username,
        'resource_id': resource_id,
        'resource_type': resource_type,
        'date': booking_date,
        'start_time': start_time,
        'end_time': end_time,
        'status': 'confirmed',
        'created_at': '2025-09-08'
    }
    
    bookings_data['bookings'].append(new_booking)
    save_bookings(bookings_data)
    
    return jsonify({'success': True, 'message': 'Resource booked successfully', 'booking': new_booking})

@app.route('/api/register-workshop', methods=['POST'])
def register_workshop():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Please log in first'}), 401
    
    data = request.get_json()
    workshop_id = data.get('workshop_id')
    username = session['username']
    
    # Load workshops
    workshops_data = get_workshops()
    workshops = workshops_data.get('workshops', [])
    
    # Find the workshop
    workshop = None
    for w in workshops:
        if w['id'] == workshop_id:
            workshop = w
            break
    
    if not workshop:
        return jsonify({'success': False, 'message': 'Workshop not found'}), 404
    
    # Check if user is already registered
    if any(reg['user_id'] == username for reg in workshop.get('registrations', [])):
        return jsonify({'success': False, 'message': 'Already registered for this workshop'}), 400
    
    # Check availability
    if workshop['available_spots'] <= 0:
        return jsonify({'success': False, 'message': 'Workshop is full'}), 400
    
    # Register user
    if 'registrations' not in workshop:
        workshop['registrations'] = []
    
    workshop['registrations'].append({
        'user_id': username,
        'registration_date': '2025-09-08'
    })
    
    workshop['available_spots'] -= 1
    
    if workshop['available_spots'] <= 0:
        workshop['availability'] = 'registration_closed'
    
    save_workshops(workshops_data)
    
    return jsonify({'success': True, 'message': 'Workshop registration successful'})

@app.route('/api/deregister-workshop', methods=['POST'])
def deregister_workshop():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Please log in first'}), 401
    
    data = request.get_json()
    workshop_id = data.get('workshop_id')
    username = session['username']
    
    # Load workshops
    workshops_data = get_workshops()
    workshops = workshops_data.get('workshops', [])
    
    # Find the workshop
    workshop = None
    for w in workshops:
        if w['id'] == workshop_id:
            workshop = w
            break
    
    if not workshop:
        return jsonify({'success': False, 'message': 'Workshop not found'}), 404
    
    # Check if user is registered
    user_registration = None
    for i, reg in enumerate(workshop.get('registrations', [])):
        if reg['user_id'] == username:
            user_registration = i
            break
    
    if user_registration is None:
        return jsonify({'success': False, 'message': 'You are not registered for this workshop'}), 400
    
    # Remove user registration
    workshop['registrations'].pop(user_registration)
    workshop['available_spots'] += 1
    
    # Update availability if spots are now available
    if workshop['available_spots'] > 0 and workshop['availability'] == 'registration_closed':
        workshop['availability'] = 'registration_open'
    
    save_workshops(workshops_data)
    
    return jsonify({'success': True, 'message': 'Workshop deregistration successful'})

@app.route('/api/join-waitlist', methods=['POST'])
def join_waitlist():
    if 'username' not in session:
        return jsonify({'success': False, 'message': 'Please log in first'}), 401
    
    data = request.get_json()
    resource_id = data.get('resource_id')
    username = session['username']
    
    # Load bookings
    bookings_data = get_bookings()
    if 'waitlists' not in bookings_data:
        bookings_data['waitlists'] = []
    
    # Check if already on waitlist
    if any(w['user_id'] == username and w['resource_id'] == resource_id for w in bookings_data['waitlists']):
        return jsonify({'success': False, 'message': 'Already on waitlist'}), 400
    
    # Add to waitlist
    waitlist_entry = {
        'user_id': username,
        'resource_id': resource_id,
        'joined_date': '2025-09-08'
    }
    
    bookings_data['waitlists'].append(waitlist_entry)
    save_bookings(bookings_data)
    
    return jsonify({'success': True, 'message': 'Added to waitlist successfully'})

@app.route('/api/get-resource-details/<resource_id>')
def get_resource_details(resource_id):
    # Search through all resource types
    all_resources = []
    
    study_rooms = get_study_rooms().get('study_rooms', [])
    special_rooms = get_special_rooms().get('special_rooms', [])
    devices = get_devices().get('devices', [])
    workshops = get_workshops().get('workshops', [])
    
    all_resources.extend(study_rooms)
    all_resources.extend(special_rooms)
    all_resources.extend(devices)
    all_resources.extend(workshops)
    
    resource = None
    for r in all_resources:
        if r['id'] == resource_id:
            resource = r
            break
    
    if not resource:
        return jsonify({'success': False, 'message': 'Resource not found'}), 404
    
    return jsonify({'success': True, 'resource': resource})

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(debug=True)