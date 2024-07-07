import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import "./EditProfile.css";

const EditUsername = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newUsername, setNewUsername] = useState('');
    const [confirmNewUsername, setConfirmNewUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newUsername !== confirmNewUsername) {
            setError('New usernames do not match');
            return;
        }

        try {
            const response = await axios.put(`http://localhost:5000/profile/${username}/edit`, {
                current_password: currentPassword,
                new_username: newUsername
            });
            
            if (response.data.message === "Profile updated successfully") {
                setCurrentUser({ ...currentUser, username: newUsername });
                navigate(`/profile/${newUsername}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while updating the username');
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Change Username</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Current Password:</label>
                    <input 
                        type="password" 
                        value={currentPassword} 
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>New Username:</label>
                    <input 
                        type="text" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm New Username:</label>
                    <input 
                        type="text" 
                        value={confirmNewUsername} 
                        onChange={(e) => setConfirmNewUsername(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Update Username</button>
            </form>
        </div>
    );
};

export default EditUsername;