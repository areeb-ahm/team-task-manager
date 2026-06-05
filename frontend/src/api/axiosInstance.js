import axios from 'axios';

// Set baseURL dynamically:
// In dev: leave empty so Vite's proxy (vite.config.js) catches '/api'
// In prod: use the real Cloud Run backend URL
const isProd = import.meta.env.PROD; // Vite built-in boolean
const API_URL = isProd ? import.meta.env.VITE_API_URL : '';

// Create an Axios instance configured for our backend
const axiosInstance = axios.create({
  baseURL: API_URL,
  
  // CRITICAL: withCredentials: true ensures that the session cookie (connect.sid)
  // is automatically attached and sent with every cross-origin or proxy request.
  // Without this, the backend will not recognize the user's session and 
  // authentication will silently fail.
  withCredentials: true,
  
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    // Any status code within the range of 2xx triggers this function
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx trigger this function
    
    // Note: If error.response?.status === 401, we intentionally DO NOT 
    // force a window.location redirect here. We let the calling code 
    // (like AuthContext) catch the error and update React state gracefully.
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
