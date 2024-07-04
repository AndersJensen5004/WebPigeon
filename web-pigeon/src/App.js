import Navbar from './components/Navbar/Navbar.js';
import Home from './components/Home/Home.js';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext.js';
import Create from './components/CreateMessenger/Create.js';
import Login from './components/Login/Login.js';
import MessengerDetails from './components/MessengerDetails/MessengerDetails.js';
import NotFound from './components/NotFound/NotFount.js';
import CreateAccount from './components/CreateAccount/CreateAccount.js';
import Profile from './components/Profile/Profile.js';

function App() {
  return (
    <AuthProvider>
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
            <Route exact path="/createaccount" element=
              {<CreateAccount />}>
            </Route>
            <Route exact path="/messengers/:id" element=
              {<MessengerDetails/>}>
            </Route>
            <Route exact path="/profile/:username" element=
              {<Profile/>}>
            </Route>
            <Route path="*" element=
              {<NotFound/>}>
            </Route>
          </Routes>
        </div>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
