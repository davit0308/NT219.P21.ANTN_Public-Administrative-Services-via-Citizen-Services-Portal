import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

export default function Navbar() {
  return (
    <nav className="relative top-0 w-full z-50 bg-white shadow border-b border-gray-300">
      <div className="px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/icon.png" alt="Logo" className="h-12 w-auto" />
          <div className="leading-tight">
            <h1 className="text-xl font-bold text-red-800 uppercase">Citizen Services Portal</h1>
            <p className="text-sm text-gray-600">Connect, provide information and public services anytime, anywhere</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link to="/register" className="border-2 border-[#ce7a58] text-black px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium">Sign up</Link>
          <Link to="/login" className="border-2 border-[#ce7a58] text-black px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium">Sign in</Link>
        </div>
      </div>
      <div className="bg-gray-100 border-t border-gray-300">
        <div className="px-4">
          <div className="flex items-center space-x-6 py-2 text-lg font-medium text-gray-700">
            <Link to="/" className="flex items-center gap-1 hover:text-red-700">
              <FaHome className="text-red-700" /> Home
            </Link>
            <Link to="/passport" className="hover:text-red-700">Passport issuance</Link>
            <Link to="/identitycard" className="hover:text-red-700">Citizen identification card issuance</Link>
            <Link to="/support" className="hover:text-red-700">Support</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
