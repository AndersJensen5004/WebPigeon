import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import axios from 'axios';
import "./MessengerDetails.css";

const MessengerDetails = () => {

    const { id } = useParams();
    const [messenger, setMessenger] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const MAX_CHARACTERS = 1000;

    useEffect(() => {
        const fetchMessenger = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/messengers/${id}`);
                setMessenger(response.data);
                setIsPending(false);
            } catch (err) {
                setError(err.message);
                setIsPending(false);
            }
        };
        fetchMessenger();
    }, [id]);

    const handleDeleteClick = () => {
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            await axios.delete(`http://localhost:5000/messengers/${id}`);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    const handleAddMessage = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to send a message');
            return;
        }
        if (newMessage.length > MAX_CHARACTERS) {
            setError(`Message exceeds ${MAX_CHARACTERS} character limit`);
            return;
        }
        setIsSending(true);
        try {
            await axios.post(`http://localhost:5000/messengers/${id}/messages`, {
                content: newMessage,
                username: user.username,
                timestamp: new Date().toISOString()
            });
            const response = await axios.get(`http://localhost:5000/messengers/${id}`);
            setMessenger(response.data);
            setNewMessage('');
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSending(false);
        }
    };

    const toggleDescription = () => {
        setShowDescription(!showDescription);
    };

    return ( 
        <div className="messenger-details terminal-interface">
            { isPending && <div className="loading">Loading...</div> }
            { error && <div className="error">{ error }</div> }
            { messenger && (
                <>
                    <div className="terminal-header">
                        <div>
                            <h2>MESSENGER: {messenger.title}</h2>
                            <p>CREATOR: {messenger.creator}</p>
                            <button onClick={toggleDescription} className="description-toggle">
                                {showDescription ? "HIDE DESCRIPTION" : "SHOW DESCRIPTION"}
                            </button>
                            {showDescription && (
                                <div className="description">
                                    <p>{messenger.description}</p>
                                </div>
                            )}
                        </div>
                        {user && user.username === messenger.creator && (
                            <button onClick={handleDeleteClick} className="delete-btn">DELETE</button>
                        )}
                    </div>
                    <div className="terminal-body">
                        <div className="messages">
                            {messenger.messages && messenger.messages.map(message => (
                                <div key={message._id} className="message">
                                    <span className="timestamp">[{new Date(message.timestamp).toLocaleString()}]</span>
                                    <span className="username">{message.username}:</span>
                                    <span className="message-content">{message.content}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="terminal-footer">
                        <form onSubmit={handleAddMessage} className="message-form">
                            <span className="prompt">&gt;</span>
                            <input 
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message..."
                                maxLength={MAX_CHARACTERS}
                                disabled={isSending}
                                required
                            />
                            <button type="submit" disabled={isSending}>
                                {isSending ? 'Sending...' : 'SEND'}
                            </button>
                        </form>
                        <div className="character-count">
                            {newMessage.length}/{MAX_CHARACTERS}
                        </div>
                    </div>
                </>
            )}
            {showDeleteConfirm && (
                <div className="confirm-delete">
                    <p>Are you sure you want to delete this messenger?</p>
                    <button onClick={handleDeleteConfirm}>Yes, delete</button>
                    <button onClick={handleDeleteCancel}>Cancel</button>
                </div>
            )}
        </div>
    );
}
 
export default MessengerDetails;    