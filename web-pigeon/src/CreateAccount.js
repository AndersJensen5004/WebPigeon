import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import checkmark from "./checkmark.png";
import restrictmark from "./restrictmark.png";

const CreateAccount = () => {

    const[username, setUsername] = useState('');
    const[password, setPassword] = useState('');
    const[confirmedPassword, setConfirmedPassword] = useState('');
    const[error, setError] = useState('');


    const navigate = useNavigate();

    const isUsernameValid = useMemo(() => {
        return /^[a-zA-Z0-9_]+$/.test(username);
    }, [username]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!isUsernameValid) {
            setError("Username can only contain letters, numbers, and underscores");
            return;
        }

        if (password !== confirmedPassword) {
            setError("Passwords do not match...");
            return;
        }

        try {
            const response = await axios.post('http://localhost:5000/create_account', {
                username,
                password
            });
            console.log(response.data);

            navigate('/login');
        } catch (error) {
            setError(error.response?.data?.error || 'An error occurred');
        }
    };

    const isFormValid = username !== '' && 
                        isUsernameValid && 
                        password !== '' && 
                        password === confirmedPassword;

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
            <button>
                Create Account
                <img src={isFormValid ? checkmark : restrictmark} alt="status mark" />
                </button>    
            </form>
        </div>
    );
}
 
export default CreateAccount;