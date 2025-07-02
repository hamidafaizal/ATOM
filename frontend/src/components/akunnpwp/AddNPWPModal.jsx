import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

// Menggunakan komponen input file standar yang sudah berfungsi
const FileInput = ({ label, id, onChange, error, fileName }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      id={id}
      name={id}
      type="file"
      accept="image/png, image/jpeg"
      onChange={onChange}
      className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
    />
    {fileName && <p className="mt-1 text-sm text-green-600">File dipilih: {fileName}</p>}
    {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
  </div>
);

const AddNPWPModal = ({ isOpen, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({ namaPemilik: '', nomerRekening: '', emailPemilik: '' });
  const [files, setFiles] = useState({ fotoNpwp: null, fotoKtp: null, fotoRekening: null });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleTextChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };
  
  const handleFileChange = (e) => {
    setFiles(prev => ({ ...prev, [e.target.id]: e.target.files[0] }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    const dataToSend = new FormData();
    dataToSend.append('namaPemilik', formData.namaPemilik);
    dataToSend.append('nomerRekening', formData.nomerRekening);
    dataToSend.append('emailPemilik', formData.emailPemilik);
    if(files.fotoNpwp) dataToSend.append('fotoNpwp', files.fotoNpwp);
    if(files.fotoKtp) dataToSend.append('fotoKtp', files.fotoKtp);
    if(files.fotoRekening) dataToSend.append('fotoRekening', files.fotoRekening);
    
    try {
      await axios.post(`${API_URL}/akun-npwp`, dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Data berhasil disimpan!');
      onSaveSuccess();
      onClose();
    } catch (error) {
      if (error.response && error.response.status === 422) {
        setErrors(error.response.data.errors);
        alert('Terdapat kesalahan pada input Anda. Silakan periksa kembali.');
      } else {
        console.error("Gagal menyimpan data:", error);
        alert('Terjadi kesalahan saat menyimpan data ke server.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 m-4 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between"><h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tambah Akun NPWP Baru</h3><button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button></div>
        <form onSubmit={handleFormSubmit} className="mt-4 space-y-4">
          <FileInput label="Foto NPWP" id="fotoNpwp" onChange={handleFileChange} error={errors.fotoNpwp?.[0]} fileName={files.fotoNpwp?.name} />
          <FileInput label="Foto KTP" id="fotoKtp" onChange={handleFileChange} error={errors.fotoKtp?.[0]} fileName={files.fotoKtp?.name} />
          <FileInput label="Foto Buku Rekening" id="fotoRekening" onChange={handleFileChange} error={errors.fotoRekening?.[0]} fileName={files.fotoRekening?.name} />
          <div>
            <label htmlFor="namaPemilik" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nama Pemilik</label>
            <input type="text" id="namaPemilik" value={formData.namaPemilik} onChange={handleTextChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
            {errors.namaPemilik && <p className="mt-1 text-xs text-red-500">{errors.namaPemilik[0]}</p>}
          </div>
          <div>
            <label htmlFor="nomerRekening" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nomer Rekening</label>
            <input type="text" id="nomerRekening" value={formData.nomerRekening} onChange={handleTextChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
            {errors.nomerRekening && <p className="mt-1 text-xs text-red-500">{errors.nomerRekening[0]}</p>}
          </div>
          <div>
            <label htmlFor="emailPemilik" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email Pemilik</label>
            <input type="email" id="emailPemilik" value={formData.emailPemilik} onChange={handleTextChange} className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
            {errors.emailPemilik && <p className="mt-1 text-xs text-red-500">{errors.emailPemilik[0]}</p>}
          </div>
          <div className="pt-4 flex justify-end space-x-3">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Batal</button>
            <button type="submit" disabled={isSubmitting} className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : 'Simpan'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNPWPModal;
