import {Link} from 'react-router-dom';
import pigeonLogo from "./pigeon-logo.png";
import letterLogo from "./letter-logo.png";
import world from "./world.png";


const Navbar = () => {
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
                <Link to="/" class="home">
                    <img src={world} alt="world" />
                    <p className="underline">H</p>
                    <p>ome</p>
                </Link>
                <Link to="/search">Find</Link>
                <Link to="/create" >Create</Link>
                <Link to="/login" >Login</Link>
            </div>
        </nav>
        </>
    );
}
 
export default Navbar;