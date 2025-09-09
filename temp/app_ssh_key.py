from flask import Flask, render_template, request, jsonify, session
import paramiko
import time
import threading
import uuid
from queue import Queue, Empty
import re
import os
from pathlib import Path

app = Flask(__name__)
app.secret_key = 'your-secret-key-change-this'

# SSH Configuration with private key
SSH_CONFIG = {
    'hostname': "gateway.cs.cityu.edu.hk",
    'username': "mavislong2", 
    'private_key_path': "temp/privatekey.txt",  # Path to your private key file
    'passphrase': "mmducmeh"   # Passphrase for the private key (can be None if no passphrase)
}

# Store active SSH connections
active_connections = {}

class OllamaSSHClient:
    def __init__(self, session_id):
        self.session_id = session_id
        self.ssh = None
        self.shell = None
        self.connected = False
        self.ollama_ready = False
        
    def connect(self):
        try:
            print(f"[{self.session_id}] Connecting to SSH with private key...")
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
            
            # Load private key
            private_key_path = os.path.expanduser(SSH_CONFIG['private_key_path'])
            passphrase = SSH_CONFIG.get('passphrase')
            
            # Handle empty passphrase
            if passphrase == "your_passphrase_here" or not passphrase:
                passphrase = None
            
            print(f"[{self.session_id}] Loading private key from: {private_key_path}")
            
            # Try different key types (removed deprecated DSSKey)
            private_key = None
            key_types = [
                (paramiko.RSAKey, "RSA"),
                (paramiko.Ed25519Key, "Ed25519"),
                (paramiko.ECDSAKey, "ECDSA")
            ]
            
            for key_class, key_type in key_types:
                try:
                    private_key = key_class.from_private_key_file(private_key_path, password=passphrase)
                    print(f"[{self.session_id}] Successfully loaded {key_type} key")
                    break
                except Exception as e:
                    print(f"[{self.session_id}] Failed to load as {key_type} key: {e}")
                    continue
            
            # If specific key types failed, try generic key loading
            if not private_key:
                try:
                    print(f"[{self.session_id}] Trying generic key loading...")
                    private_key = paramiko.RSAKey.from_private_key_file(private_key_path, password=passphrase)
                    print(f"[{self.session_id}] Successfully loaded key with generic RSA loader")
                except Exception as e:
                    print(f"[{self.session_id}] Generic key loading failed: {e}")
                    raise Exception(f"Could not load private key from {private_key_path}. Error: {e}")
            
            # Connect using private key
            self.ssh.connect(
                hostname=SSH_CONFIG['hostname'],
                username=SSH_CONFIG['username'],
                pkey=private_key,
                timeout=15
            )
            
            print(f"[{self.session_id}] SSH connection established with private key")
            
            # Create interactive shell
            self.shell = self.ssh.invoke_shell()
            self.shell.settimeout(2.0)
            
            # Wait for shell to be ready
            time.sleep(2)
            
            # Clear initial output
            self._clear_buffer()
            
            print(f"[{self.session_id}] Starting ollama...")
            # Start ollama
            self.shell.send(b'ollama run llama3\n')
            
            # Wait for ollama to start and check if it's ready
            if self._wait_for_ollama_ready():
                self.connected = True
                self.ollama_ready = True
                print(f"[{self.session_id}] Ollama ready!")
                return True
            else:
                print(f"[{self.session_id}] Ollama failed to start")
                return False
            
        except Exception as e:
            print(f"[{self.session_id}] Connection error: {e}")
            return False
    
    def _clear_buffer(self):
        """Clear any pending output from shell"""
        try:
            while self.shell.recv_ready():
                self.shell.recv(1024)
        except:
            pass
    
    def _wait_for_ollama_ready(self, timeout=20):
        """Wait for ollama to be ready to receive messages"""
        start_time = time.time()
        buffer = ""
        
        while time.time() - start_time < timeout:
            try:
                if self.shell.recv_ready():
                    data = self.shell.recv(1024).decode('utf-8', errors='ignore')
                    buffer += data
                    
                    # Check for ollama ready indicators
                    if any(indicator in buffer.lower() for indicator in [
                        'send a message', '>>>', 'use /? for help'
                    ]):
                        return True
                        
                    # Check for errors
                    if any(error in buffer.lower() for error in [
                        'error', 'failed', 'not found', 'connection refused'
                    ]):
                        print(f"[{self.session_id}] Ollama error detected: {buffer}")
                        return False
                        
                else:
                    time.sleep(0.5)
            except Exception as e:
                print(f"[{self.session_id}] Error waiting for ollama: {e}")
                return False
        
        print(f"[{self.session_id}] Timeout waiting for ollama to be ready")
        return False
    
    def send_message(self, message):
        """Send message to ollama and get response"""
        if not self.connected or not self.shell or not self.ollama_ready:
            return "Error: Not connected to ollama"
        
        try:
            print(f"[{self.session_id}] Sending message: {message}")
            
            # Clear buffer before sending
            self._clear_buffer()
            
            # Send message
            self.shell.send((message + '\n').encode('utf-8'))
            
            # Wait for and collect response
            response = self._collect_response()
            
            return response if response else "No response received from ollama"
            
        except Exception as e:
            print(f"[{self.session_id}] Error sending message: {e}")
            return f"Error sending message: {e}"
    
    def _collect_response(self, timeout=45):
        """Collect response from ollama"""
        start_time = time.time()
        buffer = ""
        last_activity = time.time()
        
        while time.time() - start_time < timeout:
            try:
                if self.shell.recv_ready():
                    data = self.shell.recv(1024).decode('utf-8', errors='ignore')
                    buffer += data
                    last_activity = time.time()
                    
                    # Check if response is complete - look for the prompt return
                    if '>>> ' in data and 'Send a message' in data:
                        # Clean and return response
                        cleaned_response = self._clean_response(buffer)
                        return cleaned_response
                        
                else:
                    # If no activity for 3 seconds after we have some content, consider it complete
                    if buffer.strip() and (time.time() - last_activity) > 3:
                        cleaned_response = self._clean_response(buffer)
                        return cleaned_response
                    
                    time.sleep(0.2)
                    
            except Exception as e:
                print(f"[{self.session_id}] Error collecting response: {e}")
                break
        
        # Timeout - return whatever we have
        if buffer.strip():
            return self._clean_response(buffer)
        else:
            return "Timeout: No response received within time limit"
    
    def _clean_response(self, raw_response):
        """Clean up the raw response from ollama by removing ANSI escape sequences"""
        
        # Remove ANSI escape sequences
        ansi_escape = re.compile(r'\x1b\[[0-9;]*[mGKH]|\x1b\[\?[0-9]*[lh]|\r')
        cleaned = ansi_escape.sub('', raw_response)
        
        # Split into lines and process
        lines = cleaned.split('\n')
        content_lines = []
        
        # Skip the echoed command and collect actual response
        found_content = False
        for line in lines:
            line = line.strip()
            
            # Skip empty lines at the start
            if not found_content and not line:
                continue
                
            # Skip the echoed command (usually the first non-empty line)
            if not found_content and line:
                found_content = True
                continue
            
            # Stop at ollama prompt
            if '>>>' in line or 'Send a message' in line:
                break
                
            # Add content lines
            if line:
                content_lines.append(line)
        
        # Join the content
        result = '\n'.join(content_lines).strip()
        
        # If we still don't have content, try a different approach
        if not result:
            # Just remove escape sequences and prompts, keep everything else
            simple_clean = ansi_escape.sub('', raw_response)
            simple_clean = re.sub(r'>>>[^\n]*', '', simple_clean)
            simple_clean = re.sub(r'Send a message[^\n]*', '', simple_clean)
            simple_clean = '\n'.join([line.strip() for line in simple_clean.split('\n') if line.strip()])
            
            if simple_clean:
                return simple_clean
        
        return result if result else "I received your message but had trouble formatting the response. Please try again."
    
    def disconnect(self):
        """Close SSH connection"""
        print(f"[{self.session_id}] Disconnecting...")
        self.connected = False
        self.ollama_ready = False
        try:
            if self.shell:
                self.shell.send(b'/bye\n')
                time.sleep(1)
            if self.ssh:
                self.ssh.close()
        except Exception as e:
            print(f"[{self.session_id}] Error during disconnect: {e}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/connect', methods=['POST'])
def connect():
    """Initialize SSH connection to ollama"""
    session_id = str(uuid.uuid4())
    session['session_id'] = session_id
    
    client = OllamaSSHClient(session_id)
    if client.connect():
        active_connections[session_id] = client
        return jsonify({'success': True, 'message': 'Connected to ollama successfully using private key!'})
    else:
        return jsonify({'success': False, 'message': 'Failed to connect to ollama. Check private key path and passphrase.'})

@app.route('/chat', methods=['POST'])
def chat():
    """Send message to ollama and get response"""
    data = request.get_json()
    message = data.get('message', '').strip()
    
    if not message:
        return jsonify({'success': False, 'message': 'Empty message'})
    
    session_id = session.get('session_id')
    if not session_id or session_id not in active_connections:
        return jsonify({'success': False, 'message': 'Not connected. Please connect first.'})
    
    client = active_connections[session_id]
    response = client.send_message(message)
    
    return jsonify({'success': True, 'response': response})

@app.route('/disconnect', methods=['POST'])
def disconnect():
    """Disconnect from ollama"""
    session_id = session.get('session_id')
    if session_id and session_id in active_connections:
        client = active_connections[session_id]
        client.disconnect()
        del active_connections[session_id]
    
    return jsonify({'success': True, 'message': 'Disconnected successfully'})

@app.route('/status')
def status():
    """Check connection status"""
    session_id = session.get('session_id')
    connected = session_id and session_id in active_connections
    return jsonify({'connected': connected})

@app.route('/config')
def config():
    """Show current SSH configuration (without sensitive data)"""
    config_info = {
        'hostname': SSH_CONFIG['hostname'],
        'username': SSH_CONFIG['username'],
        'private_key_path': SSH_CONFIG['private_key_path'],
        'has_passphrase': bool(SSH_CONFIG.get('passphrase') and SSH_CONFIG['passphrase'] != "your_passphrase_here")
    }
    return jsonify(config_info)

if __name__ == '__main__':
    print("=== SSH Private Key Configuration ===")
    print(f"Hostname: {SSH_CONFIG['hostname']}")
    print(f"Username: {SSH_CONFIG['username']}")
    print(f"Private Key Path: {SSH_CONFIG['private_key_path']}")
    print(f"Passphrase: {'Set' if SSH_CONFIG.get('passphrase') and SSH_CONFIG['passphrase'] != 'your_passphrase_here' else 'Not set'}")
    print("=====================================")
    

    app.run(debug=True, host='0.0.0.0', port=5002)
