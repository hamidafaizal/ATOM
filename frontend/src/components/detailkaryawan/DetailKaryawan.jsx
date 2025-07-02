import React, { useState } from 'react';
import { Folder } from 'lucide-react';
import KaryawanDetailView from './KaryawanDetailView.jsx';
// DIHAPUS: axios tidak lagi digunakan
// import axios from 'axios';

// DITAMBAHKAN KEMBALI: Data dummy untuk daftar karyawan
const dummyKaryawanList = [
  { id: 1, nama_lengkap: 'Hamida Faizal Amin', jabatan: 'Developer', telegram_id: '7559724484', createdAt: '2025-07-01T10:00:00.000Z' },
  { id: 2, nama_lengkap: 'Budi Santoso', jabatan: 'Designer', telegram_id: '1234567890', createdAt: '2025-07-02T11:00:00.000Z' },
  { id: 3, nama_lengkap: 'Citra Lestari', jabatan: 'Project Manager', telegram_id: '0987654321', createdAt: '2025-07-03T12:00:00.000Z' },
];

const DetailKaryawan = () => {
  // DIUBAH: State disederhanakan kembali untuk mode UI
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);

  // DIHAPUS: useEffect untuk fetch data dihapus
  
  const handleKaryawanClick = (karyawan) => {
    // Menyimpan seluruh objek karyawan, bukan hanya ID
    setSelectedKaryawan(karyawan); 
  };
  
  const handleBack = () => {
    setSelectedKaryawan(null);
  }

  // Logika render sekarang menggunakan objek penuh
  if (selectedKaryawan) {
    return <KaryawanDetailView karyawan={selectedKaryawan} onBack={handleBack} />;
  }

  // Tampilan utama (daftar folder karyawan)
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Detail Karyawan
      </h1>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {dummyKaryawanList.map(karyawan => (
          <button 
            key={karyawan.id}
            onClick={() => handleKaryawanClick(karyawan)}
            className="flex flex-col items-center justify-center text-center p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 hover:shadow-lg hover:-translate-y-1 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Folder className="w-16 h-16 text-blue-500 mb-2" />
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
