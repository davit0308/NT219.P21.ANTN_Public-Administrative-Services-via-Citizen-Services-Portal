import { useState } from "react";

export default function Passport() {
    const [form, setForm] = useState({
        fullname: "",
        dob: "",
        gender: "",
        nationality: "",
        idNumber: "",
        address: "",
        phone: "",
        email: "",
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Xử lý gửi form ở đây
        alert("Đã gửi thông tin!");
    };

    return (
        <div className="max-w-2xl mx-auto px-6 py-8 bg-white rounded-lg shadow">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Đăng ký cấp hộ chiếu</h1>
            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block font-medium mb-1">Họ và tên</label>
                    <input
                        type="text"
                        name="fullname"
                        value={form.fullname}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Ngày sinh</label>
                        <input
                            type="date"
                            name="dob"
                            value={form.dob}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Giới tính</label>
                        <select
                            name="gender"
                            value={form.gender}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                            <option value="">Chọn</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                            <option value="Khác">Khác</option>
                        </select>
                    </div>
                </div>
                <div>
                    <label className="block font-medium mb-1">Quốc tịch</label>
                    <input
                        type="text"
                        name="nationality"
                        value={form.nationality}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Số CCCD/CMND</label>
                    <input
                        type="text"
                        name="idNumber"
                        value={form.idNumber}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div>
                    <label className="block font-medium mb-1">Địa chỉ thường trú</label>
                    <input
                        type="text"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        required
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Số điện thoại</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block font-medium mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                    </div>
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition-colors"
                >
                    Gửi đăng ký
                </button>
            </form>
        </div>
    );
}
