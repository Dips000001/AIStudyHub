from flask import Flask, render_template, request, redirect, url_for, session, jsonify

app = Flask(__name__)
app.secret_key = 'your_secret_key'  # Change this to a random secret key

# Dummy user data for demonstration
USERS = {
    "alex": "password"
}

@app.route('/')
def index():
    if 'username' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login', methods=['POST'])
def login():
    username = request.form['username']
    password = request.form['password']
    if USERS.get(username) == password:
        session['username'] = username
        session['favorites'] = [] # Initialize favorites
        return redirect(url_for('dashboard'))
    return 'Invalid credentials'

@app.route('/logout')
def logout():
    session.pop('username', None)
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

    books = {
        'my_bookshelf': [
            {'id': 1, 'title': 'The Bully', 'img': 'book1.jpg', 'link': '#'},
            {'id': 2, 'title': 'Destination Germany', 'img': 'book2.jpg', 'link': '#'}
        ],
        'library_books': [
            {'id': 3, 'title': 'Utah', 'img': 'book3.jpg', 'link': '#'}
        ],
        'ebooks': [
            {'id': 1, 'title': 'The Bully', 'img': './img/library/001.png', 'link': '#'},
            {'id': 2, 'title': 'Destination Germany', 'img': 'book2.jpg', 'link': '#'}
        ],
        'internal_materials': []
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
            return jsonify({'status': 'success', 'message': f'Book {book_id} added to favorites.'})
        else:
            session['favorites'].remove(book_id)
            session.modified = True
            return jsonify({'status': 'success', 'message': f'Book {book_id} removed from favorites.'})

    return jsonify({'status': 'error', 'message': 'Invalid request'}), 400


@app.route('/profile')
def profile():
    if 'username' not in session:
        return redirect(url_for('index'))
    # Dummy data for profile page
    user_data = {
        'name': 'TSAI Hsin Chien',
        'username': 'hctsai8',
        'role': 'Student',
        'year': 'Year2',
        'major': 'Bachelor of Computer Science',
        'followers': 2,
        'following': 4,
        'avatar': 'profile_avatar.png'
    }
    return render_template('profile.html', user=user_data)


if __name__ == '__main__':
    app.run(debug=True)