# app.py - Backend Flask application for AI-Powered Library and Learning Hub (Prototype)

from flask import Flask, render_template, request, redirect, url_for, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timedelta
import random
import requests  # For potential LLM API integration
import os

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key_here'  # Change this to a secure key
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///library.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- Database Models ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.String(120), nullable=False)  # In production, hash passwords
    major = db.Column(db.String(100))
    year = db.Column(db.Integer)
    courses = db.Column(db.String(200))  # Comma-separated courses
    reading_goals = db.Column(db.String(200))
    is_teacher = db.Column(db.Boolean, default=False)

class Resource(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    type = db.Column(db.String(50), nullable=False)  # book, ebook, past_paper, workshop
    genre = db.Column(db.String(100))
    available = db.Column(db.Boolean, default=True)

class Borrowing(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('resource.id'), nullable=False)
    borrow_date = db.Column(db.DateTime, default=datetime.utcnow)
    return_date = db.Column(db.DateTime)

# Create database tables and mock data
with app.app_context():
    db.create_all()
    # Mock data insertion (run once or on init)
    if User.query.count() == 0:
        print("Initializing database with mock data...")
        student = User(username='student1', password='pass', major='Computer Science', year=2, courses='AI,Databases')
        teacher = User(username='teacher1', password='pass', is_teacher=True)
        db.session.add(student)
        db.session.add(teacher)
        
        book1 = Resource(title='Python Programming', type='book', genre='Tech')
        ebook1 = Resource(title='Machine Learning Basics', type='ebook', genre='Tech')
        past_paper = Resource(title='AI Exam 2023', type='past_paper')
        workshop = Resource(title='3D Printer Session', type='workshop')
        
        db.session.add(book1)
        db.session.add(ebook1)
        db.session.add(past_paper)
        db.session.add(workshop)
        db.session.commit()
        print("Database initialized.")

# --- Routes ---
@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        # WARNING: In a real application, NEVER store or compare passwords in plaintext.
        # Use a library like Werkzeug or Passlib to hash and verify passwords.
        user = User.query.filter_by(username=username, password=password).first()
        if user:
            session['user_id'] = user.id
            session['username'] = user.username
            return redirect(url_for('dashboard'))
        return render_template('login.html', error='Invalid credentials. Please try again.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    return redirect(url_for('login'))

@app.route('/dashboard')
def dashboard():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    
    # Mock reading analytics
    reading_hours = random.randint(1, 10)
    books_read = random.randint(1, 5)
    genres = ['Tech', 'Fiction', 'Science']
    
    # Mock academic snapshot
    performance = 'Good - Focus on AI topics'
    
    # AI-generated encouragement (mock)
    encouragement = 'Great job! Try reading more on Databases this week.'
    
    return render_template('dashboard.html', user=user, reading_hours=reading_hours, books_read=books_read, genres=genres, performance=performance, encouragement=encouragement)

@app.route('/book', methods=['GET', 'POST'])
def book_resource():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    
    message = None
    if request.method == 'POST':
        resource_id = int(request.form['resource_id'])
        resource = Resource.query.get(resource_id)
        if resource and resource.available:
            borrowing = Borrowing(user_id=session['user_id'], resource_id=resource_id)
            resource.available = False
            db.session.add(borrowing)
            db.session.commit()
            message = f'Successfully borrowed "{resource.title}"!'
        else:
            message = 'Resource is not available or does not exist.'

    resources = Resource.query.filter_by(available=True).all()
    return render_template('book.html', resources=resources, message=message)

@app.route('/recommendations')
def recommendations():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    
    # Simple recommendation based on major/courses (mock AI)
    if user.major == 'Computer Science':
        recs = ['Advanced Python', 'Deep Learning with PyTorch', 'Database Design Fundamentals']
    else:
        recs = ['The Art of Public Speaking', 'Introduction to Psychology', 'World History Vol. 1']
    
    # Social recommendations (mock)
    social_recs = ['What your peers are reading: "AI Ethics"', 'Trending in your major: "Quantum Computing Explained"']
    
    return render_template('recommendations.html', recs=recs, social_recs=social_recs)

@app.route('/chatbot', methods=['POST'])
def chatbot():
    if 'user_id' not in session:
        return jsonify({'response': 'Authentication error. Please log in again.'})
    query = request.json.get('query')
    
    # This is where you would integrate with a real LLM API like Grok, GPT, or Gemini.
    # The commented-out code below is a placeholder for such an integration.
    # api_key = os.getenv('GROK_API_KEY')
    # if api_key:
    #     try:
    #         response = requests.post('https://api.x.ai/v1/chat/completions', 
    #                                  headers={'Authorization': f'Bearer {api_key}'},
    #                                  json={'model': 'grok-4', 'messages': [{'role': 'user', 'content': query}]})
    #         response.raise_for_status() # Raise an exception for bad status codes
    #         return jsonify({'response': response.json()['choices'][0]['message']['content']})
    #     except requests.exceptions.RequestException as e:
    #         return jsonify({'response': f'API Error: {e}'})

    # For now, we use a mock response to ensure the feature is testable.
    mock_response = f'AI Assistant: You asked about "{query}". Based on your profile, I recommend checking out "Machine Learning Basics" from our e-book section.'
    return jsonify({'response': mock_response})


@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    user = User.query.get(session['user_id'])
    message = None
    if request.method == 'POST':
        user.major = request.form['major']
        user.year = int(request.form['year'])
        user.courses = request.form['courses']
        user.reading_goals = request.form['reading_goals']
        db.session.commit()
        message = 'Profile updated successfully!'
        
    borrowings = Borrowing.query.filter_by(user_id=user.id).all()
    history = [Resource.query.get(b.resource_id) for b in borrowings]
    return render_template('profile.html', user=user, history=history, message=message)

if __name__ == '__main__':
    app.run(debug=True)