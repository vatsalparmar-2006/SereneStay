import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    // If request is successful, just return the response
    return response;
  },
  (error) => {
    // If the backend returns 401, it means the token is invalid or expired
    if (error.response && error.response.status === 401) {
      console.warn("Session expired or unauthorized. Redirecting to login...");
      
      // Clear storage so the app knows the user is logged out
      localStorage.clear();
      
      // Force redirect to login page
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

export default api;