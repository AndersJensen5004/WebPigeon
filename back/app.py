from flask import Flask, request, jsonify
from flask_cors import CORS
from pymongo import MongoClient
from bson import ObjectId
import bcrypt
from datetime import datetime, timezone
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


    # Check if username already exists
    if users_collection.find_one({"username": username}):
        return jsonify({"error": "Username already exists"}), 400

    # Hash
    hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

    # Create new user document
    new_user = {
        "username": username,
        "password": hashed_password,
        "created_at": datetime.now(timezone.utc),
        "profile_photo": None,  # Default to None, can be updated later
        "last_online": datetime.now(timezone.utc)  # Set initial last online time
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
        return jsonify({
            "message": "Login successful",
            "username": username,
            # You might want to include other non-sensitive user data here
        }), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 4011
    
    
    
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
            "created_at": user['created_at'].isoformat()
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

if __name__ == '__main__':
    app.run(debug=True)