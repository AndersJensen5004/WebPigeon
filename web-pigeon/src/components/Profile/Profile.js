import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import "./Profile.css";

const Profile = () => {
    const { username } = useParams();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/profile/${username}`);
                setProfile(response.data);
            } catch (err) {
                setError(err.response?.data?.error || 'An error occurred');
            }
        };

        fetchProfile();
    }, [username]);

    if (error) {
        return <div className="profile-error">{error}</div>;
    }

    if (!profile) {
        return <div className="profile-loading">Loading...</div>;
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-photo">
                    {profile.profile_photo ? (
                        <img src={profile.profile_photo} alt={`${username}'s profile`} />
                    ) : (
                        <div className="default-photo">
                            {username.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <h1 className="profile-username">{username}</h1>
            </div>
            <div className="profile-info">
                <p>Last online: {new Date(profile.last_online).toLocaleString()}</p>
                <p>Member since: {new Date(profile.created_at).toLocaleDateString()}</p>
                {profile.previous_usernames && profile.previous_usernames.length > 0 && (
                    <div className="previous-usernames">
                        <h3>Previously known as:</h3>
                        <ul>
                            {profile.previous_usernames.map((prev, index) => (
                                <li key={index}>
                                    {prev.username} (changed on {new Date(prev.changed_at).toLocaleDateString()})
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
            {currentUser && currentUser.username === username && (
                <Link to={`/profile/${username}/edit`} className="edit-profile-button">
                    Edit Profile
                </Link>
            )}
        </div>
    );
}

export default Profile;