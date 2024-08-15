import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { joinMessenger, leaveMessenger, sendMessage } from '../../socketManager';
import { useAuth } from '../../contexts/AuthContext';
import config from '../../config';
import axios from 'axios';
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
    const [isConnected, setIsConnected] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const navigate = useNavigate();

    const { currentUser: user, socket } = useAuth();


    const messagesEndRef = useRef(null);


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

    useEffect(() => {
        fetchMessenger();
    }, [fetchMessenger]);

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
        if (!user) {
            navigate('/login');
            return;
        }

        if (socket) {
            setIsConnected(socket.connected);

            socket.on('connect', () => {
                console.log('Socket connected');
                setIsConnected(true);
                setIsReconnecting(false);
                joinMessenger(id);
            });
            
            socket.on('disconnect', () => {
                console.log('Socket disconnected');
                setIsConnected(false);
            });
            
            socket.on('reconnecting', () => {
                console.log('Socket reconnecting');
                setIsReconnecting(true);
            });
            
            socket.on('reconnect', () => {
                console.log('Socket reconnected');
                setIsConnected(true);
                setIsReconnecting(false);
                joinMessenger(id);
            });

            socket.on('message', (message) => {
                setMessages(prevMessages => [...prevMessages, message]);
            });

            socket.on('user_joined', (data) => {
                console.log('User joined:', data.username);
                //notification or update the UI here
            });

            socket.on('user_left', (data) => {
                console.log('User left:', data.username);
                //notification or update the UI here
            });

            socket.on('connected_users', (data) => {
                console.log('Connected users:', data.users);
                setConnectedUsers(data.users);
            });

            if (socket.connected) {
                joinMessenger(id);
            }
        }

        return () => {
            if (socket) {
                leaveMessenger(id);
                socket.off('connect');
                socket.off('disconnect');
                socket.off('reconnecting');
                socket.off('reconnect');
                socket.off('message');
                socket.off('user_joined');
                socket.off('user_left');
                socket.off('connected_users');
            }
        };
    }, [id, user, socket, navigate]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleAddMessage = (e) => {
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
        sendMessage(id, newMessage);
        setNewMessage('');
        setIsSending(false);
    };

    const toggleDescription = () => {
        setShowDescription(!showDescription);
    };

    return ( 
        <div className="messenger-details terminal-interface">
            {!user && <div>Please log in to view this messenger.</div>}
            {user && (
                <>
                {(!isConnected || isReconnecting)&& (
                    <div className="disconnected-message">
                        You are currently disconnected. Reconnecting...
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
                        <div className="connected-users">
                            <h3>Connected Users</h3>
                            <ul>
                                {connectedUsers.map((username, index) => (
                                    <li key={index}>{username}</li>
                                ))}
                            </ul>
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
            </>
        )}
        </div>
    );
}
 
export default MessengerDetails;    