import { useState, useEffect } from "react";
import MessengerList from "./MessengerList";

const Home = () => {

    const [messengers, setMessengers] = useState([
        {title: 'General', body: 'test1', creator: 'EquityCats', id: 1},
        {title: 'Discussion', body: 'test2', creator: 'EquityCats', id: 2},
        {title: 'Testing', body: 'test3', creator: 'EquityCats', id: 3}
    ]);

    const handleDelete = (id) => {
        const newMessengers = messengers.filter(m => m.id !== id);
        setMessengers(newMessengers)
    }

    useEffect(() => {
       console.log('useEffect'); 
    });

    return (
        <div className="home">
            <MessengerList messengers = {messengers} title = "Messengers" handleDelete={handleDelete}/>
        </div>
    );
}
 
export default Home;
