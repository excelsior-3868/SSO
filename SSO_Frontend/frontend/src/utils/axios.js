import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  withCredentials: true, // important to send cookies
});

// Request interceptor to attach access token from cookie
api.interceptors.request.use((config) => {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  const token = getCookie("access_token");
  if (token) config.headers["Authorization"] = `Bearer ${token}`;
  return config;
});

// Response interceptor to handle 401 errors (token expired)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;
      try {
        // Call refresh endpoint
        const res = await axios.post(
          "http://localhost:8000/api/refresh/",
          {},
          { withCredentials: true }
        );

        const newAccess = res.data.access_token;

        // Update Authorization header for original request
        originalRequest.headers["Authorization"] = `Bearer ${newAccess}`;

        // Retry original request
        return axios(originalRequest);
      } catch (err) {
        // If refresh also fails, user must log in again
        console.error("Refresh token failed", err);
        window.location.href = "/login"; // redirect to login
      }
    }
    return Promise.reject(error);
  }
);

export default api;
