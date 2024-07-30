import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';
import axios from 'axios';
import "./CreateMessenger.css";

const Create = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { currentUser: user } = useContext(AuthContext);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!user) {
            setError("You must be logged in to create a messenger");
            return;
        }

        const messenger = {
            title,
            description,
            creator: user.username
        }

        setIsPending(true);

        try {
            await axios.post(`${config.apiBaseUrl}/messengers`, messenger);
            console.log('New messenger added');
            setIsPending(false);
            navigate('/');
        } catch (err) {
            setError(err.message);
            setIsPending(false);
        }
    }

    const handleClose = () => {
        navigate('/');
    }

    const validateForm = (e) => {
        e.preventDefault();
        let isValid = true;
        const inputs = e.target.querySelectorAll('input[required], textarea[required]');
        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.classList.add('invalid');
            } else {
                input.classList.remove('invalid');
            }
        });
        if (isValid) {
            handleSubmit(e);
        }
    };

    return (
        <div className="create-messenger">
            <div className="title-bar">
                <div className="title-bar-text">Create Messenger</div>
                <div className="title-bar-controls">
                    <button className="close-button" aria-label="Close" onClick={handleClose}></button>
                </div>
            </div>
            <div className="window-body">
                {error && <div className="error-box">{error}</div>}
                <form onSubmit={validateForm} noValidate>
                    <div className="field-row">
                        <label htmlFor="title">Messenger Title:</label>
                        <input
                            type="text"
                            id="title"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            maxLength={100}
                        />
                        <div className="char-count">{title.length} / 100</div>
                    </div>
                    <div className="field-row">
                        <label htmlFor="description">Messenger Description:</label>
                        <textarea
                            id="description"
                            required
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            maxLength={1000}
                        ></textarea>
                        <div className="char-count">{description.length} / 1000</div>
                    </div>
                    <div className="field-row">
                        <label>Creator:</label>
                        <span className="messenger-creator">{user ? user.username : 'Not logged in'}</span>
                    </div>
                    <div className="field-row">
                        <button type="submit" className="retro-button" disabled={isPending}>
                            {!isPending ? 'Add Messenger' : 'Loading...'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
 
export default Create;