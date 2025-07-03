import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // DIUBAH: Mengambil token dari sessionStorage
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateToken = () => {
      if (token) {
        try {
          // DIUBAH: Mengambil data user dari sessionStorage
          const storedUser = JSON.parse(sessionStorage.getItem('user'));
          if (storedUser) {
            setUser(storedUser);
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    validateToken();
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token: newToken, user: userData } = response.data;
      
      // DIUBAH: Menyimpan token dan user ke sessionStorage
      sessionStorage.setItem('authToken', newToken);
      sessionStorage.setItem('user', JSON.stringify(userData));
      
      setToken(newToken);
      setUser(userData);
    } catch (error) {
      console.error("Login gagal:", error);
      throw error;
    }
  };

  const logout = () => {
    // DIUBAH: Menghapus data dari sessionStorage
    sessionStorage.removeItem('authToken');
    sessionStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    login,
    logout,
  };
  
  if (loading) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
