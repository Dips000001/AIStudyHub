import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from datetime import datetime, timedelta
import random

# Set page configuration
st.set_page_config(
    page_title="AI Library & Learning Hub",
    page_icon="📚",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        color: #1E90FF;
        text-align: center;
        margin-bottom: 2rem;
    }
    .feature-card {
        background-color: #f0f8ff;
        padding: 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 1.5rem;
    }
    .recommendation-card {
        background-color: #e6f7ff;
        padding: 1rem;
        border-radius: 0.5rem;
        margin-bottom: 1rem;
        border-left: 4px solid #1E90FF;
    }
    .metric-card {
        background-color: #f9f9f9;
        padding: 1rem;
        border-radius: 0.5rem;
        text-align: center;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
</style>
""", unsafe_allow_html=True)

# Generate mock data
def generate_mock_user_data():
    return {
        "name": "Alex Johnson",
        "major": "Computer Science",
        "year": "Junior",
        "courses": ["CS101", "CS202", "MATH301", "ENG150"],
        "reading_goal": 20,
        "books_read": 15,
        "hours_read": 47.5
    }

def generate_mock_reading_data():
    dates = pd.date_range(start='2023-01-01', end=datetime.today(), freq='D')
    return pd.DataFrame({
        'date': dates,
        'reading_hours': [random.uniform(0, 3.5) for _ in range(len(dates))],
        'books_completed': [random.randint(0, 1) for _ in range(len(dates))]
    })

def generate_mock_recommendations():
    return [
        {"title": "Introduction to Algorithms", "author": "Cormen et al.", "reason": "Based on your CS202 course"},
        {"title": "Clean Code", "author": "Robert C. Martin", "reason": "Popular among CS students"},
        {"title": "The Pragmatic Programmer", "author": "Andrew Hunt", "reason": "Based on your reading history"},
        {"title": "Calculus: Early Transcendentals", "author": "James Stewart", "reason": "Relevant to your MATH301 course"}
    ]

def generate_mock_popular_books():
    return [
        {"title": "Deep Learning", "author": "Ian Goodfellow", "borrow_count": 42},
        {"title": "Pattern Recognition", "author": "Christopher Bishop", "borrow_count": 38},
        {"title": "The Singularity Is Near", "author": "Ray Kurzweil", "borrow_count": 35},
        {"title": "AI: A Modern Approach", "author": "Stuart Russell", "borrow_count": 33}
    ]

# Initialize session state
if 'user_data' not in st.session_state:
    st.session_state.user_data = generate_mock_user_data()
if 'reading_data' not in st.session_state:
    st.session_state.reading_data = generate_mock_reading_data()
if 'recommendations' not in st.session_state:
    st.session_state.recommendations = generate_mock_recommendations()
if 'popular_books' not in st.session_state:
    st.session_state.popular_books = generate_mock_popular_books()

# Sidebar
with st.sidebar:
    st.title("Navigation")
    menu_option = st.radio("Go to", ["Dashboard", "Resource Catalog", "Booking System", "AI Assistant", "Account Settings"])
    
    st.title("Quick Actions")
    if st.button("Borrow a Book"):
        st.session_state.current_page = "Resource Catalog"
    
    if st.button("Talk to AI Assistant"):
        st.session_state.current_page = "AI Assistant"
    
    st.title("Reading Goal")
    goal_progress = st.session_state.user_data['books_read'] / st.session_state.user_data['reading_goal']
    st.progress(goal_progress)
    st.caption(f"{st.session_state.user_data['books_read']} of {st.session_state.user_data['reading_goal']} books")
    
    st.title("Upcoming Events")
    st.caption("Workshop: 3D Printing Basics - Tomorrow, 3 PM")
    st.caption("Guest Lecture: Future of AI - Next Friday, 2 PM")

# Main content
if menu_option == "Dashboard":
    st.markdown('<h1 class="main-header">AI-Powered Library & Learning Hub</h1>', unsafe_allow_html=True)
    
    # Welcome message
    user = st.session_state.user_data
    st.success(f"Welcome back, {user['name']}! You've read {user['books_read']} books this semester and spent {user['hours_read']} hours reading.")
    
    # Metrics row
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric("Books Read", user['books_read'], f"{user['books_read'] - 12}")
        st.markdown('</div>', unsafe_allow_html=True)
    with col2:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric("Hours Read", f"{user['hours_read']}", "+12.5")
        st.markdown('</div>', unsafe_allow_html=True)
    with col3:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric("Current Loans", "3", "-1")
        st.markdown('</div>', unsafe_allow_html=True)
    with col4:
        st.markdown('<div class="metric-card">', unsafe_allow_html=True)
        st.metric("Days Streak", "14", "+3")
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Charts row
    col1, col2 = st.columns(2)
    
    with col1:
        st.markdown('<div class="feature-card">', unsafe_allow_html=True)
        st.subheader("Reading Activity")
        
        # Weekly reading hours
        reading_data = st.session_state.reading_data
        weekly_data = reading_data.resample('W', on='date').sum().reset_index()
        weekly_data['week'] = weekly_data['date'].dt.strftime('%Y-%U')
        
        fig = px.bar(weekly_data, x='week', y='reading_hours', 
                     labels={'reading_hours': 'Hours', 'week': 'Week'},
                     title='Weekly Reading Hours')
        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    with col2:
        st.markdown('<div class="feature-card">', unsafe_allow_html=True)
        st.subheader("Genre Distribution")
        
        # Mock genre data
        genres = ['Computer Science', 'Mathematics', 'Fiction', 'Science', 'History', 'Philosophy']
        hours = [25, 18, 12, 10, 8, 5]
        
        fig = px.pie(values=hours, names=genres, title='Reading Time by Genre')
        st.plotly_chart(fig, use_container_width=True)
        st.markdown('</div>', unsafe_allow_html=True)
    
    # Recommendations row
    st.markdown('<div class="feature-card">', unsafe_allow_html=True)
    st.subheader("Personalized Recommendations")
    
    recommendations = st.session_state.recommendations
    cols = st.columns(2)
    
    for i, rec in enumerate(recommendations):
        with cols[i % 2]:
            st.markdown('<div class="recommendation-card">', unsafe_allow_html=True)
            st.markdown(f"**{rec['title']}** by *{rec['author']}*")
            st.caption(f"Reason: {rec['reason']}")
            if st.button("Borrow", key=f"borrow_{i}"):
                st.success(f"Added {rec['title']} to your borrow list!")
            st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown('</div>', unsafe_allow_html=True)
    
    # Popular books row
    st.markdown('<div class="feature-card">', unsafe_allow_html=True)
    st.subheader("Popular Among Computer Science Students")
    
    popular_books = st.session_state.popular_books
    df = pd.DataFrame(popular_books)
    
    fig = px.bar(df, x='title', y='borrow_count', 
                 labels={'borrow_count': 'Borrow Count', 'title': 'Book Title'},
                 title='Most Borrowed Books in Your Major')
    st.plotly_chart(fig, use_container_width=True)
    st.markdown('</div>', unsafe_allow_html=True)

elif menu_option == "Resource Catalog":
    st.title("Resource Catalog")
    st.subheader("Browse our extensive collection of resources")
    
    search_query = st.text_input("Search for books, articles, or resources")
    
    col1, col2, col3 = st.columns(3)
    with col1:
        st.selectbox("Filter by Type", ["All", "Physical Books", "E-books", "Past Papers", "Workshop Equipment"])
    with col2:
        st.selectbox("Filter by Subject", ["All", "Computer Science", "Mathematics", "Engineering", "Literature"])
    with col3:
        st.selectbox("Sort by", ["Relevance", "Popularity", "Newest", "Title"])
    
    # Mock search results
    if search_query:
        st.write(f"Showing results for '{search_query}'")
        results = [
            {"title": "Introduction to Algorithms", "type": "Physical Book", "available": True},
            {"title": "Algorithm Design Manual", "type": "E-book", "available": True},
            {"title": "CS202 Past Papers (2020-2023)", "type": "Past Papers", "available": True}
        ]
        
        for res in results:
            with st.expander(f"{res['title']} - {res['type']}"):
                st.write("Description would appear here")
                if res['available']:
                    st.success("Available for borrowing")
                    if st.button("Borrow", key=res['title']):
                        st.success("Added to your borrow list!")
                else:
                    st.error("Currently unavailable")
                    st.button("Place Hold", key=f"hold_{res['title']}")

elif menu_option == "Booking System":
    st.title("Booking System")
    st.subheader("Reserve library resources and equipment")
    
    tab1, tab2, tab3, tab4 = st.tabs(["Physical Books", "E-books", "Past Papers", "Workshop"])
    
    with tab1:
        st.write("Browse physical books available for borrowing")
        book = st.selectbox("Select a book", ["Introduction to Algorithms", "Clean Code", "Design Patterns"])
        if st.button("Borrow Physical Book"):
            st.success(f"You've borrowed {book}. Please pick it up within 24 hours.")
    
    with tab4:
        st.write("Book workshop equipment")
        equipment = st.selectbox("Select equipment", ["3D Printer", "Laser Cutter", "VR Headset"])
        date = st.date_input("Select date")
        time = st.time_input("Select time slot")
        
        if st.button("Reserve Equipment"):
            st.success(f"Reserved {equipment} for {date} at {time}.")

elif menu_option == "AI Assistant":
    st.title("AI Assistant")
    st.subheader("Get help finding resources and answering questions")
    
    # Initialize chat history
    if "messages" not in st.session_state:
        st.session_state.messages = [
            {"role": "assistant", "content": "Hi! I'm your library AI assistant. How can I help you today?"}
        ]
    
    # Display chat messages from history on app rerun
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])
    
    # React to user input
    if prompt := st.chat_input("Ask me anything about our resources..."):
        # Display user message in chat message container
        st.chat_message("user").markdown(prompt)
        # Add user message to chat history
        st.session_state.messages.append({"role": "user", "content": prompt})
        
        # Simulate AI response
        response = generate_ai_response(prompt)
        # Display assistant response in chat message container
        with st.chat_message("assistant"):
            st.markdown(response)
        # Add assistant response to chat history
        st.session_state.messages.append({"role": "assistant", "content": response})

elif menu_option == "Account Settings":
    st.title("Account Settings")
    
    user = st.session_state.user_data
    
    with st.form("user_profile"):
        st.subheader("Personal Information")
        name = st.text_input("Full Name", value=user['name'])
        major = st.selectbox("Major", 
                            ["Computer Science", "Mathematics", "Engineering", "Literature", "Biology"],
                            index=0)
        year = st.selectbox("Year", 
                           ["Freshman", "Sophomore", "Junior", "Senior", "Graduate"],
                           index=2)
        
        st.subheader("Academic Information")
        courses = st.multiselect("Current Courses",
                                ["CS101", "CS202", "MATH301", "ENG150", "PHYS101", "HIST210"],
                                default=user['courses'])
        
        st.subheader("Reading Goals")
        reading_goal = st.slider("Books to read this semester", 5, 50, value=user['reading_goal'])
        
        submitted = st.form_submit_button("Update Profile")
        if submitted:
            # Update user data
            st.session_state.user_data = {
                "name": name,
                "major": major,
                "year": year,
                "courses": courses,
                "reading_goal": reading_goal,
                "books_read": user['books_read'],
                "hours_read": user['hours_read']
            }
            st.success("Profile updated successfully!")

# Helper function for AI responses
def generate_ai_response(prompt):
    prompt_lower = prompt.lower()
    
    if "algorithm" in prompt_lower:
        return "I found several resources on algorithms:\n\n1. **Introduction to Algorithms** by Cormen et al. (Available)\n2. **Algorithm Design Manual** by Skiena (E-book available)\n3. **Algorithms** by Sedgewick (Currently borrowed, due next week)\n\nWould you like me to reserve one of these for you?"
    elif "python" in prompt_lower or "programming" in prompt_lower:
        return "We have many Python programming resources:\n\n1. **Python Crash Course** by Eric Matthes (Available)\n2. **Fluent Python** by Luciano Ramalho (E-book available)\n3. **Automate the Boring Stuff with Python** by Al Sweigart (Available)\n\nWe also have Python programming workshops every Thursday at 4 PM."
    elif "history" in prompt_lower:
        return "For history resources, I recommend:\n\n1. **A People's History of the United States** by Howard Zinn (Available)\n2. **Guns, Germs, and Steel** by Jared Diamond (Available as E-book)\n3. **The History of the Ancient World** by Susan Wise Bauer (Available)\n\nWould you like to explore a specific historical period?"
    else:
        return "I can help you find resources on various topics. We have extensive collections in Computer Science, Mathematics, Engineering, and Literature. Could you please specify what subject you're interested in?"
