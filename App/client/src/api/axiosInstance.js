// src/api/axiosInstance.js
import axios from "axios";
import { store } from "../redux/store"; 
import { logoutUser } from "../redux/apiRequest"; 
// Tạo một instance của axios
const api = axios.create({
    baseURL: "http://localhost:9090/api",
    withCredentials: true // Gửi cookie (refresh_token) nếu có
});

// Interceptor gửi token vào header mỗi khi gọi API
api.interceptors.request.use(config => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor xử lý khi access token hết hạn
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post("http://localhost:9090/api/refresh-token", {}, {
          withCredentials: true
        });

        const newToken = res.data.token;
        localStorage.setItem("token", newToken);
        originalRequest.headers["Authorization"] = "Bearer " + newToken;

        return api(originalRequest);
      }  catch (refreshError) {
        console.error("Refresh token hết hạn hoặc không hợp lệ:", refreshError);

        // TỰ ĐỘNG LOGOUT
        logoutUser(store.dispatch, null);
        // store.dispatch(logoutUser(store.dispatch, history.push)); // nếu logoutUser có navigate
        localStorage.removeItem("token");

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
