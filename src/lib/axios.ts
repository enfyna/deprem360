import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
    baseURL: "https://engaging-solely-maggot.ngrok-free.app", // Your backend base URL
    // withCredentials: true, // This is important if your backend sets HTTP-only cookies
});


// Request interceptor to add the JWT token to headers
api.interceptors.request.use(
    (config) => {
        const token = Cookies.get("jwt_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        config.headers['ngrok-skip-browser-warning'] = '69420';
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling token expiration or other auth issues
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            console.log("Token expired or invalid. Redirecting to login...");
            // Clear the invalid token
            Cookies.remove("jwt_token");
            Cookies.remove("user_id");
            // Redirect to login page
            window.location.href = "/login"; // Use window.location for full page reload for auth redirects
        }
        return Promise.reject(error);
    }
);

export default api;
