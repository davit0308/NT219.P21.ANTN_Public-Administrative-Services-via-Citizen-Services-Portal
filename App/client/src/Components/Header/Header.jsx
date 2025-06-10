import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { logoutUser } from "../../redux/apiRequest";
import { logoutSuccess } from "../../redux/authSlide";
import { createAxios } from "../../utils/axiosConfig";

export default function Header() {
  const isLoggedIn = useSelector((state) => state.auth.login.currentUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  let axiosJWT = createAxios(isLoggedIn, dispatch, logoutSuccess);

  const handleLogout = () => {
        const res = logoutUser(dispatch, navigate);
        // try {
        //     if (res) {
        //         alert("Logout successfully!", "success", "top-right", 3000);
        //     }
        // }
        // catch (error) {
        //     alert("Logout failed!", "error", "top-right", 3000);
        // }
    }
  return (
    <div className="px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src="/icon.png" alt="Logo" className="h-12 w-auto ml-10" />
        <div className="leading-tight">
          <h1 className="text-5xl font-bold text-red-800 uppercase">Cổng dịch vụ công</h1>
          <p className="text-base text-gray-600 mt-1">
            Cung cấp dịch vụ công mọi lúc, mọi nơi. An toàn, thân thiện với công dân
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        {!isLoggedIn && (
          <>
            <Link
              to="/register"
              className="no-underline text-black border-2 border-[#ce7a58] px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium"
            >
              Đăng ký
            </Link>
            <Link
              to="/login"
              className="no-underline text-black border-2 border-[#ce7a58] px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium"
            >
              Đăng nhập
            </Link>
          </>
        )}
        {isLoggedIn && (
          <Link
            to="/"
            className="no-underline text-black border-2 border-[#ce7a58] px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium"
            onClick={handleLogout}
          >
            Đăng xuất
          </Link>
        )}
      </div>
    </div>
  );
}