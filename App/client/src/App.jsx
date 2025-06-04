import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useState } from 'react';
import Navbar from './Components/Navbar/Navbar';
import OfficerNavbar from './Components/OfficerDashboard/OfficerNavbar'; // Tạo file này cho navbar cán bộ
import Home from './Components/Home/Home';
import IdentityCard from './Components/IdentityCard/IdentityCard';
import Passport from './Components/Passport/Passport';
import Login from './Components/Login/Login';
import Register from './Components/Register/Register';
import Header from './Components/Header/Header';
import Footer from './Components/Footer/Footer';
import OfficerDashboard from './Components/OfficerDashboard/OfficerDashboard';

function AppContent() {
  const [role, setRole] = useState(null); // null | 'citizen' | 'officer'
  const location = useLocation();

  // Kiểm tra nếu đang ở route officer
  const isOfficerRoute = location.pathname.startsWith('/officer');

  return (
    <>
      <Header />
      {isOfficerRoute ? <OfficerNavbar /> : <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/identitycard" element={<IdentityCard />} />
        <Route path="/passport" element={<Passport />} />
        <Route path="/login" element={<Login setRole={setRole} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/officer"
          element={
            // role === "officer" ? (
            <OfficerDashboard />
            // ) : (
            //   <div className="text-center py-20 text-red-600 font-bold text-xl">
            //     Bạn không có quyền truy cập trang này.
            //   </div>
            // )
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
