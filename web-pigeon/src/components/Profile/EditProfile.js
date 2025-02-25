import React from 'react';
import { useParams, Link} from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import "./EditProfile.css";

const EditProfile = () => {
    const { username } = useParams();
    const { currentUser } = useAuth();

    if (currentUser.username !== username) {
        return <div className="error">You don't have permission to edit this profile</div>;
    }


    return (
        <div className="edit-profile-container">
            <div className="title-bar">
                <div className="title-bar-text">Edit Profile</div>
            </div>
            <div className="edit-profile-options">
                <Link to={`/profile/${username}/edit/username`} className="edit-button retro-button">
                    Change Username
                </Link>
                <Link to={`/profile/${username}/edit/password`} className="edit-button retro-button">
                    Change Password
                </Link>
                <Link to={`/profile/${username}/edit/photo`} className="edit-button retro-button">
                    Change Profile Picture
                </Link>
            </div>
        </div>
    );
};

export default EditProfile;