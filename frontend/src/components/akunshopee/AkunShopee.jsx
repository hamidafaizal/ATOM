import React, { useState } from 'react';

// Komponen internal untuk menampilkan data akun hidup (contoh)
const TabelAkunHidup = () => (
  <div className="mt-6">
    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Daftar Akun Hidup</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">Tabel data untuk akun yang aktif akan ada di sini.</p>
    {/* Anda bisa menambahkan tabel data di sini nanti */}
  </div>
);

// Komponen internal untuk menampilkan data akun mati (contoh)
const TabelAkunMati = () => (
  <div className="mt-6">
    <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-200">Daftar Akun Mati</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">Tabel data untuk akun yang sudah tidak aktif akan ada di sini.</p>
    {/* Anda bisa menambahkan tabel data di sini nanti */}
  </div>
);

const AkunShopee = () => {
  // State untuk mengontrol tab mana yang aktif
  const [activeTab, setActiveTab] = useState('Akun Hidup');

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
        Manajemen Akun Shopee
      </h1>

      {/* Navbar / Tab internal */}
      <div className="mt-4 border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('Akun Hidup')}
            className={`${
              activeTab === 'Akun Hidup'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Akun Hidup
          </button>
          <button
            onClick={() => setActiveTab('Akun Mati')}
            className={`${
              activeTab === 'Akun Mati'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
            } whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors`}
          >
            Akun Mati
          </button>
        </nav>
      </div>

      {/* Konten dinamis berdasarkan tab yang aktif */}
      <div className="mt-4">
        {activeTab === 'Akun Hidup' && <TabelAkunHidup />}
        {activeTab === 'Akun Mati' && <TabelAkunMati />}
      </div>
    </div>
  );
};

export default AkunShopee;
