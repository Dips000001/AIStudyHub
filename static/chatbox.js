// Floating Chatbox JavaScript with Ollama Integration
class FloatingChatbox {
    constructor() {
        this.isExpanded = false;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.messages = [];
        this.isConnected = false;
        this.isConnecting = false;
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
                        <div class="header-left">
                            <h3 class="chatbox-title">AI StudyHub Assistant</h3>
                            <div class="connection-status" id="connectionStatus">
                                <span class="status-indicator" id="statusIndicator"></span>
                                <span id="statusText">Disconnected</span>
                            </div>
                        </div>
                        <div class="chatbox-controls">
                            <button class="control-btn" id="connectBtn" title="Connect to AI" style="display: none;">
                                <i class="fas fa-plug"></i>
                            </button>
                            <button class="control-btn" id="disconnectBtn" title="Disconnect" style="display: none;">
                                <i class="fas fa-unlink"></i>
                            </button>
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
        this.connectBtn = document.getElementById('connectBtn');
        this.disconnectBtn = document.getElementById('disconnectBtn');
        this.statusIndicator = document.getElementById('statusIndicator');
        this.statusText = document.getElementById('statusText');
        this.notificationBadge = document.getElementById('notificationBadge');
    }

    bindEvents() {
        // Toggle chatbox
        this.button.addEventListener('click', () => this.toggleChatbox());
        this.minimizeBtn.addEventListener('click', () => this.toggleChatbox());

        // Connection controls
        this.connectBtn.addEventListener('click', () => this.connectToOllama());
        this.disconnectBtn.addEventListener('click', () => this.disconnectFromOllama());

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

    async sendMessage() {
        const message = this.input.value.trim();
        if (!message) return;
        
        if (!this.isConnected) {
            this.addMessage("Please connect to the AI assistant first by clicking the connect button.", false);
            return;
        }
        
        // Add user message
        this.addMessage(message, true);
        this.input.value = '';
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            const response = await fetch('/api/ollama/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message })
            });
            
            const data = await response.json();
            
            this.hideTypingIndicator();
            
            if (data.success) {
                this.addMessage(data.response, false);
            } else {
                this.addMessage(`Error: ${data.message}`, false);
                if (data.message.includes('Not connected')) {
                    this.updateConnectionStatus(false);
                }
            }
        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage(`Connection error: ${error.message}`, false);
        }
    }

    async connectToOllama() {
        if (this.isConnecting) return;
        
        this.isConnecting = true;
        this.updateConnectionStatus(false, 'Connecting...');
        this.addMessage('Connecting to AI assistant...', false);
        
        try {
            const response = await fetch('/api/ollama/connect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                this.isConnected = true;
                this.updateConnectionStatus(true);
                this.addMessage(data.message, false);
                this.addMessage('Hello! I\'m your AI StudyHub assistant. How can I help you today?', false);
            } else {
                this.updateConnectionStatus(false);
                this.addMessage(`Connection failed: ${data.message}`, false);
            }
        } catch (error) {
            this.updateConnectionStatus(false);
            this.addMessage(`Connection error: ${error.message}`, false);
        } finally {
            this.isConnecting = false;
        }
    }

    async disconnectFromOllama() {
        try {
            const response = await fetch('/api/ollama/disconnect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            
            const data = await response.json();
            this.isConnected = false;
            this.updateConnectionStatus(false);
            this.addMessage(data.message, false);
        } catch (error) {
            this.addMessage(`Disconnect error: ${error.message}`, false);
        }
    }

    updateConnectionStatus(connected, customText = null) {
        this.isConnected = connected;
        
        if (connected) {
            this.statusIndicator.className = 'status-indicator connected';
            this.statusText.textContent = customText || 'Connected';
            this.connectBtn.style.display = 'none';
            this.disconnectBtn.style.display = 'inline-block';
            this.input.disabled = false;
            this.sendBtn.disabled = false;
        } else {
            this.statusIndicator.className = 'status-indicator disconnected';
            this.statusText.textContent = customText || 'Disconnected';
            this.connectBtn.style.display = 'inline-block';
            this.disconnectBtn.style.display = 'none';
            this.input.disabled = true;
            this.sendBtn.disabled = true;
        }
    }

    async checkConnectionStatus() {
        try {
            const response = await fetch('/api/ollama/status');
            const data = await response.json();
            
            if (data.connected) {
                this.isConnected = true;
                this.updateConnectionStatus(true);
            } else {
                this.isConnected = false;
                this.updateConnectionStatus(false);
            }
        } catch (error) {
            console.error('Status check failed:', error);
            this.updateConnectionStatus(false);
        }
    }

    addWelcomeMessage() {
        setTimeout(() => {
            this.addMessage("👋 Welcome to AI StudyHub! Click the connect button to start chatting with your AI assistant.");
            if (!this.isExpanded) {
                this.showNotification();
            }
            // Check connection status on load
            this.checkConnectionStatus();
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