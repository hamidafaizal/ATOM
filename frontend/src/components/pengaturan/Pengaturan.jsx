import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Loader2 } from 'lucide-react';
import apiClient from '../../api';
import toast from 'react-hot-toast'; // DITAMBAHKAN

// Komponen Modal
const TipeGajiModal = ({ isOpen, onClose, onSave, tipeGajiData }) => {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        const initialData = {
            nama: '',
            model_perhitungan: 'BULANAN',
            nilai_gaji_dasar: 0,
            aturan_tarif_per_jam: [{ mulai: '', selesai: '', tarif: 0 }],
            tarif_lembur_per_jam: 0,
            potongan_tidak_masuk: 0,
        };
        if (tipeGajiData) {
            const parsedData = {
                ...tipeGajiData,
                aturan_tarif_per_jam: typeof tipeGajiData.aturan_tarif_per_jam === 'string'
                    ? JSON.parse(tipeGajiData.aturan_tarif_per_jam)
                    : tipeGajiData.aturan_tarif_per_jam || [{ mulai: '', selesai: '', tarif: 0 }],
            };
            setFormData({ ...initialData, ...parsedData });
        } else {
            setFormData(initialData);
        }
    }, [tipeGajiData, isOpen]);

    if (!isOpen) return null;

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 m-4" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-start justify-between pb-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {formData.id ? 'Edit Tipe Gaji' : 'Tambah Tipe Gaji Baru'}
                    </h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button>
                </div>
                <form onSubmit={handleSave} className="mt-4 space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                    <div>
                        <label htmlFor="nama" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Tipe Gaji</label>
                        <input type="text" name="nama" value={formData.nama || ''} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" required />
                    </div>
                    <div>
                        <label htmlFor="model_perhitungan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Model Perhitungan</label>
                        <select name="model_perhitungan" value={formData.model_perhitungan || 'BULANAN'} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700">
                            <option value="BULANAN">Bulanan</option>
                            <option value="HARIAN">Harian</option>
                            <option value="PER_JAM_BERTINGKAT">Per Jam (Bertingkat)</option>
                        </select>
                    </div>
                    {formData.model_perhitungan === 'PER_JAM_BERTINGKAT' ? (
                        <div className="p-4 border border-dashed rounded-md dark:border-gray-600 space-y-4">
                            <h4 className="font-semibold text-gray-800 dark:text-white">Aturan Tarif per Jam</h4>
                            {formData.aturan_tarif_per_jam && formData.aturan_tarif_per_jam.map((aturan, index) => (
                                <div key={index} className="p-3 border rounded-md dark:border-gray-700 space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="font-medium text-sm dark:text-white">Aturan {index + 1}</p>
                                        <button type="button" onClick={() => hapusAturanTarif(index)} className="p-1 text-red-500 hover:text-red-700"><Trash2 size={14}/></button>
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
                            <button type="button" onClick={tambahAturanTarif} className="w-full text-sm text-blue-600 dark:text-blue-400 hover:underline">+ Tambah Aturan Tarif</button>
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="nilai_gaji_dasar" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nilai Gaji Pokok / Tarif Harian (Rp)</label>
                            <input type="number" name="nilai_gaji_dasar" value={formData.nilai_gaji_dasar || 0} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" required />
                        </div>
                    )}
                    {formData.model_perhitungan !== 'PER_JAM_BERTINGKAT' && (
                        <>
                            <hr className="dark:border-gray-700"/>
                            <div>
                                <label htmlFor="tarif_lembur_per_jam" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tarif Lembur Umum per Jam (Rp)</label>
                                <input type="number" name="tarif_lembur_per_jam" value={formData.tarif_lembur_per_jam || 0} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" />
                            </div>
                        </>
                    )}
                    {formData.model_perhitungan === 'BULANAN' && (
                        <div>
                            <label htmlFor="potongan_tidak_masuk" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Potongan Gaji per Hari (Tidak Masuk)</label>
                            <input type="number" name="potongan_tidak_masuk" value={formData.potongan_tidak_masuk || 0} onChange={handleChange} className="mt-1 block w-full rounded-md dark:bg-gray-700" placeholder="Potong gaji tidak masuk!"/>
                        </div>
                    )}
                </form>
                <div className="pt-6 flex justify-end space-x-3 border-t dark:border-gray-700 mt-6">
                    <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
                    <button type="submit" onClick={handleSave} className="rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700">Simpan</button>
                </div>
            </div>
        </div>
    );
};

const ManajemenTipeGaji = () => {
    const [tipeGajiList, setTipeGajiList] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTipeGaji, setEditingTipeGaji] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchTipeGaji = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/tipegaji');
            setTipeGajiList(response.data);
            setError(null);
        } catch (err) {
            setError("Gagal memuat data tipe gaji.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTipeGaji();
    }, []);

    const handleTambahBaru = () => {
        setEditingTipeGaji(null);
        setIsModalOpen(true);
    };

    const handleEdit = (tipe) => {
        setEditingTipeGaji(tipe);
        setIsModalOpen(true);
    };

    const handleSave = async (formData) => {
        try {
            // Membuat salinan data untuk dimodifikasi
            const dataToSave = { ...formData };

            // Jika model bukan PER_JAM_BERTINGKAT, hapus aturan tarif
            if (dataToSave.model_perhitungan !== 'PER_JAM_BERTINGKAT') {
                delete dataToSave.aturan_tarif_per_jam;
            }

            if (dataToSave.id) {
                await apiClient.put(`/tipegaji/${dataToSave.id}`, dataToSave);
                toast.success('Tipe gaji berhasil diperbarui.');
            } else {
                await apiClient.post('/tipegaji', dataToSave);
                toast.success('Tipe gaji baru berhasil ditambahkan.');
            }
            setIsModalOpen(false);
            fetchTipeGaji();
        } catch (err) {
            console.error("Gagal menyimpan tipe gaji:", err);
            toast.error("Gagal menyimpan data. Periksa kembali isian Anda.");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus tipe gaji ini?")) {
            try {
                await apiClient.delete(`/tipegaji/${id}`);
                toast.success('Tipe gaji berhasil dihapus.');
                fetchTipeGaji();
            } catch (err) {
                console.error("Gagal menghapus tipe gaji:", err);
                toast.error(err.response?.data?.message || "Gagal menghapus data.");
            }
        }
    }

    if (loading) return <div className="flex justify-center items-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>;
    if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Manajemen Tipe Gaji</h2>
                <button onClick={handleTambahBaru} className="flex items-center gap-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 py-2 px-3 rounded-md">
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
                            <button onClick={() => handleEdit(tipe)} className="p-2 text-gray-500 hover:text-primary-600 dark:hover:text-primary-400">
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
