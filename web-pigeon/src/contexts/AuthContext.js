import React, { createContext, useState, useEffect, useContext } from 'react';
import { initializeSocket, closeSocket } from '../socketManager.js';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
      const newSocket = initializeSocket(userData.id);
      setSocket(newSocket);
    }
  }, []);

  const login = (userData) => {
    if (!userData.id || !userData.username) {
      console.error('Login data must include id and username');
      return;
    }
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    
    // Initialize socket connection after successful login
    const newSocket = initializeSocket(userData.id);
    setSocket(newSocket);
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
    
    // Close socket connection on logout
    if (socket) {
      closeSocket();
      setSocket(null);
    }
  };

  const updateUser = (updatedUserData) => {
    setCurrentUser(prevUser => {
      if (!prevUser) return null;
      const newUser = { ...prevUser, ...updatedUserData };
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser, socket }}>
      {children}
    </AuthContext.Provider>
  );
};