import { useState } from 'react';
import {Link} from 'react-router-dom';
import pigeonLogo from "./pigeon-logo.png";
import letterLogo from "./letter-logo.png";
import world from "./world.png";


const Navbar = () => {

    const [username, setUsername] = useState('');

    return (
        <>
        <div className="header">
            <img src={letterLogo} alt="Letter P" />
            version 1.0
        </div>
        <nav className="navbar">    
            <img src={pigeonLogo} alt="Web Pigeon Logo"/>
            <h1>Web Pigeon</h1>
            <div className="links">
                <Link to="/" className="home">
                    <img src={world} alt="world" />
                    <span><span className="underline">H</span>ome</span>
                </Link>
                <Link to="/search"><span className="underline">F</span>ind</Link>
                <Link to="/create"><span className="underline">C</span>reate</Link>
                <Link to="/login"><span className="underline">L</span>ogin</Link>
            </div>
        </nav>
        </>
    );
}
 
export default Navbar;