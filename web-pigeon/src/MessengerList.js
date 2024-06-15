const MessengerList = ({messengers, title, handleDelete}) => {

    return (
        <div className="messenger-list">
            <h2>{ title }</h2>
            {messengers.map((m) => (
                <div className="messenger-preview" key={m.id}>
                    <h2>{ m.title }</h2>
                    <p>Creator: { m.creator }</p>
                    <button onClick={() => handleDelete(m.id)}>Delete Messenger</button>
                </div>
            ))}
        </div>
    );
}
 
export default MessengerList;