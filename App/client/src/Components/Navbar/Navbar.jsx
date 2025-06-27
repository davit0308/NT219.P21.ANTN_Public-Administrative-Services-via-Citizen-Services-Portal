import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

export default function NavbarMenu() {
  return (
    <div className="bg-gray-100 border-t border-gray-300">
      <div className="px-4">
        <div className="flex items-center space-x-6 py-2 text-lg font-medium text-gray-700 ml-10">
          <Link to="/" className="flex items-center gap-1 hover:text-red-700">
            <FaHome className="text-red-700" /> Trang chủ
          </Link>
          <Link to="/passport" className="hover:text-red-700">Chờ xác thực</Link>
          <Link to="/identitycard" className="hover:text-red-700">Đã xác thực</Link>
          <Link to="/signed-documents" className="hover:text-red-700">📄 Tài liệu đã ký</Link>
          <Link to="/support" className="hover:text-red-700">Hỗ trợ</Link>
        </div>
      </div>
    </div>
  );
}