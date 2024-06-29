import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';
import axios from "axios";
import checkmark from "./checkmark.png";
import restrictmark from "./restrictmark.png";

const Login = () => {

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[error, setError] = useState('');

    const navigate = useNavigate();
    const { login } = useContext(AuthContext);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await axios.post('http://localhost:5000/login', {
                username,
                password
            });
            login(response.data);
            console.log(response.data);
            navigate('/');
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="login">
            <h2>Welcome!</h2>
            <span>
                <h3>If you haven't already...</h3>
                <button onClick={()=> {navigate('/createaccount')}}>Create Account</button>
            </span>
            {error && <p className="error">{error}</p>}    
            <form onSubmit={handleSubmit}>
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