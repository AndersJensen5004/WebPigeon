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
import EditProfile from './components/Profile/EditProfile.js';
import EditUsername from './components/Profile/EditUsername.js';
import EditPassword from './components/Profile/EditPassword.js';
import EditProfilePhoto from './components/Profile/EditProfilePhoto.js';
import Changelog from './components/Changelog/Changelog.js';
import About from './components/About/About.js';
import Search from './components/Search/Search.js';

function App() {
  return (
    <AuthProvider>
    <Router>
      <div className="App">
        <Navbar />
        <div className="content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/create" element={<Create />} />
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/createaccount" element={<CreateAccount />} />
            <Route exact path="/messengers/:id" element={<MessengerDetails/>} />
            <Route exact path="/profile/:username" element={<Profile/>} />
            <Route exact path="/profile/:username/edit" element={<EditProfile/>} />
            <Route exact path="/profile/:username/edit/username" element={<EditUsername/>} />
            <Route exact path="/profile/:username/edit/password" element={<EditPassword/>} />
            <Route exact path="/profile/:username/edit/photo" element={<EditProfilePhoto/>} />
            <Route exact path="/changelog" element={<Changelog />} />
            <Route exact path="/about" element={<About />} />
            <Route exact path="Search" element={<Search />} />
            <Route path="*" element={<NotFound/>} />
          </Routes>
        </div>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
