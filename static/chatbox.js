// Floating Chatbox JavaScript
class FloatingChatbox {
    constructor() {
        this.isExpanded = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatbox();
        this.bindEvents();
        this.addWelcomeMessage();
    }

    createChatbox() {
        const chatboxHTML = `
            <div class="chatbox-container" id="chatboxContainer">
                <div class="chatbox-button" id="chatboxButton">
                    <i class="fas fa-comments"></i>
                    <div class="notification-badge" id="notificationBadge" style="display: none;">1</div>
                </div>
                <div class="chatbox-expanded" id="chatboxExpanded" style="display: none;">
                    <div class="chatbox-header" id="chatboxHeader">
                        <h3 class="chatbox-title">AI StudyHub Assistant</h3>
                        <div class="chatbox-controls">
                            <button class="control-btn" id="minimizeBtn" title="Minimize">
                                <i class="fas fa-minus"></i>
                            </button>
                        </div>
                    </div>
                    <div class="chatbox-messages" id="chatboxMessages">
                        <!-- Messages will be added here -->
                    </div>
                    <div class="chatbox-input-area">
                        <input type="text" class="chatbox-input" id="chatboxInput" placeholder="Type your message..." maxlength="500">
                        <button class="send-btn" id="sendBtn">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatboxHTML);
        
        this.container = document.getElementById('chatboxContainer');
        this.button = document.getElementById('chatboxButton');
        this.expanded = document.getElementById('chatboxExpanded');
        this.header = document.getElementById('chatboxHeader');
        this.messages = document.getElementById('chatboxMessages');
        this.input = document.getElementById('chatboxInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.minimizeBtn = document.getElementById('minimizeBtn');
        this.notificationBadge = document.getElementById('notificationBadge');
    }

    bindEvents() {
        // Toggle chatbox
        this.button.addEventListener('click', () => this.toggleChatbox());
        this.minimizeBtn.addEventListener('click', () => this.toggleChatbox());

        // Send message
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Drag functionality
        this.header.addEventListener('mousedown', (e) => this.startDrag(e));
        this.button.addEventListener('mousedown', (e) => this.startDrag(e));
        
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.stopDrag());

        // Touch events for mobile
        this.header.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        this.button.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        
        document.addEventListener('touchmove', (e) => this.drag(e.touches[0]));
        document.addEventListener('touchend', () => this.stopDrag());

        // Prevent text selection during drag
        this.header.addEventListener('selectstart', (e) => e.preventDefault());
        this.button.addEventListener('selectstart', (e) => e.preventDefault());
    }

    toggleChatbox() {
        this.isExpanded = !this.isExpanded;
        
        if (this.isExpanded) {
            this.button.style.display = 'none';
            this.expanded.style.display = 'flex';
            this.expanded.classList.add('chatbox-maximized');
            this.input.focus();
            this.hideNotification();
        } else {
            this.expanded.style.display = 'none';
            this.button.style.display = 'flex';
            this.button.classList.add('chatbox-minimized');
        }

        // Remove animation classes after animation completes
        setTimeout(() => {
            this.expanded.classList.remove('chatbox-maximized');
            this.button.classList.remove('chatbox-minimized');
        }, 300);
    }

    startDrag(e) {
        this.isDragging = true;
        this.container.classList.add('dragging');
        
        const rect = this.container.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        // Keep chatbox within viewport bounds
        const maxX = window.innerWidth - this.container.offsetWidth;
        const maxY = window.innerHeight - this.container.offsetHeight;
        
        const boundedX = Math.max(0, Math.min(x, maxX));
        const boundedY = Math.max(0, Math.min(y, maxY));
        
        this.container.style.left = boundedX + 'px';
        this.container.style.top = boundedY + 'px';
        this.container.style.right = 'auto';
        this.container.style.bottom = 'auto';
    }

    stopDrag() {
        this.isDragging = false;
        this.container.classList.remove('dragging');
    }

    addMessage(content, isUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user' : 'bot'}`;
        
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        messageDiv.innerHTML = `
            <div>${content}</div>
            <div class="message-time">${time}</div>
        `;
        
        this.messages.appendChild(messageDiv);
        this.scrollToBottom();
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typingIndicator';
        typingDiv.innerHTML = `
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
            <span>AI Assistant is typing...</span>
        `;
        
        this.messages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    scrollToBottom() {
        this.messages.scrollTop = this.messages.scrollHeight;
    }

    sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        // Add user message
        this.addMessage(message, true);
        this.input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        // Simulate AI response
        setTimeout(() => {
            this.hideTypingIndicator();
            this.generateAIResponse(message);
        }, 1000 + Math.random() * 2000);
    }

    generateAIResponse(userMessage) {
        const responses = [
            "I'm here to help you with your studies! What would you like to know?",
            "That's a great question! Let me help you find the right resources.",
            "I can assist you with finding books, booking study rooms, or getting recommendations.",
            "Would you like me to help you search for specific materials in our library?",
            "I can help you with course materials, study tips, or navigating the library system.",
            "Feel free to ask me about our booking system, available resources, or study recommendations!",
            "I'm designed to make your academic journey easier. How can I assist you today?",
            "That's interesting! I can help you find related materials or suggest study strategies.",
            "I have access to our entire library database. What specific topic are you researching?",
            "Would you like me to recommend some study resources based on your current courses?"
        ];
        
        // Simple keyword-based responses
        const lowerMessage = userMessage.toLowerCase();
        let response;
        
        if (lowerMessage.includes('book') || lowerMessage.includes('library')) {
            response = "I can help you find books in our library! You can search through our physical books, e-books, and academic resources. Would you like me to help you search for something specific?";
        } else if (lowerMessage.includes('room') || lowerMessage.includes('booking')) {
            response = "Our booking system allows you to reserve study rooms, special facilities, and equipment. You can book individual study rooms, group rooms, conference rooms, and even devices like 3D printers!";
        } else if (lowerMessage.includes('recommend') || lowerMessage.includes('suggestion')) {
            response = "I can provide personalized recommendations based on your major, courses, and academic performance. Check out the Recommendations page for curated suggestions!";
        } else if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
            response = "I'm here to help! You can ask me about finding books, booking rooms, getting recommendations, or navigating any part of the AI StudyHub system.";
        } else {
            response = responses[Math.floor(Math.random() * responses.length)];
        }
        
        this.addMessage(response);
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage("👋 Welcome to AI StudyHub! I'm your virtual assistant. How can I help you today?");
            if (!this.isExpanded) {
                this.showNotification();
            }
        }, 2000);
    }

    showNotification() {
        this.notificationBadge.style.display = 'flex';
    }

    hideNotification() {
        this.notificationBadge.style.display = 'none';
    }
}

// Initialize chatbox when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new FloatingChatbox();
});