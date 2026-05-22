import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api/v1`,
  withCredentials: true
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 Unauthorized, is not already retried, and is not a login/register request
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/login") &&
      !originalRequest.url?.includes("/users/register")
    ) {
      originalRequest._retry = true;
      try {
        // Trigger a background silent refresh token post request
        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/v1/users/refreshToken`,
          {},
          { withCredentials: true }
        );
        // If refresh succeeds, retry the original failed request
        return api(originalRequest);
      } catch (refreshError) {
        console.error("Token refresh failed. Redirecting to login...", refreshError);
        // Force redirect to login on failure
        window.location.replace("/login");
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;