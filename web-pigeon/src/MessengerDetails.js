import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from './AuthContext';
import axios from 'axios';

const MessengerDetails = () => {

    const { id } = useParams();
    const [messenger, setMessenger] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

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

    const handleDelete = async () => {
        try {
            await axios.delete(`http://localhost:5000/messengers/${id}`);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleAddMessage = async (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to send a message');
            return;
        }
        try {
            await axios.post(`http://localhost:5000/messengers/${id}/messages`, {
                content: newMessage,
                username: user.username,
                timestamp: new Date().toISOString()
            });
            const response = await axios.get(`http://localhost:5000/messengers/${id}`);
            setMessenger(response.data);
            setNewMessage('');
        } catch (err) {
            setError(err.message);
        }
    };

    return ( 
        <div className="messenger-details retro-window">
            <div className="window-title-bar">
                <span className="window-title">{messenger ? messenger.title : 'Messenger'}</span>
                <button className="window-close-btn">X</button>
            </div>
            { isPending && <div className="loading">Loading...</div> }
            { error && <div className="error">{ error }</div> }
            { messenger && (
                <div className="retro-layout">
                    <div className="sidebar">
                        <h2>Messenger Info</h2>
                        <p>Creator: {messenger.creator}</p>
                        <div className="messenger-body">{messenger.body}</div>
                        {user && user.username === messenger.creator && (
                            <button onClick={handleDelete} className="delete-btn">Delete Messenger</button>
                        )}
                    </div>
                    <div className="chat-area">
                        <div className="messages">
                            {messenger.messages && messenger.messages.map(message => (
                                <div key={message._id} className="message">
                                    <div className="message-header">
                                        <span className="username">{message.username}</span>
                                        <span className="timestamp">{new Date(message.timestamp).toLocaleString()}</span>
                                    </div>
                                    <p className="message-content">{message.content}</p>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleAddMessage} className="message-form">
                            <textarea 
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                required
                            ></textarea>
                            <button type="submit">Send</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
 
export default MessengerDetails;    