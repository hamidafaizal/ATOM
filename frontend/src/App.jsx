import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';
import Login from './components/login/Login.jsx'; // DITAMBAHKAN
import { useAuth } from './context/AuthContext.jsx'; // DITAMBAHKAN

function App() {
  const [activePage, setActivePage] = useState('Dashboard');
  const { isAuthenticated } = useAuth(); // DITAMBAHKAN

  // Jika pengguna tidak terautentikasi, tampilkan halaman Login
  if (!isAuthenticated) {
    return <Login />;
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
