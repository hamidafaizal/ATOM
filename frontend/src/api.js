import axios from 'axios';

// Membuat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api', // Semua request akan diawali dengan path ini
});

// Interceptor: Kode ini akan berjalan SEBELUM setiap request dikirim
apiClient.interceptors.request.use(
  (config) => {
    // Mengambil data user yang tersimpan di localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    
    // Jika user ada dan memiliki ID, tambahkan ID tersebut ke header
    if (user && user.id) {
      config.headers['x-user-id'] = user.id;
    }
    
    return config; // Lanjutkan request dengan header yang sudah ditambahkan
  },
  (error) => {
    // Lakukan sesuatu jika ada error pada konfigurasi request
    return Promise.reject(error);
  }
);

export default apiClient;
