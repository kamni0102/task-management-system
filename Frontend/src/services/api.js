import axios from 'axios';

const API = axios.create({
  baseURL: 'https://task-managaement-system.onrender.com', // Replace with your actual Render URL
});

// Interceptor to add JWT token automatically
API.interceptors.request.use((req) => {
  if (localStorage.getItem('userInfo')) {
    const { token } = JSON.parse(localStorage.getItem('userInfo'));
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;