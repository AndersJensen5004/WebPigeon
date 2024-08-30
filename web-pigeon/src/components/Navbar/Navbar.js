import React, { useContext, useState } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import { getLatestVersion } from '../Changelog/versionInfo.js';
import pigeonLogo from "../../assets/images/pigeon-logo.png";
import letterLogo from "../../assets/images/letter-logo.png";
import world from "../../assets/images/world.png";
import directoryAdminTools from "../../assets/images/directory_admin_tools.png";
import "./Navbar.css";


const Navbar = () => {

    const { currentUser: user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const latestVersion = getLatestVersion();
    const [isMenuOpen, setIsMenuOpen] = useState(false);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };


    return (
        <>
        <div className="header">
            <img src={letterLogo} alt="Letter P" />
            <h4>version {latestVersion}</h4>
            <span className="username"><h4>{user ? user.username : ''}</h4></span>
        </div>
        <nav className="navbar">    
            <img src={pigeonLogo} alt="Web Pigeon Logo"/>
            <h1>Web Pigeon</h1>
            <div className="links">
                <Link className="link home retro-button" to="/">
                    <img src={world} alt="world" />
                    <span><span className="underline">H</span>ome</span>
                </Link>
                <Link className="link retro-button" to="/search"><span className="underline">F</span>ind</Link>
                <Link className="link retro-button" to="/create"><span className="underline">C</span>reate</Link>
                {user ? (
                    <button className="link retro-button" onClick={handleLogout}><span className="underline">L</span>ogout</button>
                ) : (
                    <Link className="link retro-button" to="/login"><span className="underline">L</span>ogin</Link>
                )}
            </div>
        </nav>
        <div className="footer">
                <div className="menu-container">
                    <button className="menu-button retro-button" onClick={toggleMenu}>
                        <img src={directoryAdminTools} alt="Menu" />
                        Menu
                    </button>
                    {isMenuOpen && (
                        <div className="menu-dropdown">
                            <Link to="/">Home</Link>
                            <Link to="/search">Find</Link>
                            <Link to="/create">Create</Link>
                            <Link to="/about">About</Link>
                            {user && <Link to={`/profile/${user.username}`}>Profile</Link>}
                            <Link to="/changeLog">Change Log</Link>
                            {user ? (
                                <button onClick={handleLogout}>Logout</button>
                            ) : (
                                <Link to="/login">Login</Link>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
 
export default Navbar;