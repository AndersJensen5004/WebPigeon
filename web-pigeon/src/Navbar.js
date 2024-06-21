import {Link} from 'react-router-dom';

const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>Web Pigeon</h1>
            <div className="links">
                <Link to="/">Home</Link>
                <Link to="/create" >Create Messenger</Link>
            </div>
        </nav>
    );
}
 
export default Navbar;