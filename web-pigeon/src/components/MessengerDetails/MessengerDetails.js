import { useState, useEffect, useContext, useRef, useCallback } from "react";
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
    const [messages, setMessages] = useState([]);
    const [error, setError] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showDescription, setShowDescription] = useState(false);
    const navigate = useNavigate();
    const { currentUser: user } = useContext(AuthContext);

    const messagesEndRef = useRef(null);

    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const socketRef = useRef(null);

    const MAX_CHARACTERS = 1000;

    const fetchMessenger = useCallback(async () => {
        try {
            const response = await axios.get(`${config.apiBaseUrl}/messengers/${id}`);
            setMessenger(response.data);
            setMessages(response.data.messages || []);
            setIsPending(false);
        } catch (err) {
            setError(err.message);
            setIsPending(false);
        }
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
        fetchMessenger();

        const newSocket = io(config.apiBaseUrl, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });

        newSocket.on('connect', () => {
            console.log('Connected to Socket.IO server');
            setIsConnected(true);
            setIsReconnecting(false);
            newSocket.emit('join', { messenger_id: id });
        });

        newSocket.on('disconnect', () => {
            console.log('Disconnected from Socket.IO server');
            setIsConnected(false);
            setIsReconnecting(true);
        });

        newSocket.on('reconnecting', (attemptNumber) => {
            console.log(`Reconnecting attempt ${attemptNumber}`);
            setIsReconnecting(true);
        });

        newSocket.on('message', (message) => {
            setMessages(prevMessages => [...prevMessages, message]);
        });

        socketRef.current = newSocket;

        return () => {
            newSocket.emit('leave', { messenger_id: id });
            newSocket.disconnect();
        };
    }, [id, fetchMessenger]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAddMessage = (e) => {
        e.preventDefault();
        if (!user) {
            setError('You must be logged in to send a message');
            return;
        }
        if (!isConnected) {
            setError('You are currently disconnected. Please wait for reconnection.');
            return;
        }
        if (newMessage.length > MAX_CHARACTERS) {
            setError(`Message exceeds ${MAX_CHARACTERS} character limit`);
            return;
        }
        setIsSending(true);
        socketRef.current.emit('new_message', {
            messenger_id: id,
            sender_id: user.id,
            content: newMessage
            //username: user.username
        });
        setNewMessage('');
        setIsSending(false);
    };

    const toggleDescription = () => {
        setShowDescription(!showDescription);
    };

    return ( 
        <div className="messenger-details terminal-interface">
            {isReconnecting && (
                <div className="reconnecting-message">
                    Reconnecting to server...
                </div>
            )}
            { isPending && <div className="loading">Loading...</div> }
            { error && <div className="error">{ error }</div> }
            { messenger && (
                <>
                    <div className="terminal-header">
                        <div>
                            <h2>MESSENGER: {messenger.title}</h2>
                            <p>CREATOR:  
                                <Link to={`/profile/${messenger.creator_username}`}>{messenger.creator_username}</Link>
                            </p>
                        </div>
                        <div>
                            <button onClick={toggleDescription} className="description-toggle">
                                {showDescription ? "HIDE DESCRIPTION" : "SHOW DESCRIPTION"}
                            </button>
                            {user && user.id === messenger.creator_id && (
                                <button onClick={handleDeleteClick} className="delete-btn">DELETE</button>
                            )}
                            {showDescription && (
                                <div className="description">
                                    <p>{messenger.description}</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="terminal-body">
                        <div className="messages">  
                            {messenger && messages && messages.map(message => (
                                <div key={message._id || message.id} className="message">
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
                                disabled={isSending || !isConnected}
                                required
                            />
                            <button type="submit" disabled={isSending || !isConnected}>
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