# AI StudyHub

A modern library management system with integrated AI chatbot powered by Ollama via SSH tunneling (no API required).

## 🚀 Features

- **📚 Library Management** - Browse, borrow, and manage books, e-books, and internal materials
- **🏢 Room Booking** - Reserve study rooms, special facilities, and equipment  
- **🤖 AI Assistant** - Real-time chat with LLM models via SSH tunneling (no external API)
- **💡 Smart Recommendations** - AI-powered book and resource suggestions
- **📊 User Dashboard** - Track bookings, borrowed items, and academic progress

## 📋 Prerequisites

- Python 3.8+
- SSH access to a server running Ollama
- Ollama installed on the remote server
- No external API keys required - uses direct SSH tunneling

## ⚡ Quick Start

### 1. Installation
```bash
git clone <repository-url>
cd MmducmehLiba-2
pip install -r requirements.txt
```

### 2. Configure SSH Tunnel to Ollama
Edit `ollama_config.py`:
```python
SSH_HOST = "your-server-ip"
SSH_USERNAME = "your-username"  
SSH_PASSWORD = "your-password"  # Or use SSH keys (recommended)
DEFAULT_MODEL = "llama3.2"
LOCAL_TUNNEL_PORT = 11435  # Local port for SSH tunnel
```

### 3. Setup Ollama (Remote Server)
```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Start service
ollama serve

# Pull model
ollama pull llama3.2
```

### 4. Run Application
```bash
python app.py
```
Visit `http://localhost:5000` to access the web interface.

## 🔧 Configuration

### SSH Authentication (Recommended)
```bash
# Generate SSH key
ssh-keygen -t rsa -b 4096

# Copy to server
ssh-copy-id username@server-ip

# Leave SSH_PASSWORD empty in config
```

### Available Models
- `llama3.2:1b` - Fast, basic responses
- `llama3.2:3b` - Balanced performance  
- `llama3.2:8b` - Best quality, slower

## 📚 Library Hub Features

### Digital Library Management
**Comprehensive Resource Catalog**
- **Physical Books**: Browse extensive collection with detailed metadata (author, publisher, ISBN, location)
- **E-Books**: Access digital library with instant availability
- **Internal Materials**: Institution-specific resources, research papers, and course materials
- **Advanced Search**: Filter by subject, level, author, publication year, and availability

**Smart Borrowing System**
- **Real-time Availability**: Live tracking of book copies and due dates
- **Reservation Queue**: Reserve unavailable books with automatic notifications
- **Renewal Management**: Extend borrowing periods with conflict detection
- **Favorites System**: Personal reading lists and wishlist management
- **Borrowing History**: Track past loans and reading patterns

### Facility & Resource Booking
**Study Spaces**
- **Individual Study Rooms**: Quiet spaces for focused work
- **Group Study Areas**: Collaborative spaces with whiteboards and projectors
- **Special Facilities**: Computer labs, multimedia rooms, and research stations
- **Equipment Checkout**: Laptops, tablets, cameras, and other academic tools

**Workshop & Events**
- **Academic Workshops**: Skill-building sessions and training programs
- **Research Seminars**: Guest lectures and academic presentations
- **Study Groups**: Peer learning and collaborative sessions
- **Registration Management**: Easy signup with capacity tracking

### AI-Powered Intelligence
**Personalized Recommendations**
- **Reading Suggestions**: AI analyzes borrowing history and preferences
- **Academic Support**: Subject-specific resource recommendations
- **Research Assistance**: Help finding relevant materials for projects
- **Study Planning**: Optimal resource scheduling based on deadlines

**Smart Search & Discovery**
- **Natural Language Queries**: Ask questions in plain English
- **Cross-Reference Suggestions**: Find related books and materials
- **Citation Assistance**: Help with academic referencing
- **Research Guidance**: Navigate complex academic topics

## 🛠️ Troubleshooting

### SSH Tunnel Issues
**SSH Connection Failed**: Check credentials and server accessibility
```bash
ssh username@hostname  # Test direct SSH connection
```

**Ollama Not Accessible via Tunnel**: Verify Ollama service is running on remote server
```bash
# On remote server:
ollama serve
ollama list  # Check available models
```

**Tunnel Timeout**: Increase `CONNECTION_TIMEOUT` in config or check network connectivity

**Port Conflicts**: Change `LOCAL_TUNNEL_PORT` if port 11435 is in use

### Performance Tips
- Use smaller models for faster responses
- Enable GPU acceleration if available
- Adjust timeout settings for complex queries

## 🏗️ Project Structure
```
MmducmehLiba-2/
├── app.py              # Main Flask application
├── ollama_client.py    # SSH Ollama client
├── ollama_config.py    # Configuration
├── static/             # CSS, JS files
├── templates/          # HTML templates
└── data/              # JSON data storage
```

## 🔒 Security

- **SSH Key Authentication**: Use key-based auth instead of passwords
- **Restrict SSH Access**: Limit access by IP addresses
- **Firewall Configuration**: Secure Ollama port on remote server
- **No API Exposure**: All LLM communication via encrypted SSH tunnel
- **Regular Updates**: Keep dependencies and Ollama updated
- **Monitor Logs**: Track SSH connections and application usage

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

1. Check troubleshooting section
2. Verify Ollama and SSH setup  
3. Review application logs
4. Create issue with error details