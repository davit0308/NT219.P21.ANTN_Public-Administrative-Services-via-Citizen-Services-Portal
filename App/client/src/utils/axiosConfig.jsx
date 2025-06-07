import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { logoutUser } from "../redux/apiRequest";

const refreshToken = async () => {
    try {
        const res = await axios.post("/api/auth/refresh", {}, {
            withCredentials: true,
        });
        return res.data;
    } catch (err) {
        console.error("Error refreshing token:", err);
        throw new Error("Failed to refresh token");
    }
};

export const createAxios = (user, dispatch, stateSuccess, navigate) => {
    const newInstance = axios.create();

    newInstance.interceptors.request.use(
        async (config) => {
            const currentDate = new Date();
            const decodedToken = jwtDecode(user?.access_token);

            if (decodedToken.exp < currentDate.getTime() / 1000) {
                try {
                    const data = await refreshToken();
                    const updatedUser = {
                        ...user,
                        access_token: data.access_token,
                    };
                    dispatch(stateSuccess(updatedUser));
                    config.headers["Authorization"] = "Bearer " + data.access_token;

                } catch (err) {
                    alert("Session expired. Please log in again.");
                    logoutUser(dispatch, navigate);
                }
            } else {
                config.headers["Authorization"] = "Bearer " + user.access_token;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    return newInstance;
};
