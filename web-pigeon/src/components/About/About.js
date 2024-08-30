import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="About">
            <h1>About Web Pigeon</h1>
            <div>
                <p>
                    Welcome to Web Pigeon, an anonymous web messaging platform, this is a free and public messaging platform.  There is no end to end encryption with messages, to remain anonymous one must secure their end points.
                </p>

                <p>
                    What makes Web Pigeon unique?
                </p>
                <ul>
                    <li>Public messengers - cryptology services can be illegal</li>
                    <li>No encryption - man in the middle attacks should not be your main concern</li>
                    <li>Self-regulating community - power to the users</li>
                    <li>Retro design - nostalgia meets functionality</li>
                </ul>

                <p>
                    As of now Web Pigeon is a proof of concept, it can scale given the popularity...
                </p>

                <p>
                    Use Web Pigeon wisely
                </p>
            </div>
        </div>
    );
}
 
export default About;