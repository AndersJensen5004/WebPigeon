import React, { createContext, useState, useEffect, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    
    if (!userData.id || !userData.username) {
      console.error('Login data must include id and username');
      return;
    }
    setCurrentUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('user');
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
    <AuthContext.Provider value={{ currentUser, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};