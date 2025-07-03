import React, { createContext, useState, useEffect, useContext } from 'react';

// Membuat Context untuk tema
const ThemeContext = createContext();

// Hook kustom untuk menggunakan ThemeContext
export const useTheme = () => useContext(ThemeContext);

// Komponen Provider untuk membungkus aplikasi
export const ThemeProvider = ({ children }) => {
  // State untuk menyimpan tema saat ini, mengambil dari localStorage atau default ke 'light'
  const [theme, setTheme] = useState(() => {
    // Memeriksa tema yang tersimpan di localStorage
    const savedTheme = localStorage.getItem('theme');
    // Memeriksa preferensi sistem pengguna
    const userPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return savedTheme || (userPrefersDark ? 'dark' : 'light');
  });

  // useEffect untuk menerapkan perubahan tema ke elemen <html>
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark'); // Hapus kelas tema sebelumnya
    root.classList.add(theme); // Tambahkan kelas tema saat ini
    localStorage.setItem('theme', theme); // Simpan tema ke localStorage
  }, [theme]);

  // Fungsi untuk mengganti tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
