from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
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

    # Create new user document
    new_user = {
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

    user = users_collection.find_one({"username": username})
    if user and bcrypt.checkpw(password.encode('utf-8'), user['password']):
        # Update last_online timestamp
        users_collection.update_one(
            {"username": username},
            {"$set": {"last_online": datetime.now(timezone.utc)}}
        )
        return jsonify({
            "message": "Login successful",
            "username": username,
            # You might want to include other non-sensitive user data here
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
    for messenger in messengers:
        messenger['_id'] = str(messenger['_id'])
    return jsonify(messengers)

@app.route('/messengers/<id>', methods=['GET'])
def get_messenger(id):
    messenger = messengers_collection.find_one({'_id': ObjectId(id)})
    if messenger:
        messenger['_id'] = str(messenger['_id'])
        messages = list(messages_collection.find({'messenger_id': id}))
        for message in messages:
            message['_id'] = str(message['_id'])
        messenger['messages'] = messages
        return jsonify(messenger)
    return jsonify({'error': 'Messenger not found'}), 404

@app.route('/messengers', methods=['POST'])
def create_messenger():
    data = request.json
    result = messengers_collection.insert_one(data)
    return jsonify({'id': str(result.inserted_id)}), 201

@app.route('/messengers/<id>/messages', methods=['POST'])
def add_message(id):
    data = request.json
    data['messenger_id'] = id
    
    # Assuming the message data includes the username of the sender
    sender_username = data.get('username')
    
    # Update last_online for the sender
    if sender_username:
        users_collection.update_one(
            {"username": sender_username},
            {"$set": {"last_online": datetime.now(timezone.utc)}}
        )
    
    result = messages_collection.insert_one(data)
    return jsonify({'id': str(result.inserted_id)}), 201

@app.route('/messengers/<id>', methods=['DELETE'])
def delete_messenger(id):
    messengers_collection.delete_one({'_id': ObjectId(id)})
    messages_collection.delete_many({'messenger_id': id})
    return '', 204

###################################
# Profile
###################################
@app.route('/profile/<username>', methods=['GET'])
def get_profile(username):
    user = users_collection.find_one({"username": username})
    if user:
        return jsonify({
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
    user = users_collection.find_one({"username": username})
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    updates = {}
    
    if 'new_username' in data:
        new_username = data['new_username']
        if users_collection.find_one({"username": new_username}):
            return jsonify({"error": "Username already exists"}), 400
        
        # Add the old username to previous_usernames
        previous_usernames = user.get('previous_usernames', [])
        previous_usernames.append({
            "username": user['username'],
            "changed_at": datetime.now(timezone.utc)
        })
        
        updates['username'] = new_username
        updates['previous_usernames'] = previous_usernames

    if 'new_password' in data:
        hashed_password = bcrypt.hashpw(data['new_password'].encode('utf-8'), bcrypt.gensalt())
        updates['password'] = hashed_password

    if 'profile_photo' in data:
        updates['profile_photo'] = data['profile_photo']

    if updates:
        users_collection.update_one({"_id": user['_id']}, {"$set": updates})
        return jsonify({"message": "Profile updated successfully"}), 200
    else:
        return jsonify({"message": "No changes made"}), 200

if __name__ == '__main__':
    app.run(debug=True)