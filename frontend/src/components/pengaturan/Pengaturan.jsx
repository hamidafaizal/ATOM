import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

// --- Komponen Modal Tipe Gaji (Disederhanakan untuk Gaji per Jam) ---
const TipeGajiModal = ({ isOpen, onClose, onSave, tipeGajiData }) => {
    
    // State untuk mengelola semua data form
    const [formData, setFormData] = useState({
        nama: '',
        model_perhitungan: 'BULANAN', // BULANAN, HARIAN, PER_JAM_BERTINGKAT
        nilai_gaji_dasar: 0, // Untuk Bulanan/Harian
        aturan_tarif_per_jam: [ // Untuk Per Jam Bertingkat
            { mulai: '05:00', selesai: '01:00', tarif: 7000 },
            { mulai: '01:00', selesai: '05:00', tarif: 9500 }
        ],
        tarif_lembur_per_jam: 10000,
    });

    // Update form saat data untuk edit diberikan
    useEffect(() => {
        if (tipeGajiData) {
            setFormData({
                id: tipeGajiData.id || null,
                nama: tipeGajiData.nama || '',
                model_perhitungan: tipeGajiData.model_perhitungan || 'BULANAN',
                nilai_gaji_dasar: tipeGajiData.nilai_gaji_dasar || 0,
                aturan_tarif_per_jam: tipeGajiData.aturan_tarif_per_jam && tipeGajiData.aturan_tarif_per_jam.length > 0 
                    ? tipeGajiData.aturan_tarif_per_jam 
                    : [{ mulai: '', selesai: '', tarif: 0 }],
                tarif_lembur_per_jam: tipeGajiData.tarif_lembur_per_jam || 10000,
            });
        } else {
            // Reset form untuk "Tambah Baru"
            setFormData({
                nama: '',
                model_perhitungan: 'BULANAN',
                nilai_gaji_dasar: 0,
                aturan_tarif_per_jam: [{ mulai: '', selesai: '', tarif: 0 }],
                tarif_lembur_per_jam: 10000,
            });
        }
    }, [tipeGajiData, isOpen]);

    if (!isOpen) return null;

    // --- Handlers untuk perubahan input ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTarifChange = (index, e) => {
        const { name, value } = e.target;
        const newAturan = [...formData.aturan_tarif_per_jam];
        newAturan[index][name] = value;
        setFormData(prev => ({ ...prev, aturan_tarif_per_jam: newAturan }));
    };
    
    const tambahAturanTarif = () => {
        setFormData(prev => ({
            ...prev,
            aturan_tarif_per_jam: [...prev.aturan_tarif_per_jam, { mulai: '', selesai: '', tarif: 0 }]
        }));
    };

    const hapusAturanTarif = (index) => {
        const newAturan = formData.aturan_tarif_per_jam.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, aturan_tarif_per_jam: newAturan }));
    };

    const handleSave = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formData.id ? 'Edit Tipe Gaji' : 'Tambah Tipe Gaji Baru'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button>
                </div>
                
                <form onSubmit={handleSave} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    {/* --- Bagian Utama --- */}
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Tipe Gaji</label>
                        <input type="text" name="nama" value={formData.nama} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" required />
                    </div>
                    
                    <div>
                        <label htmlFor="model_perhitungan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Perhitungan</label>
                        <select name="model_perhitungan" value={formData.model_perhitungan} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                            <option value="BULANAN">Bulanan</option>
                            <option value="HARIAN">Harian</option>
                            <option value="PER_JAM_BERTINGKAT">Per Jam (Bertingkat)</option>
                        </select>
                    </div>

                    {/* --- Input Dinamis Berdasarkan Model --- */}
                    {formData.model_perhitungan === 'PER_JAM_BERTINGKAT' ? (
                        <div className="p-4 border border-dashed rounded-md dark:border-gray-600 space-y-4">
                            <h4 className="font-semibold text-gray-800 dark:text-white">Aturan Tarif per Jam</h4>
                            {formData.aturan_tarif_per_jam.map((aturan, index) => (
                                <div key={index} className="p-3 border rounded-md dark:border-gray-700 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-sm dark:text-white">Aturan {index + 1}</p>
                                        <button type="button" onClick={() => hapusAturanTarif(index)} className="p-1 text-red-500 hover:text-red-700">
                                            <Trash2 size={14}/>
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Jam Mulai</label>
                                            <input type="time" name="mulai" value={aturan.mulai} onChange={(e) => handleTarifChange(index, e)} className="mt-1 block w-full rounded-md dark:bg-gray-600 text-sm" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Jam Selesai</label>
                                            <input type="time" name="selesai" value={aturan.selesai} onChange={(e) => handleTarifChange(index, e)} className="mt-1 block w-full rounded-md dark:bg-gray-600 text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400">Tarif per Jam (Rp)</label>
                                        <input type="number" name="tarif" value={aturan.tarif} onChange={(e) => handleTarifChange(index, e)} className="mt-1 block w-full rounded-md dark:bg-gray-600 text-sm" />
                                    </div>
                                </div>
                            ))}
                            <button type="button" onClick={tambahAturanTarif} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">
                                + Tambah Aturan Tarif
                            </button>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="nilai_gaji_dasar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nilai Gaji Pokok / Tarif Harian (Rp)</label>
                            <input type="number" name="nilai_gaji_dasar" value={formData.nilai_gaji_dasar} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" required />
                        </div>
                    )}

                    {/* DIUBAH: Input lembur sekarang hanya muncul jika modelnya BUKAN per jam */}
                    {formData.model_perhitungan !== 'PER_JAM_BERTINGKAT' && (
                        <>
                            <hr className="dark:border-gray-700"/>
                            <div>
                                <label htmlFor="tarif_lembur_per_jam" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarif Lembur Umum per Jam (Rp)</label>
                                <input type="number" name="tarif_lembur_per_jam" value={formData.tarif_lembur_per_jam} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" />
                            </div>
                        </>
                    )}
                </form>

                <div className="pt-6 flex justify-end space-x-3 border-t dark:border-gray-700 mt-6">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" onClick={handleSave} className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700">Simpan</button>
                </div>
            </div>
        </div>
    );
};


