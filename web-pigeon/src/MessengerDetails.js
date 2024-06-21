import { useNavigate, useParams } from "react-router-dom";
import useFetch from "./useFetch";

const MessengerDetails = () => {

    const { id } = useParams();
    const { data: messenger, error, isPending} = useFetch('http://localhost:8000/messengers/' + id);
    const navigate = useNavigate();

    const handleClick = () => {
        fetch('http://localhost:8000/messengers/' + id, {
            method: 'DELETE'
        }).then(() => {
            navigate('/');
        })
    }

    return ( 
    <div className="messenger-details">
        { isPending && <div>Loading...</div> }
        { error && <div>{ error }</div> }
        { messenger && (
            <article>
                <h2>{messenger.title}</h2>
                <p>Creator: {messenger.creator}</p>
                <div>{messenger.body}</div>
                <button onClick={handleClick}>Delete</button>
            </article>
        )}
    </div>
    );
}
 
export default MessengerDetails;    