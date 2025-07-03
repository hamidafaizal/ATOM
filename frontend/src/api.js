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
apiClient.interceptors.request.use(
  (config) => {
    // DIUBAH: Mengambil token dari sessionStorage agar konsisten
    const token = sessionStorage.getItem('authToken');
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export default apiClient;
