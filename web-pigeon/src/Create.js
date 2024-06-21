import { useState } from "react";
import { useNavigate } from "react-router-dom";

const Create = () => {
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [creator, setCreator] = useState('default2');
    const [isPending, setIsPending] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        const messenger = {title, body, creator}

        setIsPending(true);

        fetch('http://localhost:8000/messengers', {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(messenger)
        }).then(() => {
            console.log('new messenger added');
            setIsPending(false);
            navigate('/');
        });
    }

    return (
        <div className="create">
            <h2>Add a new messenger</h2>
            <form onSubmit={handleSubmit}>
                <label>Messenger Title:</label>
                <input
                    type = "text"
                    required
                    value = {title}
                    onChange = {(e) => setTitle(e.target.value)}
                />
                <label>Messenger Body:</label>
                <textarea
                    required
                    value = {body}
                    onChange = {(e) => setBody(e.target.value)}
                ></textarea>
                <label>Creator:</label>
                <select
                    value = {creator}
                    onChange = {(e) => setCreator(e.target.value)}
                >
                    <option value = "default1">default1</option>
                    <option value = "default2">default2</option>
                </select>
                { !isPending && <button>Add Messenger</button> }
                { isPending && <button disabled>Loading...</button> }
            </form>
        </div>
    );
}
 
export default Create;