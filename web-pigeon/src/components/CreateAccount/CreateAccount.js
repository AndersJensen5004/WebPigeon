import React, { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import config from '../../config';
import axios from "axios";
import checkmark from "../../assets/images/checkmark.png";
import restrictmark from "../../assets/images/restrictmark.png";
import Loading from '../Loading/Loading.js';
import ReCAPTCHA from "react-google-recaptcha";


const CreateAccount = () => {

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmedPassword, setConfirmedPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [captchaToken, setCaptchaToken] = useState(null);
    const recaptchaRef = useRef();

    const navigate = useNavigate();

    const isUsernameValid = useMemo(() => {
        return /^[a-zA-Z0-9_]+$/.test(username);
    }, [username]);

    useEffect(() => {
        // Load the reCAPTCHA script
        const script = document.createElement("script");
        script.src = "https://www.google.com/recaptcha/api.js";
        script.async = true;
        script.defer = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    const handleCaptchaChange = (token) => {
        setCaptchaToken(token);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        if (!isUsernameValid) {
            setError("Username can only contain letters, numbers, and underscores");
            return;
        }

        if (password !== confirmedPassword) {
            setError("Passwords do not match...");
            return;
        }

        if (!captchaToken) {
            setError("Please complete the CAPTCHA");
            return;
        }

        try {
            const response = await axios.post(`${config.apiBaseUrl}/create_account`, {
                username,
                password,
                captchaToken
            });
            console.log(response.data);

            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred');
            recaptchaRef.current.reset();
            setCaptchaToken(null);
        } finally {
            setIsLoading(false);
        }
    };

    const isFormValid = username !== '' && 
                        isUsernameValid && 
                        password !== '' && 
                        password === confirmedPassword &&
                        captchaToken !== null;

    return (
        <div className="login">
            <h2>Create An Account!</h2>
            {error && <h3 className="error">{error}</h3>}
            <form onSubmit={handleSubmit}>
            <label>Username:</label>
                <input
                    type = "username"
                    required
                    value = {username}
                    onChange = {(e) => setUsername(e.target.value)}
                    pattern = "^[a-zA-Z0-9_]+$"
                    title = "Username can only contain letters, numbers, and underscores"
                />
            <label>Password:</label>
                <input
                    type = "password"
                    required
                    value = {password}
                    onChange = {(e) => setPassword(e.target.value)}
                />
            <label>Confirm Password:</label>
                <input
                    type = "password"
                    required
                    value = {confirmedPassword}
                    onChange = {(e) => setConfirmedPassword(e.target.value)}
                />
            <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey="6LeCpjgqAAAAAO8bNR2d2ceopr7kQun7xGecdgQG"
                    onChange={handleCaptchaChange}
            />
            {isLoading ? <Loading /> :
            <button className="retro-button" disabled={isLoading || !isFormValid}>
                Create Account
                <img src={isFormValid ? checkmark : restrictmark} alt="status mark" />
                </button>  
            }     
            </form>
        </div>
    );
}
 
export default CreateAccount;