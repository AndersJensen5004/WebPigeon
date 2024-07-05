import React, { useContext } from 'react';
import { Link, useNavigate} from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import pigeonLogo from "../../assets/images/pigeon-logo.png";
import letterLogo from "../../assets/images/letter-logo.png";
import world from "../../assets/images/world.png";
import "./Navbar.css";


const Navbar = () => {

    const { currentUser: user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };


    return (
        <>
        <div className="header">
            <img src={letterLogo} alt="Letter P" />
            <h4>version 1.0</h4>
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
                    <Link className="link retro-button" to={`/profile/${user.username}`}><span className="underline">P</span>rofile</Link>
                ): null}
                {user ? (
                    <button className="link retro-button" onClick={handleLogout}><span className="underline">L</span>ogout</button>
                ) : (
                    <Link className="link retro-button" to="/login"><span className="underline">L</span>ogin</Link>
                )}
            </div>
        </nav>
        </>
    );
}
 
export default Navbar;