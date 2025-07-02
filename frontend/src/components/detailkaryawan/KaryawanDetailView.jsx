import React, { useState, Fragment } from 'react';
// DIHAPUS: axios tidak lagi digunakan
// import axios from 'axios';
import { ArrowLeft, Edit, ChevronDown, ChevronUp, Trash2, Check, X as CancelIcon } from 'lucide-react';
import EditJabatanModal from './EditJabatanModal.jsx';

// Komponen DetailItem tidak berubah
const DetailItem = ({ label, value, onEdit, isEditable }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 flex text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
      <span className="flex-grow">{value || '-'}</span>
      {isEditable && (
        <button onClick={onEdit} className="ml-4 flex-shrink-0 rounded-md p-1 text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Edit size={16} />
        </button>
      )}
    </dd>
  </div>
);

// Komponen AbsensiTable kembali menggunakan data dummy
const AbsensiTable = () => {
    const dummyAbsensi = [
        { tanggal: '2025-07-01', hari: 'Selasa, 1 Jul 2025', masuk: '08:00', keluar: '17:00', status: 'Valid', total: '9.0 jam' },
        { tanggal: '2025-07-02', hari: 'Rabu, 2 Jul 2025', masuk: '08:05', keluar: '17:02', status: 'Valid', total: '9.0 jam' },
        { tanggal: '2025-07-03', hari: 'Kamis, 3 Jul 2025', masuk: '07:58', keluar: '-', status: 'Invalid', total: '0.0 jam' },
    ];
    // Logika edit disederhanakan untuk mode UI
    const [editRow, setEditRow] = useState(null);
    return (
        <div className="mt-4 max-h-72 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
            <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 sticky top-0 z-10">
                        <tr>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Hari</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Masuk</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Keluar</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Status</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Total Jam</th>
                            <th className="p-3 font-semibold text-sm text-gray-600 dark:text-gray-400">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {dummyAbsensi.map((item) => (
                            <tr key={item.tanggal}>
                                {/* ... Konten baris tabel ... */}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// DIUBAH: Komponen utama kembali menerima props 'karyawan' utuh
const KaryawanDetailView = ({ karyawan, onBack }) => {
  const [currentKaryawan, setCurrentKaryawan] = useState(karyawan);
  const [showAbsensi, setShowAbsensi] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // DIHAPUS: useEffect untuk fetch data dihapus
  
  // DIUBAH: Fungsi hanya mengupdate state lokal
  const handleSaveJabatan = (newJabatan) => {
    console.log(`Menyimpan jabatan baru: ${newJabatan}`);
    setCurrentKaryawan({ ...currentKaryawan, jabatan: newJabatan });
    setIsEditModalOpen(false);
  };

  // DIUBAH: Fungsi hanya menampilkan konfirmasi
  const handleDeleteKaryawan = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus karyawan ${currentKaryawan.nama_lengkap}?`)) {
        alert(`Karyawan ${currentKaryawan.nama_lengkap} telah dihapus (simulasi).`);
        onBack();
    }
  };

  if (!karyawan) return null;

  return (
    <div className="p-6 md:p-8">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6">
        <ArrowLeft size={18} />
        Kembali ke Daftar Karyawan
      </button>

      <div className="bg-white dark:bg-gray-800/50 shadow-md rounded-xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{currentKaryawan.nama_lengkap}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{currentKaryawan.jabatan || 'Jabatan belum diatur'}</p>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-6">
          <dl className="divide-y divide-gray-200 dark:divide-gray-700">
            <DetailItem label="Nama Lengkap" value={currentKaryawan.nama_lengkap} />
            <DetailItem label="Tanggal Terdaftar" value={new Date(currentKaryawan.createdAt).toLocaleDateString('id-ID')} />
            <DetailItem label="ID Telegram" value={currentKaryawan.telegram_id} />
            <DetailItem label="Jabatan" value={currentKaryawan.jabatan} onEdit={() => setIsEditModalOpen(true)} isEditable={true} />
          </dl>
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <button onClick={() => setShowAbsensi(!showAbsensi)} className="w-full flex justify-between items-center text-left font-medium text-gray-700 dark:text-gray-300">
                <span>Detail Absensi</span>
                {showAbsensi ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showAbsensi && <AbsensiTable />}
        </div>
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-6 py-4">
            <button 
                onClick={handleDeleteKaryawan}
                className="w-full flex items-center justify-center gap-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
            >
                <Trash2 size={16} />
                Hapus Karyawan
            </button>
        </div>
      </div>

      <EditJabatanModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveJabatan}
        currentJabatan={currentKaryawan.jabatan}
        karyawanNama={currentKaryawan.nama_lengkap}
      />
    </div>
  );
};

export default KaryawanDetailView;
