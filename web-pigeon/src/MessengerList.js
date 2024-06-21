import { Link } from "react-router-dom";

const MessengerList = ({messengers, title}) => {

    return (
        <div className="messenger-list">
            <h2>{ title }</h2>
            {messengers.map((m) => (
                <div className="messenger-preview" key={m.id}>
                    <Link to={`/messengers/${m.id}`}>
                        <h2>{ m.title }</h2>
                        <p>Creator: { m.creator }</p>
                    </Link>
                </div>
            ))}
        </div>
    );
}
 
export default MessengerList;