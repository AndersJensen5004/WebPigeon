import { Link } from "react-router-dom"
import "./NotFound.css";

const NotFound = () => {
    return (  
        <div className="not-found">
            <h1>404</h1>
            <h2>Sorry...</h2>
            <p>That page cannot be found</p>
            <Link to='/'>Back to home</Link>
        </div>
    );
}
 
export default NotFound;