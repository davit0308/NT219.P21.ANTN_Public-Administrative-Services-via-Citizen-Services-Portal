import { loginRequest, loginSuccess, loginFailure, registerFailure, registerRequest, registerSuccess, logoutRequest, logoutSuccess, logoutFailure } from "./authSlide";
import axios from "axios"; //npm install axios
import { resetApp } from "./resetAction";
import { customToast } from "../utils/customToast";
import { toast } from "react-toastify";

export const loginUser = async (user, dispatch, navigate) => {
    dispatch(loginRequest());
    try{
        const res = await axios.post("http://localhost:9090/api/login", user);

        const data = res.data;

        if (!data.success) {
            dispatch(loginFailure());
            alert("Đăng nhập thất bại", "error");
            return { status: false, message: data.message || "Đăng nhập thất bại" };
        }

        dispatch(loginSuccess(data));

        // Lưu token vào localStorage/sessionStorage nếu cần
        localStorage.setItem("token", data.token);
        console.log("Token đã được lưu:", data.token);

        // Thông báo thành công
        alert("Đăng nhập thành công", "success");

        // Điều hướng sau khi đăng nhập
        navigate("/");

        return { success: true };
    } catch (error) {
        dispatch(loginFailure());

        if (error.response) {
            // Server trả về lỗi (ví dụ: 400 hoặc 401)
            elert("Tên đăng nhập hoặc mật khẩu không đúng", "error");
            return {
                success: false,
                message: error.response.data.message || "Tên đăng nhập hoặc mật khẩu không đúng",
            };
        } else if (error.request) {
            elert("Không thể kết nối đến máy chủ. Vui lòng thử lại.", "error");

            return {
                success: false,
                message: "Không thể kết nối đến máy chủ. Vui lòng thử lại.",
            };
        } else {
            elert("Lỗi đăng nhập", "error");

            return {
                success: false,
                message: "Lỗi không xác định.",
            };
        }
    }
}

export const registerUser = async (user, dispatch, navigate) => {
    dispatch(registerRequest());
    const toastId = customToast("Registering...", "loading");
    try {
        await axios.post("/api/auth/register", user);
        dispatch(registerSuccess());
        toast.dismiss(toastId);
        sessionStorage.setItem("pendingEmail", user.email);
        navigate("/email-verify");
    } catch (error) {
        dispatch(registerFailure());
        toast.dismiss(toastId);
        if (error.response) {
            return { success: false, message: error.response.data.message || "Register failed" };
        } else if (error.request) {
            return { success: false, message: "Server did not respond. Please try again later." };
        } else {
            return { success: false, message: "An unexpected error occurred." };
        }
    }
}

export const logoutUser = async (dispatch, navigate) => {
    dispatch(logoutRequest());
    try {
        await axios.post("/api/auth/logout", {}, {
            withCredentials: true,
        });
        dispatch(logoutSuccess());
        dispatch(resetApp());
        navigate("/");
    } catch (error) {
        dispatch(logoutFailure());
    }
}