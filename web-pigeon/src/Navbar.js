const Navbar = () => {
    return (
        <nav className="navbar">
            <h1>Web Pigeon</h1>
            <div className="links">
                <a href="/">Home</a>
                <a href="/create" style={{
                    backgroundColor: '#f1356d',
                    color: "white",
                    borderRadius: "8px"
                }}>Create Messenger</a>
            </div>
        </nav>
    );
}
 
export default Navbar;