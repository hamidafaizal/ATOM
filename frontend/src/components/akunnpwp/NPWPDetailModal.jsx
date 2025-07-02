import React from 'react';
import { X, Copy, Download } from 'lucide-react';

const STORAGE_URL = 'http://localhost:8000/storage';

const NPWPDetailModal = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`Teks disalin: ${text}`);
    }).catch(err => {
      console.error('Gagal menyalin teks: ', err);
    });
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h4>
      <div className="mt-1 flex items-center justify-between">
        <p className="text-gray-900 dark:text-white truncate">{value}</p>
        <button 
          onClick={() => copyToClipboard(value)}
          className="p-1 text-gray-400 hover:text-blue-500 rounded-md transition-colors"
          title={`Salin ${label}`}
        >
          <Copy size={16} />
        </button>
      </div>
    </div>
  );

  const ImagePreview = ({ label, path }) => {
    const imageUrl = `${STORAGE_URL}/${path.replace('public/', '')}`;
    return (
      <div className="relative group">
        <img src={imageUrl} alt={label} className="h-32 w-full object-cover rounded-md bg-gray-100 dark:bg-gray-700"/>
        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <h4 className="text-xs font-bold text-white bg-black bg-opacity-50 px-2 py-1 rounded">{label}</h4>
          <a href={imageUrl} download className="mt-2 p-2 bg-blue-600 text-white rounded-full shadow-lg" title={`Download ${label}`}>
            <Download size={20} />
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div className="relative w-full max-w-lg rounded-lg bg-white dark:bg-gray-800 shadow-xl p-6 m-4 overflow-y-auto max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between pb-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Detail Akun: {data.nama_pemilik}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white"><X size={24} /></button>
        </div>
        
        <div className="mt-4 space-y-4">
          <DetailItem label="Nama Pemilik" value={data.nama_pemilik} />
          <DetailItem label="Nomer Rekening" value={data.nomer_rekening} />
          <DetailItem label="Email Pemilik" value={data.email_pemilik} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t dark:border-gray-700">
            <ImagePreview label="Foto NPWP" path={data.foto_npwp_path} />
            <ImagePreview label="Foto KTP" path={data.foto_ktp_path} />
            <ImagePreview label="Foto Buku Rekening" path={data.foto_buku_rekening_path} />
          </div>

          <div className="pt-4 flex justify-end">
            <button type="button" onClick={onClose} className="rounded-md border border-gray-300 bg-white dark:bg-gray-700 dark:border-gray-600 py-2 px-4 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Tutup</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPWPDetailModal;
