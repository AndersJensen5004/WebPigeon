import MessengerList from "./MessengerList";
import useFetch from "./useFetch";

const Home = () => {

    const {data: messengers, isPending, error} = useFetch("http://localhost:8000/messengers");

    return (
        <div className="home">
            { error && <div>{error}</div>}
            { isPending && <div>Loading...</div>}
            {messengers && <MessengerList messengers = {messengers} title = "Messengers"/>}
        </div>
    );
}
 
export default Home;
