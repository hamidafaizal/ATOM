import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Loader2, KeyRound } from 'lucide-react';
import apiClient from '../../api';
import toast from 'react-hot-toast'; // Pastikan toast diimpor

const VerifyEmail = ({ email, onNavigateToLogin }) => {
  const [code, setCode] = useState(new Array(6).fill(""));
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const { value } = e.target;
    if (!/^[0-9]$/.test(value) && value !== "") return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };
  
  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasteData) {
        const newCode = [...code];
        pasteData.split('').forEach((char, index) => {
            if(index < 6) newCode[index] = char;
        });
        setCode(newCode);
        inputsRef.current[Math.min(pasteData.length - 1, 5)].focus();
    }
  };

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const verificationCode = code.join('');
    
    try {
      await apiClient.post('/auth/verify-email', { email, token: verificationCode });
      
      // DIUBAH: Menggunakan toast.success alih-alih alert()
      toast.success('Verifikasi berhasil! Anda akan diarahkan ke halaman login.');

      setTimeout(() => {
        onNavigateToLogin();
      }, 1500);

    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verifikasi gagal. Kode salah atau sudah kedaluwarsa.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    setLoading(true);
    setError(null);
    try {
        // await apiClient.post('/auth/resend-verification', { email });
        toast.success(`(Simulasi) Kode baru telah dikirim ke ${email}.`);
    } catch (err) {
        const errorMessage = err.response?.data?.message || 'Gagal mengirim ulang kode.';
        setError(errorMessage);
        toast.error(errorMessage);
    } finally {
        setLoading(false);
    }
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
          <h1 className="text-3xl font-bold text-primary-600 dark:text-primary-400">Verifikasi Email</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">
            Kami telah mengirim kode 6 digit ke <span className="font-semibold text-gray-700 dark:text-gray-300">{email}</span>.
          </p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-2" onPaste={handlePaste}>
            {code.map((digit, index) => (
              <input
                key={index}
                ref={el => inputsRef.current[index] = el}
                type="text"
                maxLength="1"
                value={digit}
                onChange={(e) => handleChange(e, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-14 text-center text-2xl font-semibold bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            ))}
          </div>
          
          {error && (
            <div className="text-sm text-red-600 dark:text-red-400 text-center pt-4">{error}</div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              disabled={loading || code.join('').length < 6}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <KeyRound size={18} />}
              {loading ? 'Memverifikasi...' : 'Verifikasi'}
            </button>
          </div>
        </form>
         <div className="text-center text-sm text-gray-500 dark:text-gray-400">
            Tidak menerima kode?{' '}
            <button onClick={handleResendCode} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                Kirim ulang
            </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
