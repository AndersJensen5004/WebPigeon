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
        "created_at": datetime.now(timezone.utc)
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
        # return a JWT token
        return jsonify({"message": "Login successful", "username": username}), 200
    else:
        return jsonify({"error": "Invalid username or password"}), 401

if __name__ == '__main__':
    app.run(debug=True)