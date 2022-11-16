import { createContext, useEffect, useState } from 'react';
import './App.css';
import { Login } from "./components/Login";
import Home from './components/Home';
import { SignUp } from './components/SignUp';
import { CMP404 } from './components/404';
import { Route, Routes, useLocation } from 'react-router-dom';
import { EditProfilePic } from './components/EditProfilePic';
import { io } from 'socket.io-client';

const AppContext = createContext();

function App() {
  const location = useLocation();
  const [isLoggedIn, setLogIn] = useState();
  const [loggedInUserData, setLoggedInUserData] = useState("");
  const [socketConnection, setSocketConnection] = useState("");
  // Register this logged in user to the socket server ®️
  // Establish connection with Socket.IO
  // Check jason web token on inital render to keep user logged in 🧐
  useEffect(() => {
    if (document.cookie.includes('jwtoken')) {
      // Create socket instance again because user may refresh their page as a result socket connection will be lost 🧐
      const socketServerEndPoint = "http://localhost:4000"; // Socket.IO Server Endpoint
      const socket = io(socketServerEndPoint);
      socket.emit('register', location.state.email);
      setSocketConnection(socket);

      setLogIn(true);
      setLoggedInUserData(location.state);
    } else {
      setLogIn(false);
      setSocketConnection(false);
    }
  }, []);

  if (isLoggedIn) {
    return (
      <AppContext.Provider value={{ setLogIn, setLoggedInUserData, loggedInUserData, socketConnection, setSocketConnection }}>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/editProfilePic' element={<EditProfilePic />} />
          <Route path='*' element={<CMP404 />} />  {/* 404 error page */}
        </Routes>
      </AppContext.Provider>
    );
  } else {
    return (
      <AppContext.Provider value={{ setLogIn, setLoggedInUserData, setSocketConnection }}>
        <Routes>
          <Route path='/' element={<Login />} />
          <Route path='/signUp' element={<SignUp />} />
          <Route path='*' element={<CMP404 />} />  {/* 404 error page */}
        </Routes>
      </AppContext.Provider>
    );
  }
}

export default App;
export { AppContext };
