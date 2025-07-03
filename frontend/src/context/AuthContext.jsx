import React, { createContext, useState, useContext } from 'react';
import axios from 'axios'; // Kita pakai axios biasa khusus untuk login

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      console.error("Gagal parse user dari localStorage", error);
      return null;
    }
  });

  const login = async (username) => {
    try {
      const response = await axios.post('http://localhost:3001/api/login', { username });
      const userData = response.data;
      
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error("Login gagal:", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
