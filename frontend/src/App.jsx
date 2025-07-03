import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import AuthPage from './components/auth/AuthPage.jsx'; // DIUBAH: Impor AuthPage
import { useAuth } from './context/AuthContext.jsx';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { isAuthenticated } = useAuth();

  // Jika pengguna tidak terautentikasi, tampilkan alur otentikasi (Login/Register/Verify)
  if (!isAuthenticated) {
    // DIUBAH: Menggunakan AuthPage sebagai pintu masuk otentikasi
    return <AuthPage />;
  }

  // Jika terautentikasi, tampilkan aplikasi utama
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <MainContent activePage={activePage} />
    </div>
  );
}

export default App;
