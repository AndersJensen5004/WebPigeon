import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "./EditProfile.css";

const EditProfilePhoto = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newProfilePhoto, setNewProfilePhoto] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.put(`http://localhost:5000/profile/${username}/edit`, {
                current_password: currentPassword,
                profile_photo: newProfilePhoto
            });
            
            if (response.data.message === "Profile updated successfully") {
                navigate(`/profile/${username}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while updating the profile photo');
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Change Profile Picture</h2>
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
                    <label>New Profile Photo URL:</label>
                    <input 
                        type="text" 
                        value={newProfilePhoto} 
                        onChange={(e) => setNewProfilePhoto(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Update Profile Picture</button>
            </form>
        </div>
    );
};

export default EditProfilePhoto;