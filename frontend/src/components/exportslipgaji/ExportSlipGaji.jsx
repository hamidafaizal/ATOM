import React, { useState, useEffect } from 'react';
import { Download, Printer, CheckCircle, Clock, Loader2 } from 'lucide-react';
import apiClient from '../../api';
import toast from 'react-hot-toast';

const ExportSlipGaji = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSlipStatus = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/gaji/slip-status');
        setKaryawanList(response.data);
      } catch (error) {
        console.error("Gagal mengambil status slip gaji:", error);
        toast.error("Gagal memuat data karyawan.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlipStatus();
  }, []);

  // Fungsi dummy untuk handle download
  const handleDownload = (nama) => {
    toast.success(`(Simulasi) Mengunduh slip gaji untuk: ${nama}`);
  };

  const handleDownloadSemua = () => {
    toast.success('(Simulasi) Mengunduh semua slip gaji yang tersedia.');
  };

  return (
    <div className="p-6 md:p-8 font-sans">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Export Slip Gaji
          </h1>
          <p className="mt-1 text-gray-500 dark:text-gray-400">
            Pilih dan unduh slip gaji karyawan untuk periode ini.
          </p>
        </div>
        <button
          onClick={handleDownloadSemua}
          className="mt-4 md:mt-0 flex items-center gap-2 bg-primary-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:bg-primary-700 transition-colors"
        >
          <Printer size={18} />
          <span>Download Semua</span>
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700/50 shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">NAMA KARYAWAN</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">JABATAN</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300">STATUS</th>
                <th className="p-4 font-semibold text-sm text-gray-600 dark:text-gray-300 text-right">AKSI</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center p-8">
                    <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span>Memuat data...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                karyawanList.map((karyawan) => (
                  <tr key={karyawan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <td className="p-4 whitespace-nowrap">
                      <p className="font-medium text-gray-900 dark:text-white">{karyawan.nama}</p>
                    </td>
                    <td className="p-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{karyawan.jabatan}</td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-full text-xs font-medium ${
                        karyawan.status === 'Tersedia'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                      }`}>
                        {karyawan.status === 'Tersedia' ? <CheckCircle size={12} /> : <Clock size={12} />}
                        {karyawan.status}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => handleDownload(karyawan.nama)}
                        disabled={karyawan.status !== 'Tersedia'}
                        className="flex items-center gap-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-auto"
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExportSlipGaji;