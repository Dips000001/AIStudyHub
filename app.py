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
    return render_template('booking.html')

@app.route('/recommendations')
def recommendations():
    if 'username' not in session:
        return redirect(url_for('index'))
    return render_template('recommendations.html')

@app.route('/resource')
def resource():
    if 'username' not in session:
        return redirect(url_for('index'))

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
    
    # Get bookshelf IDs and convert to book objects
    bookshelf_ids = users[username].get('my_bookshelf', [])
    my_bookshelf = [all_books[book_id] for book_id in bookshelf_ids if book_id in all_books]
    
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
    book_id = data.get('book_id')

    if book_id:
        if 'favorites' not in session:
            session['favorites'] = []
            
        if book_id not in session['favorites']:
            session['favorites'].append(book_id)
            session.modified = True  # Make sure the session is saved
            
            # Update user data in JSON file
            username = session['username']
            users = get_users()
            if username in users:
                users[username]['favorites'] = session['favorites']
                
                # Also add to my_bookshelf if not already there
                if 'my_bookshelf' not in users[username]:
                    users[username]['my_bookshelf'] = []
                
                if book_id not in users[username]['my_bookshelf']:
                    users[username]['my_bookshelf'].append(book_id)
                
                save_users(users)
                
                # Get book details for the response
                library_books = get_library_books()
                ebooks = get_ebooks()
                internal_materials = get_internal_materials()
                
                all_books = {}
                for book in library_books + ebooks + internal_materials:
                    all_books[book['id']] = book
                
                book_details = all_books.get(book_id)
                
                return jsonify({
                    'status': 'success', 
                    'message': f'Book {book_id} added to favorites and bookshelf.',
                    'added_to_bookshelf': True,
                    'book': book_details
                })
        else:
            session['favorites'].remove(book_id)
            session.modified = True
            
            # Update user data in JSON file
            username = session['username']
            users = get_users()
            if username in users:
                users[username]['favorites'] = session['favorites']
                
                # Also remove from my_bookshelf if present
                if 'my_bookshelf' in users[username] and book_id in users[username]['my_bookshelf']:
                    users[username]['my_bookshelf'].remove(book_id)
                
                save_users(users)
                
            return jsonify({
                'status': 'success', 
                'message': f'Book {book_id} removed from favorites and bookshelf.',
                'removed_from_bookshelf': True,
                'book_id': book_id
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

if __name__ == '__main__':
    # Ensure data directory exists
    os.makedirs(DATA_DIR, exist_ok=True)
    app.run(debug=True)