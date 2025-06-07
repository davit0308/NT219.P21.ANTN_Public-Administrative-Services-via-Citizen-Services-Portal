// src/Pages/Register.jsx
export default function Register() {
  const clickDangKy= async (e) => {
      e.preventDefault();

      alert("Không thể đăng ký! Vui lòng sử dụng tài khoản chứng thực mức 2")

  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full bg-white p-8 border border-gray-300 rounded-lg shadow">
        <h2 className="text-center text-2xl font-bold text-red-800 mb-6">
          Đăng ký tài khoản
        </h2>
        <form className="space-y-5" onSubmit={clickDangKy}>
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              type="text"
              //required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              //required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              //required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
            <input
              type="password"
              //required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-red-500 focus:border-red-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-red-700 hover:bg-red-800 text-white font-semibold py-2 px-4 rounded"
          >
            Đăng ký
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          {/* Đã có tài khoản?{" "} */}
          Để sử dụng cổng dịch vụ công
          <p href="/login" className="text-red-600 hover:text-red-500 font-medium">
            Vui lòng sử dụng tài khoản chứng thực mức 2!
          </p>
        </p>
      </div>
    </div>
  );
}
