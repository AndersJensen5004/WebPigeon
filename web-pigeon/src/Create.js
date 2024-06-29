import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from './AuthContext';
import axios from 'axios';

const Create = () => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isPending, setIsPending] = useState(false);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

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
            await axios.post('http://localhost:5000/messengers', messenger);
            console.log('New messenger added');
            setIsPending(false);
            navigate('/');
        } catch (err) {
            setError(err.message);
            setIsPending(false);
        }
    }

    return (
        <div className="create">
            <h2>Add a new messenger</h2>
            {error && <div className="error">{error}</div>}
            <form onSubmit={handleSubmit}>
                <label>Messenger Title:</label>
                <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                />
                <label>Messenger Description:</label>
                <textarea
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                ></textarea>
                <p>Creator: {user ? user.username : 'Not logged in'}</p>
                { !isPending && <button>Add Messenger</button> }
                { isPending && <button disabled>Loading...</button> }
            </form>
        </div>
    );
}
 
export default Create;