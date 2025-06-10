import { jwtDecode } from "jwt-decode";
import api from "./axiosInstance";

export function startTokenRefreshInterval() {
  const checkAndRefresh = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const decoded = jwtDecode(token);
      const exp = decoded.exp; // unix timestamp (seconds)
      const now = Math.floor(Date.now() / 1000); // current time (seconds)

      const secondsLeft = exp - now;
      if (secondsLeft == 30 ){
        console.log(`Access token expires in ${secondsLeft}s`);
      }
      // Nếu còn dưới 30s thì refresh
      if (secondsLeft < 30) {
        console.log("Refreshing access token...");

        const res = await api.post("/refresh-token");
        const newToken = res.data.token;

        localStorage.setItem("token", newToken);
        console.log("Access token refreshed.");
      }
    } catch (err) {
      console.error("Token invalid or refresh failed:", err);
    }
  };

  // Kiểm tra mỗi 10 giây
  setInterval(checkAndRefresh, 10000);
}
