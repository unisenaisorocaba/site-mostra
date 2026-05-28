import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://ha4kdk8yh0.execute-api.sa-east-1.amazonaws.com/dev',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de requisição para injetar o Token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta para lidar com falhas de autenticação globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Limpa a sessão se o token expirar ou for inválido
      localStorage.removeItem('token');
      // Redireciona para o login apenas se não estiver na home pública
      if (window.location.pathname.startsWith('/dashboard')) {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
