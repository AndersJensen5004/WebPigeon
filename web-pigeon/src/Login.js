import { useState } from "react";
import { useNavigate } from "react-router-dom";
import checkmark from "./checkmark.png";
import restrictmark from "./restrictmark.png";

const Login = () => {

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');

    const navigate = useNavigate();

    return (
        <div className="login">
            <h2>Welcome!</h2>
            <form>
            <label>Username:</label>
                <input
                    type = "username"
                    required
                    value = {username}
                    onChange = {(e) => setUsername(e.target.value)}
                />
            <label>Password:</label>
                <input
                    type = "password"
                    required
                    value = {password}
                    onChange = {(e) => setPassword(e.target.value)}
                />
            <button>
                Login
                <img src={username !== '' && password !== '' ? checkmark : restrictmark} alt="status mark" />
            </button>    
            </form>
        </div>
    );
}
 
export default Login;