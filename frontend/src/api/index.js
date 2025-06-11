import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL + '/api',
});

// Interceptor to add the token to every request
api.interceptors.request.use((config) => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
});

export default api;