import React, { useState, useEffect } from 'react';
import { ArrowLeft, Edit, ChevronDown, ChevronUp, Trash2, Save, Loader2, Plus, Check, X as XIcon } from 'lucide-react';
import EditJabatanModal from './EditJabatanModal.jsx';
import apiClient from '../../api.js';
import toast from 'react-hot-toast'; // DITAMBAHKAN

const DetailItem = ({ label, value, onEdit, isEditable }) => (
  <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
    <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
    <dd className="mt-1 flex text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
      <span className="flex-grow">{value || '-'}</span>
      {isEditable && (
        <button onClick={onEdit} className="ml-4 flex-shrink-0 rounded-md p-1 text-primary-600 dark:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700">
          <Edit size={16} />
        </button>
      )}
    </dd>
  </div>
);

// GANTI SELURUH KOMPONEN AbsensiRow DENGAN INI
const AbsensiRow = ({ item, onSave, onDelete }) => {
    // Gunakan waktu yang SUDAH DIBULATKAN dari backend untuk tampilan dan edit
    const masukDate = item.masukDibulatkan ? new Date(item.masukDibulatkan) : null;
    const keluarDate = item.keluarDibulatkan ? new Date(item.keluarDibulatkan) : null;

    // Ambil waktu ASLI untuk ditampilkan di tooltip
    const masukAsliDate = item.masuk ? new Date(item.masuk) : null;
    const keluarAsliDate = item.keluar ? new Date(item.keluar) : null;

    const formatToTimeInput = (date) => {
        if (!date) return '';
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        jamMasuk: formatToTimeInput(masukDate),
        jamKeluar: formatToTimeInput(keluarDate),
    });

    const handleInputChange = (e) => {
        setEditData({ ...editData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        // Bug fix dari sebelumnya, pastikan tanggal dikirim saat menyimpan
        const tanggalAbsen = item.masuk.split('T')[0];
        await onSave({ ...item, ...editData, tanggal: tanggalAbsen });
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <tr className="bg-primary-50 dark:bg-primary-900/50">
                <td className="p-3 text-sm text-gray-800 dark:text-gray-200">
                    {masukDate ? masukDate.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' }) : '-'}
                </td>
                <td className="p-2"><input type="time" name="jamMasuk" value={editData.jamMasuk} onChange={handleInputChange} className="w-full bg-transparent rounded p-1" /></td>
                <td className="p-2"><input type="time" name="jamKeluar" value={editData.jamKeluar} onChange={handleInputChange} className="w-full bg-transparent rounded p-1" /></td>
                <td className="p-3 text-sm text-gray-600 dark:text-gray-300">{item.status}</td>
                <td className="p-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{item.total}</td>
                <td className="p-3 flex items-center gap-2">
                    <button onClick={handleSave} className="p-1 text-green-500 hover:bg-green-100 rounded-full"><Check size={18} /></button>
                    <button onClick={() => setIsEditing(false)} className="p-1 text-red-500 hover:bg-red-100 rounded-full"><XIcon size={18} /></button>
                </td>
            </tr>
        );
    }

    return (
        <tr>
            <td className="p-3 text-sm text-gray-800 dark:text-gray-200" title={`Waktu asli: ${masukAsliDate ? masukAsliDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) : ''}`}>
                {masukDate ? masukDate.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '-'}
            </td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-300" title={`Waktu asli: ${masukAsliDate ? masukAsliDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) : ''}`}>
                {masukDate ? masukDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-300" title={`Waktu asli: ${keluarAsliDate ? keluarAsliDate.toLocaleTimeString('id-ID', {hour: '2-digit', minute: '2-digit', second: '2-digit'}) : ''}`}>
                {keluarDate ? keluarDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : '-'}
            </td>
            <td className="p-3 text-sm text-gray-600 dark:text-gray-300">{item.status}</td>
            <td className="p-3 text-sm font-semibold text-gray-800 dark:text-gray-200">{item.total}</td>
            <td className="p-3 flex items-center gap-1">
                <button onClick={() => setIsEditing(true)} className="p-1 text-gray-400 hover:text-primary-500"><Edit size={16} /></button>
                <button onClick={() => onDelete(item)} className="p-1 text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
            </td>
        </tr>
    );
};

const AbsensiTable = ({ karyawanId }) => {
    const [absensi, setAbsensi] = useState([]);
    const [loading, setLoading] = useState(true);
    const [adding, setAdding] = useState(false);
    const [newData, setNewData] = useState({ tanggal: '', jamMasuk: '', jamKeluar: '' });

    const fetchAbsensi = async () => {
        if (!karyawanId) return;
        setLoading(true);
        try {
            const response = await apiClient.get(`/karyawan/${karyawanId}`);
            setAbsensi(response.data.laporanAbsensi || []);
        } catch (error) {
            console.error("Gagal mengambil data absensi:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAbsensi();
    }, [karyawanId]);

    const handleSave = async (data) => {
        try {
            // Ambil tanggal dari 'data.masuk' yang formatnya ISO string.
            // Kita hanya butuh bagian tanggalnya saja (YYYY-MM-DD) untuk dikirim.
            const tanggalAbsen = data.masuk.split('T')[0];

            // Kirim payload ke backend dengan menyertakan 'tanggal' secara eksplisit
            await apiClient.post('/absensi/harian', { 
                ...data, 
                karyawanId, 
                tanggal: tanggalAbsen // <-- INI PERBAIKANNYA
            });

            toast.success('Absensi berhasil disimpan.');
            fetchAbsensi(); 
        } catch (error) {
            console.error("Gagal menyimpan absensi:", error);
            toast.error("Gagal menyimpan absensi.");
        }
    };

    const handleAddNew = async () => {
        if (!newData.tanggal) {
            toast.error("Tanggal wajib diisi."); // DIUBAH
            return;
        }
        await handleSave(newData);
        setAdding(false);
        setNewData({ tanggal: '', jamMasuk: '', jamKeluar: '' });
    };

    const handleDeleteSession = async (itemToDelete) => {
        if (window.confirm(`Apakah Anda yakin ingin menghapus sesi absensi pada tanggal ${itemToDelete.tanggal}?`)) {
            try {
                await apiClient.post('/absensi/harian', { 
                    karyawanId,
                    tanggal: itemToDelete.tanggal,
                    jamMasuk: '', 
                    jamKeluar: '',
                    idMasuk: itemToDelete.idMasuk,
                    idKeluar: itemToDelete.idKeluar,
                });
                toast.success('Sesi absensi berhasil dihapus.'); // DIUBAH
                fetchAbsensi();
            } catch (error) {
                console.error("Gagal menghapus sesi absensi:", error);
                toast.error("Gagal menghapus sesi."); // DIUBAH
            }
        }
    };

    if (loading) return <div className="flex justify-center items-center h-32"><Loader2 className="w-6 h-6 text-primary-500 animate-spin" /></div>;

    return (
        <div className="mt-4">
            <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
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
                        {absensi.map((item) => <AbsensiRow key={item.idMasuk} item={item} onSave={handleSave} onDelete={handleDeleteSession} />)}
                        {adding && (
                             <tr className="bg-primary-50 dark:bg-primary-900/50">
                                <td className="p-2"><input type="date" value={newData.tanggal} onChange={e => setNewData({...newData, tanggal: e.target.value})} className="w-full bg-transparent rounded p-1" /></td>
                                <td className="p-2"><input type="time" value={newData.jamMasuk} onChange={e => setNewData({...newData, jamMasuk: e.target.value})} className="w-full bg-transparent rounded p-1" /></td>
                                <td className="p-2"><input type="time" value={newData.jamKeluar} onChange={e => setNewData({...newData, jamKeluar: e.target.value})} className="w-full bg-transparent rounded p-1" /></td>
                                <td colSpan="3" className="p-2 text-right">
                                    <button onClick={handleAddNew} className="p-1 text-green-500"><Check size={18} /></button>
                                    <button onClick={() => setAdding(false)} className="p-1 text-red-500"><XIcon size={18} /></button>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            <button onClick={() => setAdding(true)} className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400">
                <Plus size={16} /> Tambah Sesi Absen
            </button>
        </div>
    );
};


const KaryawanDetailView = ({ karyawan, onBack }) => {
  const [currentKaryawan, setCurrentKaryawan] = useState(karyawan);
  const [showAbsensi, setShowAbsensi] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [tipeGajiList, setTipeGajiList] = useState([]);
  const [selectedTipeGaji, setSelectedTipeGaji] = useState(karyawan.tipeGajiId || '');
  const [isTipeGajiDirty, setIsTipeGajiDirty] = useState(false);

  useEffect(() => {
    const fetchTipeGaji = async () => {
      try {
        const response = await apiClient.get('/tipegaji');
        setTipeGajiList(response.data);
      } catch (error) {
        console.error("Gagal mengambil daftar tipe gaji:", error);
      }
    };
    fetchTipeGaji();
  }, []);

  const handleSaveJabatan = async (newJabatan) => {
    try {
      const response = await apiClient.patch(`/karyawan/${currentKaryawan.id}`, { jabatan: newJabatan });
      setCurrentKaryawan(prev => ({...prev, ...response.data}));
      toast.success('Jabatan berhasil diperbarui.'); // DIUBAH
      setIsEditModalOpen(false);
    } catch (error) {
      console.error("Gagal menyimpan jabatan:", error);
      toast.error("Gagal menyimpan perubahan jabatan."); // DIUBAH
    }
  };

  const handleDeleteKaryawan = async () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus karyawan ${currentKaryawan.nama_lengkap}? Operasi ini tidak bisa dibatalkan.`)) {
      try {
        await apiClient.delete(`/karyawan/${currentKaryawan.id}`);
        toast.success(`Karyawan ${currentKaryawan.nama_lengkap} telah dihapus.`); // DIUBAH
        onBack();
      } catch (error) {
        console.error("Gagal menghapus karyawan:", error);
        toast.error(error.response?.data?.message || "Gagal menghapus karyawan."); // DIUBAH
      }
    }
  };

  const handleTipeGajiChange = (e) => {
    setSelectedTipeGaji(Number(e.target.value));
    setIsTipeGajiDirty(true);
  };

  const handleSimpanTipeGaji = async () => {
    try {
      const response = await apiClient.patch(`/karyawan/${currentKaryawan.id}`, { tipeGajiId: selectedTipeGaji });
      setCurrentKaryawan(prev => ({...prev, ...response.data}));
      setIsTipeGajiDirty(false);
      toast.success("Tipe gaji berhasil diperbarui."); // DIUBAH
    } catch (error) {
      console.error("Gagal menyimpan tipe gaji:", error);
      toast.error("Gagal menyimpan perubahan tipe gaji."); // DIUBAH
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
            
            <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Tipe Gaji</dt>
                <dd className="mt-1 flex items-center text-sm text-gray-900 dark:text-white sm:col-span-2 sm:mt-0">
                    <select
                        value={selectedTipeGaji}
                        onChange={handleTipeGajiChange}
                        className="flex-grow rounded-lg border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm p-2"
                    >
                        <option value="" disabled>-- Pilih Tipe Gaji --</option>
                        {tipeGajiList.map(tipe => (
                            <option key={tipe.id} value={tipe.id}>{tipe.nama}</option>
                        ))}
                    </select>
                </dd>
            </div>
          </dl>
        </div>
        
        {isTipeGajiDirty && (
            <div className="bg-primary-50 dark:bg-primary-900/30 px-6 py-4 flex justify-end">
                <button
                    onClick={handleSimpanTipeGaji}
                    className="flex items-center gap-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
                >
                    <Save size={16} />
                    Simpan Perubahan
                </button>
            </div>
        )}

        <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4">
            <button onClick={() => setShowAbsensi(!showAbsensi)} className="w-full flex justify-between items-center text-left font-medium text-gray-700 dark:text-gray-300">
                <span>Detail Absensi</span>
                {showAbsensi ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
            {showAbsensi && <AbsensiTable karyawanId={currentKaryawan.id} />}
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
