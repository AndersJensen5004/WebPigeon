import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import "./EditProfile.css";

const EditProfile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { currentUser, setCurrentUser } = useAuth();
    const [newUsername, setNewUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newProfilePhoto, setNewProfilePhoto] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (currentUser.username !== username) {
            setError("You don't have permission to edit this profile");
            return;
        }

        try {
            const updates = {};
            if (newUsername) updates.new_username = newUsername;
            if (newPassword) updates.new_password = newPassword;
            if (newProfilePhoto) updates.profile_photo = newProfilePhoto;

            const response = await axios.put(`http://localhost:5000/profile/${username}/edit`, updates);
            
            if (response.data.message === "Profile updated successfully") {
                if (newUsername) {
                    setCurrentUser({ ...currentUser, username: newUsername });
                    navigate(`/profile/${newUsername}`);
                } else {
                    navigate(`/profile/${username}`);
                }
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while updating the profile');
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Edit Profile</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <div>
                    <label>New Username:</label>
                    <input 
                        type="text" 
                        value={newUsername} 
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                </div>
                <div>
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                </div>
                <div>
                    <label>New Profile Photo URL:</label>
                    <input 
                        type="text" 
                        value={newProfilePhoto} 
                        onChange={(e) => setNewProfilePhoto(e.target.value)}
                    />
                </div>
                <button type="submit">Update Profile</button>
            </form>
        </div>
    );
};

export default EditProfile;