import React, { useState, useEffect } from 'react';
import { Folder, Loader2 } from 'lucide-react';
import KaryawanDetailView from './KaryawanDetailView.jsx';
import apiClient from '../../api.js'; // DIUBAH

const DetailKaryawan = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        setLoading(true);
        // DIUBAH: Menggunakan apiClient
        const response = await apiClient.get('/karyawan');
        setKaryawanList(response.data);
        setError(null);
      } catch (err) {
        setError('Gagal mengambil data karyawan dari server.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchKaryawan();
  }, []);

  const handleKaryawanClick = (karyawan) => {
    setSelectedKaryawan(karyawan); 
  };
  
  const handleBack = () => {
    setSelectedKaryawan(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">{error}</div>;
  }
  
  if (selectedKaryawan) {
    return <KaryawanDetailView karyawan={selectedKaryawan} onBack={handleBack} />;
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Detail Karyawan
      </h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {karyawanList.map(karyawan => (
          <button 
            key={karyawan.id}
            onClick={() => handleKaryawanClick(karyawan)}
            className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <Folder className="w-16 h-16 text-primary-500 mb-2" />
            <span className="font-medium text-sm text-gray-800 dark:text-gray-200 break-words w-full">
              {karyawan.nama_lengkap}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default DetailKaryawan;
