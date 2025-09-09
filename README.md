# AI StudyHub with Ollama SSH Integration

A comprehensive library management system with an integrated AI chatbot powered by Ollama via SSH connection.

## Features

- **Library Management**: Browse, borrow, and manage books, e-books, and internal materials
- **Room Booking**: Reserve study rooms, special facilities, and equipment
- **AI Assistant**: Real-time chat with LLM models via SSH Ollama connection
- **Personalized Recommendations**: AI-powered book and resource suggestions
- **User Dashboard**: Track bookings, borrowed items, and academic progress

## Prerequisites

- Python 3.8+
- SSH access to a server running Ollama
- Ollama installed and running on the remote server

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MmducmehLiba-4
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Ollama SSH connection**
   
   Edit `ollama_config.py` with your SSH and Ollama settings:
   ```python
   # SSH Connection Settings
   SSH_HOST = "your-server-ip"      # Your SSH server
   SSH_PORT = 22                    # SSH port
   SSH_USERNAME = "your-username"   # SSH username
   SSH_PASSWORD = "your-password"   # SSH password (or use key-based auth)
   
   # Ollama Settings
   OLLAMA_HOST = "localhost"        # Ollama host on remote server
   OLLAMA_PORT = 11434             # Ollama port
   DEFAULT_MODEL = "llama3.2"      # Default model to use
   ```

## Ollama Setup

### On the Remote Server

1. **Install Ollama**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Start Ollama service**
   ```bash
   ollama serve
   ```

3. **Pull a model** (e.g., Llama 3.2)
   ```bash
   ollama pull llama3.2
   ```

4. **Verify installation**
   ```bash
   ollama list
   ```

### SSH Key Authentication (Recommended)

For better security, use SSH key authentication instead of passwords:

1. **Generate SSH key pair** (on local machine)
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your-email@example.com"
   ```

2. **Copy public key to remote server**
   ```bash
   ssh-copy-id username@your-server-ip
   ```

3. **Update config** - Leave `SSH_PASSWORD` empty in `ollama_config.py`

## Running the Application

1. **Start the Flask application**
   ```bash
   python app.py
   ```

2. **Access the web interface**
   - Open your browser and go to `http://localhost:5000`
   - Register a new account or login with existing credentials

3. **Using the AI Chatbot**
   - Click the chat icon in the bottom-right corner
   - Click "Connect" to establish SSH tunnel to Ollama
   - Start chatting with the AI assistant

## Configuration Options

### `ollama_config.py` Settings

| Setting | Description | Default |
|---------|-------------|---------|
| `SSH_HOST` | SSH server hostname/IP | "localhost" |
| `SSH_PORT` | SSH server port | 22 |
| `SSH_USERNAME` | SSH username | "user" |
| `SSH_PASSWORD` | SSH password | "" |
| `OLLAMA_HOST` | Ollama host on remote server | "localhost" |
| `OLLAMA_PORT` | Ollama port | 11434 |
| `DEFAULT_MODEL` | Default LLM model | "llama3.2" |
| `LOCAL_TUNNEL_PORT` | Local SSH tunnel port | 11435 |
| `CONNECTION_TIMEOUT` | SSH connection timeout | 10 seconds |
| `CHAT_TIMEOUT` | Chat response timeout | 30 seconds |

## API Endpoints

### Ollama Integration

- `POST /api/ollama/connect` - Connect to Ollama via SSH
- `POST /api/ollama/disconnect` - Disconnect from Ollama
- `POST /api/ollama/chat` - Send message to AI
- `GET /api/ollama/status` - Get connection status
- `GET /api/ollama/models` - List available models

### Library Management

- `GET /api/library_data` - Get library books and user data
- `POST /add_favorite` - Add/remove book from favorites
- `POST /borrow_book` - Borrow a book
- `POST /return_book` - Return a borrowed book
- `POST /reserve_book` - Reserve an unavailable book

### Booking System

- `POST /api/book-resource` - Book a resource
- `POST /api/get-available-slots` - Get available time slots
- `POST /api/register-workshop` - Register for workshop
- `POST /api/deregister-workshop` - Cancel workshop registration

## Troubleshooting

### Connection Issues

1. **SSH Connection Failed**
   - Verify SSH credentials in `ollama_config.py`
   - Check if SSH server is accessible: `ssh username@hostname`
   - Ensure SSH service is running on remote server

2. **Ollama Not Accessible**
   - Verify Ollama is running: `ollama serve`
   - Check if model is available: `ollama list`
   - Ensure Ollama is listening on correct port

3. **Timeout Errors**
   - Increase `CHAT_TIMEOUT` in config for complex queries
   - Check network connectivity between servers
   - Verify firewall settings

### Model Issues

1. **Model Not Found**
   ```bash
   # Pull the required model
   ollama pull llama3.2
   ```

2. **Slow Responses**
   - Use smaller models for faster responses
   - Increase server resources (RAM/CPU)
   - Adjust `CHAT_TIMEOUT` setting

### Performance Optimization

1. **Use GPU acceleration** (if available on remote server)
   ```bash
   # Install CUDA drivers and restart Ollama
   ollama serve
   ```

2. **Model Selection**
   - `llama3.2:1b` - Fastest, basic responses
   - `llama3.2:3b` - Balanced speed/quality
   - `llama3.2:8b` - Best quality, slower

## Security Considerations

1. **Use SSH key authentication** instead of passwords
2. **Restrict SSH access** to specific IP addresses
3. **Use firewall rules** to limit Ollama port access
4. **Regular updates** of dependencies and Ollama
5. **Monitor logs** for suspicious activities

## Development

### Project Structure

```
MmducmehLiba-4/
├── app.py                 # Main Flask application
├── ollama_client.py       # Ollama SSH client
├── ollama_config.py       # Configuration settings
├── requirements.txt       # Python dependencies
├── static/
│   ├── chatbox.js        # Chatbot frontend
│   ├── chatbox.css       # Chatbot styles
│   └── ...               # Other static files
├── templates/            # HTML templates
├── data/                # JSON data files
└── README.md            # This file
```

### Adding New Features

1. **Custom Models**: Update `DEFAULT_MODEL` in config
2. **Additional Endpoints**: Add routes in `app.py`
3. **UI Modifications**: Update templates and static files
4. **Database Integration**: Replace JSON files with database

## License

This project is licensed under the MIT License.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Verify Ollama and SSH setup
3. Review application logs
4. Create an issue with detailed error information