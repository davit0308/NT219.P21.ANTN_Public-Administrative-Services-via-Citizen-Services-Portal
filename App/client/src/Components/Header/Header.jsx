import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <div className="px-4 py-3 flex justify-between items-center">
      <div className="flex items-center gap-4">
        <img src="/icon.png" alt="Logo" className="h-12 w-auto ml-10" />
        <div className="leading-tight">
          <h1 className="text-5xl font-bold text-red-800 uppercase">Cổng dịch vụ công</h1>
          <p className="text-base text-gray-600 mt-1">
            Connect, provide information and public services anytime, anywhere
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Link
          to="/register"
          className="no-underline text-black border-2 border-[#ce7a58] px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium"
        >
          Sign up
        </Link>
        <Link
          to="/login"
          className="no-underline text-black border-2 border-[#ce7a58] px-5 py-2 rounded hover:bg-[#ce7a58] hover:text-white cursor-pointer mr-5 font-medium"
        >
          Sign in
        </Link>
      </div>
    </div>
  );
}