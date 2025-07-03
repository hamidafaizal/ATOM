import React, { useState } from 'react';
import Login from '../login/Login';
import Register from './Register';
import VerifyEmail from './VerifyEmail';

/**
 * Komponen ini berfungsi sebagai pengatur tampilan untuk alur otentikasi.
 * Ia akan menampilkan halaman Login, Register, atau VerifyEmail
 * berdasarkan state 'view'.
 */
const AuthPage = () => {
  // State untuk mengontrol halaman mana yang ditampilkan: 'login', 'register', atau 'verify'
  const [view, setView] = useState('login');
  // State untuk menyimpan email pengguna setelah registrasi, untuk ditampilkan di halaman verifikasi
  const [emailForVerification, setEmailForVerification] = useState('');

  // Fungsi untuk menangani keberhasilan registrasi
  const handleRegisterSuccess = (email) => {
    setEmailForVerification(email);
    setView('verify'); // Pindah ke halaman verifikasi
  };

  // Render komponen berdasarkan state 'view'
  switch (view) {
    case 'register':
      return (
        <Register
          onNavigateToLogin={() => setView('login')}
          onRegisterSuccess={handleRegisterSuccess}
        />
      );
    case 'verify':
      return (
        <VerifyEmail
          email={emailForVerification}
          onNavigateToLogin={() => setView('login')}
        />
      );
    case 'login':
    default:
      return (
        <Login
          onNavigateToRegister={() => setView('register')}
        />
      );
  }
};

export default AuthPage;
