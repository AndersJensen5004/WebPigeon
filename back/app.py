from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
import uuid
from datetime import datetime, timezone
from typing import List
import re

app = Flask(__name__)
CORS(app)

# Connect to DB
uri = "mongodb+srv://jensenandersp:0UFn0sgkw7Qctlf6@users.u1rsd2u.mongodb.net/?appName=Users"
client = MongoClient(uri)
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
        # Fetch the creator's username
        creator = users_collection.find_one({'_id': messenger['creator_id']})
        creator_username = creator['username'] if creator else 'Unknown'
        
        messenger['creator_username'] = creator_username
        messenger['_id'] = str(messenger['_id'])
        
        # Get the specific collection for this messenger
        messenger_collection = messenger_data[id]
        
        # Fetch messages (you might want to limit this or implement pagination)
        messages = list(messenger_collection.find().sort("timestamp", 1))
        
        # Get unique usernames from messages
        unique_usernames = set(message['username'] for message in messages)
        
        # Fetch user data for all unique users at once
        users = {user['username']: user.get('profile_photo') 
                 for user in users_collection.find({'username': {'$in': list(unique_usernames)}})}
        
        for message in messages:
            message['_id'] = str(message['_id'])
            message['profile_photo'] = users.get(message['username'])
        
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
    sender_id = data.get('user_id')
    
    # Update last_online for the sender
    if sender_id:
        users_collection.update_one(
            {"_id": sender_id},
            {"$set": {"last_online": datetime.now(timezone.utc)}}
        )
    
    result = messenger_collection.insert_one(data)
    return jsonify({'id': str(result.inserted_id)}), 201

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

if __name__ == '__main__':
    app.run(debug=True)