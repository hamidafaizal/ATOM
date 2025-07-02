import React, { useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import MainContent from './components/MainContent.jsx';

function App() {
  const [activePage, setActivePage] = useState('Dashboard');

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-50">
      {/* Mengirim state dan fungsi untuk mengubahnya ke komponen anak */}
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <MainContent activePage={activePage} />
    </div>
  );
}

export default App;
