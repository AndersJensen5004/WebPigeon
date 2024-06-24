import { Link } from "react-router-dom";
import folder from "./folder.png";

const MessengerList = ({messengers, title}) => {

    return (
        <div className="messenger-list">
            <div className="messenger-title">
                <img src={folder} alt="folder"/>
                <h1>{ title }</h1>
            </div>
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