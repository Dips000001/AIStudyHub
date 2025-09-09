import paramiko
import os
import re
import time
from typing import Dict, Any

# SSH Configuration with private key from temp/app_ssh_key.py
SSH_CONFIG = {
    'hostname': "gateway.cs.cityu.edu.hk",
    'username': "mavislong2",
    'private_key_path': "./pw/privatekey.txt",
    'passphrase': "mmducmeh"
}

class OllamaSSHClient:
    def __init__(self):
        self.ssh = None
        self.shell = None
        self.is_connected = False
        self.ollama_ready = False
        self.ssh_host = SSH_CONFIG['hostname']
        self.ollama_host = 'localhost'

    def connect(self) -> Dict[str, Any]:
        try:
            print("Connecting to SSH with private key...")
            self.ssh = paramiko.SSHClient()
            self.ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())

            private_key_path = os.path.expanduser(SSH_CONFIG['private_key_path'])
            passphrase = SSH_CONFIG.get('passphrase')

            if passphrase == "your_passphrase_here" or not passphrase:
                passphrase = None

            print(f"Loading private key from: {private_key_path}")
            
            private_key = None
            key_types = [
                (paramiko.RSAKey, "RSA"),
                (paramiko.Ed25519Key, "Ed25519"),
                (paramiko.ECDSAKey, "ECDSA")
            ]
            
            for key_class, key_type in key_types:
                try:
                    private_key = key_class.from_private_key_file(private_key_path, password=passphrase)
                    print(f"Successfully loaded {key_type} key")
                    break
                except Exception as e:
                    print(f"Failed to load as {key_type} key: {e}")
                    continue
            
            if not private_key:
                try:
                    print("Trying generic key loading...")
                    private_key = paramiko.RSAKey.from_private_key_file(private_key_path, password=passphrase)
                    print("Successfully loaded key with generic RSA loader")
                except Exception as e:
                    print(f"Generic key loading failed: {e}")
                    raise Exception(f"Could not load private key from {private_key_path}. Error: {e}")

            self.ssh.connect(
                hostname=SSH_CONFIG['hostname'],
                username=SSH_CONFIG['username'],
                pkey=private_key,
                timeout=15
            )

            print("SSH connection established with private key")
            self.shell = self.ssh.invoke_shell()
            self.shell.settimeout(2.0)
            time.sleep(2)
            self._clear_buffer()

            print("Starting ollama...")
            if self.shell:
                self.shell.send(b'ollama run llama3\n')

            if self._wait_for_ollama_ready():
                self.is_connected = True
                self.ollama_ready = True
                print("Ollama ready!")
                return {'success': True, 'message': 'Connected to ollama successfully using private key!'}
            else:
                print("Ollama failed to start")
                self.disconnect()
                return {'success': False, 'message': 'Ollama failed to start'}

        except Exception as e:
            print(f"Connection error: {e}")
            return {'success': False, 'message': f'Connection error: {e}'}

    def _clear_buffer(self):
        try:
            if self.shell:
                while self.shell.recv_ready():
                    self.shell.recv(1024)
        except:
            pass

    def _wait_for_ollama_ready(self, timeout=20):
        start_time = time.time()
        buffer = ""
        while time.time() - start_time < timeout:
            try:
                if self.shell and self.shell.recv_ready():
                    data = self.shell.recv(1024).decode('utf-8', errors='ignore')
                    buffer += data
                    if any(indicator in buffer.lower() for indicator in ['send a message', '>>>', 'use /? for help']):
                        return True
                    if any(error in buffer.lower() for error in ['error', 'failed', 'not found', 'connection refused']):
                        print(f"Ollama error detected: {buffer}")
                        return False
                else:
                    time.sleep(0.5)
            except Exception as e:
                print(f"Error waiting for ollama: {e}")
                return False
        print("Timeout waiting for ollama to be ready")
        return False

    def chat(self, message: str, model: str = None) -> Dict[str, Any]:
        if not self.is_connected or not self.shell or not self.ollama_ready:
            return {'success': False, 'message': 'Not connected to Ollama. Please connect first.'}
        try:
            print(f"Sending message: {message}")
            self._clear_buffer()
            if self.shell:
                self.shell.send((message + '\n').encode('utf-8'))
            response = self._collect_response(message)
            if response and isinstance(response, str) and "error" in response.lower():
                 return {'success': False, 'response': response}
            return {'success': True, 'response': response}
        except Exception as e:
            print(f"Error sending message: {e}")
            return {'success': False, 'message': f"Error sending message: {e}"}

    def _collect_response(self, original_message: str, timeout=45):
        start_time = time.time()
        buffer = ""
        last_activity = time.time()
        while time.time() - start_time < timeout:
            try:
                if self.shell and self.shell.recv_ready():
                    data = self.shell.recv(1024).decode('utf-8', errors='ignore')
                    buffer += data
                    last_activity = time.time()
                    if '>>> ' in data and 'Send a message' in data:
                        return self._clean_response(buffer, original_message)
                else:
                    if buffer.strip() and (time.time() - last_activity) > 3:
                        return self._clean_response(buffer, original_message)
                    time.sleep(0.2)
            except Exception as e:
                print(f"Error collecting response: {e}")
                break
        if buffer.strip():
            return self._clean_response(buffer, original_message)
        return "Timeout: No response received within time limit"

    def _clean_response(self, raw_response: str, original_message: str):
        # Clean ANSI escape codes
        ansi_escape = re.compile(r'\x1b\[[0-9;]*[mGKH]|\x1b\[\?[0-9]*[lh]|\r')
        text = ansi_escape.sub('', raw_response)

        # Normalize newlines
        text = text.replace('\r\n', '\n')
        prompt = original_message.replace('\r\n', '\n')

        # Remove the echoed prompt from the beginning
        if text.strip().startswith(prompt.strip()):
            text = text.strip()[len(prompt.strip()):]
        
        # Remove the trailing '>>> Send a message'
        end_marker = '>>> Send a message'
        if end_marker in text:
            text = text.split(end_marker)[0]
            
        # Also handle just '>>>'
        end_marker_2 = '>>>'
        if text.strip().endswith(end_marker_2):
             text = text.strip()[:-len(end_marker_2)]

        return text.strip()

    def disconnect(self) -> Dict[str, Any]:
        print("Disconnecting...")
        self.is_connected = False
        self.ollama_ready = False
        try:
            if self.shell:
                self.shell.send(b'/bye\n')
                time.sleep(1)
                self.shell.close()
            if self.ssh:
                self.ssh.close()
            return {'success': True, 'message': 'Disconnected successfully'}
        except Exception as e:
            print(f"Error during disconnect: {e}")
            return {'success': False, 'message': f'Error during disconnect: {e}'}

    def get_status(self) -> Dict[str, Any]:
        return {
            'connected': self.is_connected,
            'ssh_host': self.ssh_host,
            'ollama_host': self.ollama_host
        }

    def get_available_models(self) -> Dict[str, Any]:
        if not self.is_connected:
            return {'success': False, 'message': 'Not connected to Ollama'}
        return {'success': True, 'models': ['llama3']}

ollama_client = OllamaSSHClient()