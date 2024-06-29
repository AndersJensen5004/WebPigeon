import { useState, useEffect } from 'react';
import MessengerList from "./MessengerList";
import axios from 'axios';

const Home = () => {
    const [messengers, setMessengers] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessengers = async () => {
            try {
                const response = await axios.get('http://localhost:5000/messengers');
                setMessengers(response.data);
                setIsPending(false);
            } catch (err) {
                setError(err.message);
                setIsPending(false);
            }
        };

        fetchMessengers();
    }, []);

    return (
        <div className="home">
            { error && <div>{error}</div>}
            { isPending && <div>Loading...</div>}
            {messengers && <MessengerList messengers={messengers} title="Messengers"/>}
        </div>
    );
}
 
export default Home;