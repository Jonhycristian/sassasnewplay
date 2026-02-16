import axios from 'axios';

const api = axios.create({
    // Se estiver rodando localmente (vite dev), usa localhost.
    // Se estiver em produção (Netlify), usa /api que o toml redireciona.
    baseURL: import.meta.env.DEV ? 'http://localhost:5000/api' : '/api',
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Add a response interceptor to handle auth errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
