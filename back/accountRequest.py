from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import secrets
import time

app = Flask(__name__)
CORS(app)

users = {}
magic_links = {}

@app.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username in users:
        return jsonify({'success': False, 'message': 'Username already exists'})
    
    hashed_password = generate_password_hash(password)
    users[username] = {'password': hashed_password}
    
    return jsonify({'success': True, 'message': 'User registered successfully'})

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    
    if username not in users:
        return jsonify({'success': False, 'message': 'User not found'})
    
    if check_password_hash(users[username]['password'], password):
        return jsonify({'success': True, 'message': 'Login successful'})
    else:
        return jsonify({'success': False, 'message': 'Incorrect password'})

@app.route('/request_magic_link', methods=['POST'])
def request_magic_link():
    data = request.json
    username = data.get('username')
    
    if username not in users:
        return jsonify({'success': False, 'message': 'User not found'})
    
    token = secrets.token_urlsafe(32)
    expiration = time.time() + 3600 
    magic_links[token] = {'username': username, 'expiration': expiration}
    
    magic_link = f"http://localhost:3000/magic-login/{token}"
    
    return jsonify({'success': True, 'magic_link': magic_link})

@app.route('/verify_magic_link', methods=['POST'])
def verify_magic_link():
    data = request.json
    token = data.get('token')
    
    if token not in magic_links:
        return jsonify({'success': False, 'message': 'Invalid or expired link'})
    
    link_data = magic_links[token]
    if time.time() > link_data['expiration']:
        del magic_links[token]
        return jsonify({'success': False, 'message': 'Link expired'})
    
    username = link_data['username']
    del magic_links[token]
    
    return jsonify({'success': True, 'message': 'Magic link login successful', 'username': username})

if __name__ == '__main__':
    app.run(debug=True)