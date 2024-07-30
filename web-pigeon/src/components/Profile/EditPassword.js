import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import config from '../../config';
import axios from 'axios';
import "./EditProfile.css";

const EditPassword = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmNewPassword, setConfirmNewPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmNewPassword) {
            setError('New passwords do not match');
            return;
        }

        try {
            const response = await axios.put(`${config.apiBaseUrl}/profile/${username}/edit`, {
                current_password: currentPassword,
                new_password: newPassword
            });
            
            if (response.data.message === "Profile updated successfully") {
                navigate(`/profile/${username}`);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'An error occurred while updating the password');
        }
    };

    return (
        <div className="edit-profile-container">
            <h2>Change Password</h2>
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
                    <label>New Password:</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Confirm New Password:</label>
                    <input 
                        type="password" 
                        value={confirmNewPassword} 
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        required
                    />
                </div>
                <button className="retro-button" type="submit">Update Password</button>
            </form>
        </div>
    );
};

export default EditPassword;