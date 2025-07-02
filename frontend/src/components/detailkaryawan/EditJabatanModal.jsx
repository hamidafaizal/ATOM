import React, { useState } from 'react';
import { X } from 'lucide-react';

const EditJabatanModal = ({ isOpen, onClose, onSave, currentJabatan, karyawanNama }) => {
  const [jabatan, setJabatan] = useState(currentJabatan || '');

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(jabatan);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="relative w-full max-w-md rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 m-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between pb-4 border-b dark:border-gray-700">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Jabatan
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{karyawanNama}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor="jabatan" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Jabatan Baru
            </label>
            <input 
              type="text" 
              id="jabatan" 
              value={jabatan} 
              onChange={(e) => setJabatan(e.target.value)} 
              className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              autoFocus
            />
          </div>
        </div>

        <div className="pt-6 flex justify-end space-x-3">
          <button 
            type="button" 
            onClick={onClose} 
            className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
          >
            Batal
          </button>
          <button 
            type="button"
            onClick={handleSave}
            className="rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditJabatanModal;
