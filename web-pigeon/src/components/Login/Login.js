import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import Loading from '../Loading/Loading.js';
import config from '../../config';
import axios from "axios";
import checkmark from "../../assets/images/checkmark.png";
import restrictmark from "../../assets/images/restrictmark.png";
import logo from "../../assets/images/logo512.png";
import "./Login.css";

const Login = () => {

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);


    const navigate = useNavigate();
    const { login } = useContext(AuthContext);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);


        try {
            const response = await axios.post(`${config.apiBaseUrl}/login`, {
                username,
                password
            });
            
            if (response.data && response.data.user_id && response.data.username) {
                login({
                    id: response.data.user_id,
                    username: response.data.username,
                });
                navigate('/');
            } else {
                throw new Error('Invalid response from server');
            }
        } catch (error) {
            setError(error.response?.data?.error || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login">
            <img src={logo} alt="WebPigeon logo" className="logo" />
            <h2>Welcome!</h2>
            <span>
                <h3>If you haven't already...</h3>
                <button className="retro-button" onClick={()=> {navigate('/createaccount')}}>Create Account</button>
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
            {isLoading ? <Loading /> :
            <button className="retro-button" disabled={isLoading || !username || !password}>
                Login
                <img src={username !== '' && password !== '' ? checkmark : restrictmark} alt="status mark" />
            </button>
            }    
            </form>
        </div>
    );
}
 
export default Login;