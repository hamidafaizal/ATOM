import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:3001/api',
});

// Interceptor BARU: Menggunakan token JWT untuk otentikasi
apiClient.interceptors.request.use(
  (config) => {
    // Mengambil token dari localStorage
    const token = localStorage.getItem('authToken');
    
    // Jika token ada, tambahkan ke header Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Menambahkan interceptor untuk response (opsional tapi sangat berguna)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Jika mendapat error 401 (Unauthorized), otomatis logout pengguna
    if (error.response && error.response.status === 401) {
      // Hapus token dan refresh halaman untuk kembali ke login
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);


export default apiClient;
