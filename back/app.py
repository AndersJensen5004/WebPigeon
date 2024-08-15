import os
from collections import defaultdict

import eventlet
eventlet.monkey_patch()

from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_socketio import ConnectionRefusedError
from pymongo import MongoClient
from bson import ObjectId
import json
from typing import Dict, Set
import re
import bcrypt
import uuid
from datetime import datetime, timezone
from config import ProductionConfig, DevelopmentConfig

app = Flask(__name__)
config_class = ProductionConfig if os.environ.get('FLASK_ENV') == 'production' else DevelopmentConfig
app.config.from_object(config_class)

# Setup CORS
CORS(app, resources={r"/*": {"origins": app.config['CORS_ORIGINS']}})

# Setup Socket.IO
socketio = SocketIO(app, cors_allowed_origins=app.config['SOCKETIO_CORS_ORIGINS'], async_mode='eventlet')
active_connections: Dict[str, Set[str]] = {}
user_rooms: Dict[str, Set[str]] = {}
connected_users = defaultdict(dict)



# Setup MongoDB connection
client = MongoClient(app.config['MONGODB_URI'])
db = client['web-pigeon']
users_collection = db['users']
messengers_collection = db['messengers']
messenger_data = client['messenger-data']
@app.route('/create_account', methods=['POST'])
def create_account():
    data = request.json
    username = data['username']
    password = data['password']
    
    # Check if username is valid 
    if not re.match(r'^[a-zA-Z0-9_]+$', username):
        return jsonify({"error": "Username can only contain letters, numbers, and underscores"}), 400

    # Convert username to lowercase for case-insensitive comparison
    lowercase_username = username.lower()

    # Check if username already exists (case-insensitive)
    if users_collection.find_one({"username_lower": lowercase_username}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash password
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    
    # Generate a new UUID
    user_id = str(uuid.uuid4())

    # Check if the generated UUID already exists
    while users_collection.find_one({"_id": user_id}):
        user_id = str(uuid.uuid4())
        
    
    # Create new user document
    new_user = {
        "_id": user_id,
        "username": username,
        "username_lower": lowercase_username,  # Store lowercase version for searching
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "profile_photo": None,  # Default to None, can be updated later
        "last_online": datetime.now(timezone.utc),  # Set initial last online time
        "previous_usernames": []
    }

    # Insert the new user into the database
    result = users_collection.insert_one(new_user)

    return jsonify({"message": "Account created successfully", "id": str(result.inserted_id)}), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data['username']
    password = data['password']

    user = users_collection.find_one({"username_lower": username.lower()})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        users_collection.update_one(
            {"_id": user['_id']},
            {"$set": {"last_online": datetime.now(timezone.utc)}}
        )
        return jsonify({
            "message": "Login successful",
            "user_id": user['_id'],
            "username": user['username'],
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401
    
    
    
#####################################
# Messengers
#####################################
messengers_collection = db['messengers']
messages_collection = db['messages']

@app.route('/messengers', methods=['GET'])
def get_messengers():
    messengers = list(messengers_collection.find())

    creator_ids = list(set(messenger['creator_id'] for messenger in messengers))

    users = {str(user['_id']): user['username'] for user in users_collection.find({'_id': {'$in': creator_ids}})}

    for messenger in messengers:
        messenger['_id'] = str(messenger['_id'])
        creator_id = str(messenger['creator_id'])
        messenger['creator_username'] = users.get(creator_id, 'Unknown')

    return jsonify(messengers)


@app.route('/messengers/<id>', methods=['GET'])
def get_messenger(id):
    messenger = messengers_collection.find_one({'_id': id})
    if messenger:
        creator = users_collection.find_one({'_id': messenger['creator_id']})
        creator_username = creator['username'] if creator else 'Unknown'

        messenger['creator_username'] = creator_username
        messenger['_id'] = str(messenger['_id'])

        # Fetch only the last 50 messages
        messenger_collection = messenger_data[id]
        messages = list(messenger_collection.find().sort("timestamp", -1).limit(50))
        messages.reverse()  # Reverse to get chronological order

        for message in messages:
            user = users_collection.find_one({'_id': message['sender_id']})
            message['_id'] = str(message['_id'])
            message['username'] = user['username'] if user else None
            message['profile_photo'] = user['profile_photo']

        messenger['messages'] = messages
        return jsonify(messenger)
    return jsonify({'error': 'Messenger not found'}), 404

@app.route('/messengers', methods=['POST'])
def create_messenger():
    data = request.json
    creator_id = data['creator_id']
    
    # Check if the user exists
    user = users_collection.find_one({"_id": creator_id})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    new_messenger = {
        "_id": str(uuid.uuid4()),
        "title": data['title'],
        "description": data['description'],
        "creator_id": creator_id,
        "created_at": datetime.now(timezone.utc)
    }
    
    # Insert the new messenger into the database
    result = messengers_collection.insert_one(new_messenger)
    
    return jsonify({"message": "Messenger created successfully", "id": str(result.inserted_id)}), 201

@app.route('/messengers/<id>/messages', methods=['POST'])
def add_message(id):
    data = request.json
    data['timestamp'] = datetime.now(timezone.utc)
    
    # Get the specific collection for this messenger
    messenger_collection = messenger_data[id]
    
    # Assuming the message data includes the user_id of the sender
    sender_id = data.get('sender_id')
    
    # Update last_online for the sender
    if sender_id:
        users_collection.update_one(
            {"_id": sender_id},
            {"$set": {"last_online": datetime.now(timezone.utc)}}
        )
    
    result = messenger_collection.insert_one(data)
    return jsonify({'id': str(result.inserted_id)}), 201


@app.route('/messengers/<id>/messages', methods=['GET'])
def get_latest_messages(id):
    messenger_collection = messenger_data[id]
    messages = list(messenger_collection.find().sort("timestamp", -1).limit(50))  # Get last 50 messages
    messages.reverse()  # Reverse to get chronological order

    for message in messages:
        message['_id'] = str(message['_id'])
        message['timestamp'] = message['timestamp'].isoformat()
        user = users_collection.find_one({'_id': message['sender_id']})
        message['username'] = user['username'] if user else None
        message['profile_photo'] = user['profile_photo'] if user else None

    return jsonify(messages)

@app.route('/messengers/<id>', methods=['DELETE'])
def delete_messenger(id):
    messengers_collection.delete_one({'_id': id})
    
    # Drop the entire collection for this messenger
    messenger_data.drop_collection(id)
    
    return '', 204

###################################
# Profile
###################################
@app.route('/profile/<username>', methods=['GET'])
def get_profile(username):
    user = users_collection.find_one({"username_lower": username.lower()})
    if user:
        return jsonify({
            "user_id": user['_id'],
            "username": user['username'],
            "profile_photo": user['profile_photo'],
            "last_online": user['last_online'].isoformat(),
            "created_at": user['created_at'].isoformat(),
            "previous_usernames": user.get('previous_usernames', [])
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/profile/<username>/edit', methods=['PUT'])
def edit_profile(username):
    data = request.json
    user = users_collection.find_one({"username_lower": username.lower()})
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    updates = {}
    
    if 'new_username' in data:
        new_username = data['new_username']
        if users_collection.find_one({"username_lower": new_username.lower()}):
            return jsonify({"error": "Username already exists"}), 400
        
        # Add the old username to previous_usernames
        previous_usernames = user.get('previous_usernames', [])
        previous_usernames.append({
            "username": user['username'],
            "changed_at": datetime.now(timezone.utc)
        })
        
        updates['username'] = new_username
        updates['username_lower'] = new_username.lower()
        updates['previous_usernames'] = previous_usernames

    if 'new_password' in data:
        hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
        updates['password'] = hashed_password

    if 'profile_photo' in data:
        updates['profile_photo'] = data['profile_photo']

    if updates:
        users_collection.update_one({"_id": user['_id']}, {"$set": updates})
        return jsonify({"message": "Profile updated successfully", "user_id": user['_id']}), 200
    else:
        return jsonify({"message": "No changes made", "user_id": user['_id']}), 200


#######################################
# Websockets
#######################################
# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    sid = request.sid
    user_id = request.args.get('userId')
    if user_id:
        active_connections[user_id] = sid
        user_rooms[user_id] = set()
        print(f'User {user_id} connected with socket {sid}')
        emit('connect_response', {'status': 'connected'})
    else:
        raise ConnectionRefusedError('Authentication failed')


@socketio.on('join')
def on_join(data):
    user_id = get_user_id_from_sid(request.sid)
    room = data['messenger_id']
    join_room(room)
    user_rooms[user_id].add(room)

    user = users_collection.find_one({"_id": user_id})
    username = user['username']

    connected_users[room][user_id] = username
    print(f"User {username} joined room: {room}")

    emit('user_joined', {'user_id': user_id, 'username': username}, room=room)
    emit('connected_users', {'users': list(connected_users[room].values())}, room=room)


@socketio.on('leave')
def on_leave(data):
    user_id = get_user_id_from_sid(request.sid)
    room = data['messenger_id']
    leave_room(room)
    user_rooms[user_id].discard(room)

    username = connected_users[room].pop(user_id, None)  # Remove user and get username
    print(f"User {username} left room: {room}")

    emit('user_left', {'user_id': user_id, 'username': username}, room=room)
    emit('connected_users', {'users': list(connected_users[room].values())}, room=room)


@socketio.on('disconnect')
def handle_disconnect():
    sid = request.sid
    user_id = next((uid for uid, s in active_connections.items() if s == sid), None)
    if user_id:
        del active_connections[user_id]
        rooms = user_rooms.pop(user_id, set())
        for room in rooms:
            leave_room(room)
            username = connected_users[room].pop(user_id, None)
            emit('user_left', {'user_id': user_id, 'username': username}, room=room)
            emit('connected_users', {'users': list(connected_users[room].values())}, room=room)
        print(f'User {user_id} disconnected')


@socketio.on('new_message')
def handle_new_message(data):
    user_id = get_user_id_from_sid(request.sid)
    room = data['messenger_id']

    if room not in user_rooms.get(user_id, set()):
        return {'status': 'error', 'message': 'Not connected to this messenger'}

    try:
        print('Received new message:', data)
        messenger_collection = messenger_data[room]
        message_data = {
            'content': data['content'],
            'sender_id': user_id,
            'timestamp': datetime.now(timezone.utc)
        }
        result = messenger_collection.insert_one(message_data)

        user = users_collection.find_one({'_id': user_id})

        emit_data = {
            'id': str(result.inserted_id),
            'content': message_data['content'],
            'sender_id': user_id,
            'timestamp': message_data['timestamp'].isoformat(),
            'username': user['username'] if user else None,
            'profile_photo': user['profile_photo'] if user else None
        }

        emit('message', emit_data, room=room)

        return {'status': 'success'}
    except Exception as e:
        print(f"Error handling new message: {str(e)}")
        return {'status': 'error', 'message': 'Server error occurred'}


def get_user_id_from_sid(sid):
    return next((uid for uid, s in active_connections.items() if s == sid), None)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
    