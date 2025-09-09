# Ollama SSH Configuration
# Update these settings according to your SSH server and Ollama setup

# SSH Connection Settings
SSH_HOST = "localhost"  # SSH server hostname or IP
SSH_PORT = 22          # SSH server port
SSH_USERNAME = "user"  # SSH username
SSH_PASSWORD = ""      # SSH password (leave empty to use key-based auth)

# Ollama Settings
OLLAMA_HOST = "localhost"  # Ollama server host (on remote machine)
OLLAMA_PORT = 11434       # Ollama server port
DEFAULT_MODEL = "llama3.2"  # Default model to use

# Local Settings
LOCAL_TUNNEL_PORT = 11435  # Local port for SSH tunnel

# Connection Timeout
CONNECTION_TIMEOUT = 10  # seconds

# Chat Settings
CHAT_TIMEOUT = 30  # seconds for chat responses
MAX_MESSAGE_LENGTH = 1000  # characters