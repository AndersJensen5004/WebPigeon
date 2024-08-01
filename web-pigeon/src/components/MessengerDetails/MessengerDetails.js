import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { AuthContext } from '../../contexts/AuthContext';
import config from '../../config';
import axios from 'axios';
import io from 'socket.io-client';
import defaultProfilePicture from "../../assets/images//default-profile.png";
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
    const { currentUser: user } = useContext(AuthContext);

    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    const MAX_CHARACTERS = 1000;

    useEffect(() => {
        const fetchMessenger = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/messengers/${id}`);
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
            await axios.delete(`${config.apiBaseUrl}/messengers/${id}`);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
    };

    useEffect(() => {
        const newSocket = io(config.apiBaseUrl);
        setSocket(newSocket);

        return () => newSocket.close();
    }, []);

    useEffect(() => {
        if (socket && messenger) {
            socket.emit('join', { messenger_id: id });

            socket.on('message', (message) => {
                setMessenger(prevState => ({
                    ...prevState,
                    messages: [...prevState.messages, message]
                }));
            });

            return () => {
                socket.emit('leave', { messenger_id: id });
                socket.off('message');
            };
        }
    }, [socket, messenger, id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messenger?.messages]);

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
            socket.emit('new_message', {
                messenger_id: id,
                content: newMessage,
                username: user.username
            });
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
                            <p>CREATOR: {messenger.creator_username}</p>
                            <button onClick={toggleDescription} className="description-toggle">
                                {showDescription ? "HIDE DESCRIPTION" : "SHOW DESCRIPTION"}
                            </button>
                            {showDescription && (
                                <div className="description">
                                    <p>{messenger.description}</p>
                                </div>
                            )}
                        </div>
                        {user && user.id === messenger.creator_id && (
                            <button onClick={handleDeleteClick} className="delete-btn">DELETE</button>
                        )}
                    </div>
                    <div className="terminal-body">
                        <div className="messages">
                            {messenger.messages && messenger.messages.map(message => (
                                <div key={message._id} className="message">
                                        <img 
                                            src={message.profile_photo || defaultProfilePicture} 
                                            alt={`${message.username}'s profile`} 
                                            className="profile-pic"
                                        />
                                    <div className="message-content">
                                        <div className="message-header">
                                            <Link to={`/profile/${message.username}`} className="username">{message.username}</Link>
                                            <span className="timestamp">[{new Date(message.timestamp).toLocaleString()}]</span>
                                        </div>
                                        <span className="message-text">{message.content}</span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
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