import React, { useState, useEffect } from 'react';
import './Loading.css';

const Loading = () => {
    const [showStartupMessage, setShowStartupMessage] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowStartupMessage(true);
        }, 5000); // Show startup message after 5 seconds

        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="loading">
            <div className="loading-box">
                <div className="loading-text">Loading...</div>
                <div className="loading-bar">
                    <div className="loading-bar-progress"></div>
                </div>
            </div>
            {showStartupMessage && (
                <div className="startup-message">
                    Note: If the server is starting up, this could take up to 60 seconds.
                </div>
            )}
        </div>
    );
};

export default Loading;