// --- Komponen Manajemen Tipe Gaji (Utama) ---
const ManajemenTipeGaji = () => {
    // Data dummy disesuaikan dengan struktur baru
    const dummyData = [
        { id: 1, nama: 'Host Live', model_perhitungan: 'PER_JAM_BERTINGKAT', aturan_tarif_per_jam: [{ mulai: '05:00', selesai: '01:00', tarif: 7000 }, { mulai: '01:00', selesai: '05:00', tarif: 9500 }], tarif_lembur_per_jam: 0 },
        { id: 2, nama: 'Produksi - UMR', model_perhitungan: 'BULANAN', nilai_gaji_dasar: 2400000, tarif_lembur_per_jam: 10000 },
        { id: 3, nama: 'Produksi - Harian', model_perhitungan: 'HARIAN', nilai_gaji_dasar: 100000, tarif_lembur_per_jam: 10000 },
    ];
    
    const [tipeGajiList, setTipeGajiList] = useState(dummyData);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTipeGaji, setEditingTipeGaji] = useState(null);

    const handleTambahBaru = () => {
        setEditingTipeGaji(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tipe) => {
        setEditingTipeGaji(tipe);
        setIsModalOpen(true);
    };

    const handleSave = (formData) => {
        console.log("Menyimpan data (simulasi):", formData);
        if (formData.id) {
            setTipeGajiList(tipeGajiList.map(item => item.id === formData.id ? { ...formData, id: item.id } : item));
        } else {
            setTipeGajiList([...tipeGajiList, { ...formData, id: Date.now() }]);
        }
        setIsModalOpen(false);
    };
    
    const handleDelete = (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus tipe gaji ini?")) {
            setTipeGajiList(tipeGajiList.filter(item => item.id !== id));
        }
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Manajemen Tipe Gaji</h2>
                <button onClick={handleTambahBaru} className="flex items-center gap-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded-md">
                    <Plus size={16} />
                    Tambah Baru
                </button>
            </div>
            <div className="space-y-3">
                {tipeGajiList.map(tipe => (
                    <div key={tipe.id} className="bg-white dark:bg-gray-800/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-between items-center">
                        <div>
                            <p className="font-semibold text-gray-900 dark:text-white">{tipe.nama}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {`Model: ${tipe.model_perhitungan}`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => handleEdit(tipe)} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400">
                                <Edit size={16} />
                            </button>
                            <button onClick={() => handleDelete(tipe.id)} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
            <TipeGajiModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave}
                tipeGajiData={editingTipeGaji}
            />
        </div>
    );
};

const Pengaturan = () => {
  return (
    <div className="p-6 md:p-8">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
        Pengaturan Aplikasi
      </h1>
      <ManajemenTipeGaji />
    </div>
  );
};

export default Pengaturan;
