import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx'; // DITAMBAHKAN

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider>
      {/* DITAMBAHKAN: Membungkus App dengan AuthProvider */}
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>,
)
