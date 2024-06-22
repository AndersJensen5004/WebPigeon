import {Link} from 'react-router-dom';
import pigeonLogo from "./pigeon-logo.png";
import letterLogo from "./letter-logo.png";

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
                <Link to="/">Home</Link>
                <Link to="/search">Find</Link>
                <Link to="/create" >Create</Link>
                <Link to="/login" >Login</Link>
            </div>
        </nav>
        </>
    );
}
 
export default Navbar;