// src/Pages/Login.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { customToast } from "../../utils/customToast";
import "react-toastify/dist/ReactToastify.css";
// npm install react-toastify



export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
       e.preventDefault();
        
    try {
      const res = await fetch("http://localhost:9090/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: username,
          password: password,
        })
    });

      const data = await res.json();
      if (!data.success) {
        setError(data.message);
      } else {
        // Lưu token hoặc chuyển trang
        console.log("Đăng nhập thành công:", data.userData);
        customToast({
          type: "success",
          message: "Đăng nhập thành công!",
        });
        navigate("/"); // Hoặc route nào đó
      }
    } catch (err) {
      setError("Lỗi kết nối đến server.");
      customToast({
        type: "error",
        message: "Lỗi kết nối đến server. Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300 rounded-lg shadow">
        <h2 className="text-center text-2xl font-bold text-red-800 mb-6">
          Đăng nhập Cổng Dịch Vụ Công Quốc Gia
        </h2>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tên đăng nhập</label>
            <input
              type="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <a href="#" className="text-red-600 hover:text-red-500">
                Quên mật khẩu?
              </a>
            </div>
          </div>


            <button
              type="submit"
              className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded"
              
            >
              Đăng nhập
            </button>
            
            
          </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Chưa có tài khoản?{" "}
          <a href="/register" className="text-red-600 hover:text-red-500 font-medium">
            Đăng ký
          </a>
        </p>
      </div>
    </div>
  );
}
