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
        <div className="messenger-details">
        { isPending && <div>Loading...</div> }
        { error && <div>{ error }</div> }
        { messenger && (
            <article>
                <h2>{messenger.title}</h2>
                <p>Creator: {messenger.creator}</p>
                <div>{messenger.body}</div>
                <h3>Messages:</h3>
                {messenger.messages && messenger.messages.map(message => (
                    <div key={message._id} className="message">
                        <p>{message.content}</p>
                        <small>{message.username} - {new Date(message.timestamp).toLocaleString()}</small>
                    </div>
                ))}
                <form onSubmit={handleAddMessage}>
                    <textarea 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        required
                    ></textarea>
                    <button type="submit">Send Message</button>
                </form>
                {user && user.username === messenger.creator && (
                    <button onClick={handleDelete}>Delete Messenger</button>
                )}
            </article>
        )}
    </div>
    );
}
 
export default MessengerDetails;    