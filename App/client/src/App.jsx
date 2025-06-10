// import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
// import { useState } from 'react';
// import Navbar from './Components/Navbar/Navbar';
// import OfficerNavbar from './Components/OfficerDashboard/OfficerNavbar'; // Tạo file này cho navbar cán bộ
// import Home from './Components/Home/Home';
// import IdentityCard from './Components/IdentityCard/IdentityCard';
// import Passport from './Components/Passport/Passport';
// import Login from './Components/Login/Login';
// import Register from './Components/Register/Register';
// import Header from './Components/Header/Header';
// import Footer from './Components/Footer/Footer';
// import OfficerDashboard from './Components/OfficerDashboard/OfficerDashboard';

// function AppContent() {
//   const [role, setRole] = useState(null); // null | 'citizen' | 'officer'
//   const location = useLocation();

//   // Kiểm tra nếu đang ở route officer
//   const isOfficerRoute = location.pathname.startsWith('/officer');

//   return (
//     <>
//       <Header />
//       {isOfficerRoute ? <OfficerNavbar /> : <Navbar />}
//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/identitycard" element={<IdentityCard />} />
//         <Route path="/passport" element={<Passport />} />
//         <Route path="/login" element={<Login setRole={setRole} />} />
//         <Route path="/register" element={<Register />} />
//         <Route
//           path="/officer"
//           element={
//             // role === "officer" ? (
//             <OfficerDashboard />
//             // ) : (
//             //   <div className="text-center py-20 text-red-600 font-bold text-xl">
//             //     Bạn không có quyền truy cập trang này.
//             //   </div>
//             // )
//           }
//         />
//       </Routes>
//       <Footer />
//     </>
//   );
// }

// export default function App() {
//   return (
//     <Router>
//       <AppContent />
//     </Router>
//   );
// }
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Components/Navbar/Navbar';
import OfficerNavbar from './Components/OfficerDashboard/OfficerNavbar';
import Home from './Components/Home/Home';
import IdentityCard from './Components/IdentityCard/IdentityCard';
import Passport from './Components/Passport/Passport';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Support from './Components/Login/Login';

import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import OfficerDashboard from './Components/OfficerDashboard/OfficerDashboard';
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { logoutUser } from "./redux/apiRequest";
import { useNavigate } from "react-router-dom";
import { startTokenRefreshInterval } from "./api/tokenManager";


function AppContent() {
  const location = useLocation();
  const isLoggedIn = useSelector((state) => state.auth.login.currentUser);
  const user = useSelector((state) => state.auth.login?.currentUser);
  const isOfficerRoute = location.pathname.startsWith('/officer');
  const isOfficer = user?.userData.admin;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // TỰ ĐỘNG LOGOUT NẾU TOKEN KHÔNG CÒN
  useEffect(() => {
    const accessToken = localStorage.getItem("token");
    if (!accessToken && isLoggedIn) {
      logoutUser(dispatch, navigate);
    }
  }, [isLoggedIn, dispatch, navigate]);

    useEffect(() => {
      startTokenRefreshInterval(); // Bắt đầu kiểm tra tự động
    }, []);
  // Lấy role từ user trong Redux store nếu đã login
  const role = isLoggedIn?.role || null;

  return (
    <>
      <Header />
      {isOfficer ? <OfficerNavbar /> : <Navbar />}

      <Routes>
        {/* Trang public cho tất cả */}
        <Route path="/" element={<Home />} />
        <Route path="/support" element={<Support />} /> {/* Tạm thời dẫn tới login*/}

        <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />


        

        /* Trang officer — cần đăng nhập và role === 'officer' */
        <Route
          path="/officer"
          element={
            isLoggedIn ? (
              isOfficer ? (
                <>
                  <Navigate to="/officer" />
                  <OfficerDashboard />
                </>
              ) : (
                <div className="text-center py-20 text-red-600 font-bold text-xl">
                  Bạn không có quyền truy cập trang này.
                </div>
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Các trang citizen — cần đăng nhập */}
        <Route
          path="/"
          element={
            isLoggedIn && !isOfficer ? (
              <Passport />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/identitycard"
          element={
            isLoggedIn && !isOfficer ? (
              <IdentityCard />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/passport"
          element={
            isLoggedIn && !isOfficer ? (
              <Passport />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>

      <Footer />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
