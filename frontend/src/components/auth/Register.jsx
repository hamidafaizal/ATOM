import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Mail, Lock, Bot, Loader2, ArrowLeft } from 'lucide-react';
import apiClient from '../../api'; // Impor apiClient

/**
 * Komponen untuk halaman pendaftaran pengguna baru.
 */
const Register = ({ onNavigateToLogin, onRegisterSuccess }) => {
  const [formData, setFormData] = useState({
    namaPerusahaan: '',
    email: '',
    password: '',
    botToken: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // --- LOGIKA DIUBAH: MENGGUNAKAN PANGGILAN API SUNGGUHAN ---
    try {
      // Mengirim data pendaftaran ke endpoint backend
      await apiClient.post('/auth/register', formData);
      // Jika berhasil, panggil onRegisterSuccess untuk pindah halaman
      onRegisterSuccess(formData.email);
    } catch (err) {
      // Tangkap dan tampilkan error dari backend
      setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
    // --- AKHIR PERUBAHAN ---
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="absolute top-4 right-4">
        <button onClick={toggleTheme} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors">
          {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
        </button>
      </div>
      <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Buat Akun Baru</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Mulai kelola gaji karyawan Anda dengan ATOM.</p>
        </div>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Input Nama Perusahaan */}
          <div>
            <label htmlFor="namaPerusahaan" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Nama Perusahaan
            </label>
            <input
              id="namaPerusahaan"
              name="namaPerusahaan"
              type="text"
              required
              value={formData.namaPerusahaan}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
              placeholder="Contoh: PT. Sejahtera Abadi"
            />
          </div>
          {/* Input Email */}
          <div>
            <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Alamat Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
              placeholder="anda@perusahaan.com"
            />
          </div>
          {/* Input Password */}
          <div>
            <label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
              placeholder="••••••••"
            />
          </div>
          {/* Input Token Bot */}
          <div>
            <label htmlFor="botToken" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Token Bot Telegram
            </label>
            <input
              id="botToken"
              name="botToken"
              type="text"
              required
              value={formData.botToken}
              onChange={handleChange}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm"
              placeholder="Token dari @BotFather"
            />
          </div>

          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 mt-2 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail size={18} />}
              {loading ? 'Memproses...' : 'Daftar & Kirim Verifikasi'}
            </button>
          </div>
        </form>
        <div className="text-center">
            <button onClick={onNavigateToLogin} className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                <span className="flex items-center justify-center gap-2">
                    <ArrowLeft size={16} />
                    Kembali ke Halaman Login
                </span>
            </button>
        </div>
      </div>
    </div>
  );
};

export default Register;
