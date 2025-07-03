import React, { createContext, useState, useContext, useEffect } from 'react';
import apiClient from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  // DIUBAH: Mengambil token dari sessionStorage
  const [token, setToken] = useState(() => sessionStorage.getItem('authToken'));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // GANTI useEffect yang lama dengan ini
  useEffect(() => {
    const validateSession = async () => {
      const storedToken = sessionStorage.getItem('authToken');
      if (storedToken) {
        try {
          // Panggil endpoint /me untuk memvalidasi token & mendapatkan data user terbaru
          const response = await apiClient.get('/auth/me');
          const userData = response.data;
          
          // Jika sukses, perbarui state dan sessionStorage
          setUser(userData);
          sessionStorage.setItem('user', JSON.stringify(userData));
          
        } catch (error) {
          // Jika ada error (misal: token tidak valid, user dihapus), logout paksa
          console.error("Validasi sesi gagal, membersihkan sesi...");
          logout();
        }
      }
      setLoading(false);
    };

    validateSession();
  }, []); // Hapus [token] agar ini hanya berjalan sekali saat komponen mount

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
