import Navbar from './Navbar.js';
import Home from './Home.js';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import Create from './Create.js';
import MessengerDetails from './MessengerDetails.js';
import NotFound from './NotFount.js';
import Login from './Login.js';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element=
              {<Home />}>
            </Route>
            <Route exact path="/create" element=
              {<Create />}>
            </Route>
            <Route exact path="/login" element=
              {<Login />}>
            </Route>
            <Route exact path="/messengers/:id" element=
              {<MessengerDetails/>}>
            </Route>
            <Route path="*" element=
              {<NotFound/>}>
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
