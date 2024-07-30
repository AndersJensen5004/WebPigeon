import { useState, useEffect } from 'react';
import MessengerList from "./MessengerList";
import config from '../../config';
import axios from 'axios';
import folder from "../../assets/images/folder.png";
import "./Home.css";

const Home = () => {
    const [messengers, setMessengers] = useState(null);
    const [isPending, setIsPending] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMessengers = async () => {
            try {
                const response = await axios.get(`${config.apiBaseUrl}/messengers`);
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
        <>
        <div className="messenger-title">
        <img src={folder} alt="folder"/>
        <h1>Messengers</h1>
        </div>
        <div className="home">
            { error && <div>{error}</div>}
            { isPending && <div>Loading...</div>}
            {messengers && <MessengerList messengers={messengers}/>}
        </div>
        </>
    );
}
 
export default Home;