import { Link } from "react-router-dom";
import arrow from "./arrow.png";

const MessengerList = ({messengers}) => {
    return (
        <div className="messenger-list">
            {messengers.map((m) => (
                <div className="messenger-preview" key={m._id}>
                    <Link to={`/messengers/${m._id}`}>
                        <div>
                            <h2>{ m.title }</h2>
                            <p>Creator: { m.creator }</p>
                        </div>
                        <div>
                            <img className="messenger-preview-arrow" src={arrow} alt="right arrow" />
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
}
 
export default MessengerList;