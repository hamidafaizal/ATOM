import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Toaster } from 'react-hot-toast'; // DITAMBAHKAN

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        {/* DITAMBAHKAN: Komponen untuk menampilkan notifikasi */}
        <Toaster 
          position="top-center"
          reverseOrder={false}
        />
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
