import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import "./EditProfile.css";

const EditProfile = () => {
    const { username } = useParams();
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    if (currentUser.username !== username) {
        return <div className="error">You don't have permission to edit this profile</div>;
    }


    return (
        <div className="edit-profile-container">
            <div className="title-bar">
                <div className="title-bar-text">Edit Profile</div>
            </div>
            <div className="edit-profile-options">
                <Link to={`/profile/${username}/edit/username`} className="edit-button">
                    Change Username
                </Link>
                <Link to={`/profile/${username}/edit/password`} className="edit-button">
                    Change Password
                </Link>
                <Link to={`/profile/${username}/edit/photo`} className="edit-button">
                    Change Profile Picture
                </Link>
            </div>
        </div>
    );
};

export default EditProfile;