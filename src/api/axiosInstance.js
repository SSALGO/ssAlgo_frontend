import axios from 'axios';

const axiosInstance = axios.create({

  baseURL: import.meta.env.VITE_API_BASE_URL || '/',

  headers:{
    'Content-Type':'application/json'
    // 'Content-Type':'application/x-www-form-urlencoded'
  }

});

axiosInstance.interceptors.request.use((config) => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

export default axiosInstance;
