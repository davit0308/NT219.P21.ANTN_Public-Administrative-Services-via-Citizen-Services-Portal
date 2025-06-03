import { useState } from 'react';

export default function Passport() {
    const [step, setStep] = useState(2);

    const handleNextStep = () => setStep(prev => prev + 1);

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 flex justify-center items-start">
            <div className="max-w-4xl w-full bg-white p-8 rounded-lg shadow border border-gray-300">
                <h2 className="text-center text-2xl font-bold text-red-800 mb-6">
                    Đăng ký cấp Hộ chiếu
                </h2>

                <div className="flex justify-between mb-8">
                    {['Đăng ký/Đăng nhập', 'Lựa chọn DVC', 'Nộp hồ sơ trực tuyến', 'Theo dõi kết quả', 'Nhận kết quả'].map((label, index) => (
                        <div key={index} className={`text-center w-1/5 ${step === index + 1 ? 'font-bold text-indigo-600' : 'text-gray-500'}`}>
                            <div className="text-sm mb-1">{index + 1}</div>
                            <div className="text-xs">{label}</div>
                        </div>
                    ))}
                </div>

                {step === 2 && (
                    <form className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700">Chọn trường hợp hồ sơ</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cơ quan giải quyết hồ sơ</label>
                            <select className="w-full border rounded-md px-3 py-2">
                                <option>Cục Quản lý xuất nhập cảnh</option>
                                <option>Phòng Quản lý xuất nhập cảnh Công an tỉnh/thành phố</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Trường hợp giải quyết</label>
                            <select className="w-full border rounded-md px-3 py-2">
                                <option>5 ngày làm việc - Cấp hộ chiếu phổ thông cho người đủ từ 14 tuổi</option>
                                <option>5 ngày làm việc - Cấp hộ chiếu phổ thông cho trẻ em dưới 14 tuổi</option>
                            </select>
                        </div>
                        <button type="button" onClick={handleNextStep} className="mt-4 rounded-md bg-blue-600 text-white px-4 py-2 hover:bg-blue-500">Đồng ý và tiếp tục</button>
                    </form>
                )}

                {step === 3 && (
                    <form className="space-y-6">
                        <h3 className="text-lg font-semibold text-gray-700">Nộp hồ sơ trực tuyến</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input placeholder="Họ" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Tên đệm và tên" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Họ và tên (tự động)" className="border px-3 py-2 rounded-md bg-gray-100" readOnly />
                            <input type="date" className="border px-3 py-2 rounded-md" placeholder="Ngày sinh" />
                            <input placeholder="Nơi sinh" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Số CCCD" className="border px-3 py-2 rounded-md" />
                            <input type="date" placeholder="Ngày cấp" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Nơi cấp" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Dân tộc" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Tôn giáo" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Số điện thoại" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Email" className="border px-3 py-2 rounded-md" />
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Địa chỉ thường trú</label>
                                <div className="grid grid-cols-4 gap-2 mt-1">
                                    <select className="border rounded-md px-2 py-1 col-span-1">
                                        <option>Tỉnh/Thành</option>
                                    </select>
                                    <select className="border rounded-md px-2 py-1 col-span-1">
                                        <option>Quận/Huyện</option>
                                    </select>
                                    <select className="border rounded-md px-2 py-1 col-span-1">
                                        <option>Phường/Xã</option>
                                    </select>
                                    <input className="border px-3 py-1 rounded-md col-span-1" placeholder="Số nhà, đường..." />
                                </div>
                            </div>
                            <input placeholder="Nghề nghiệp" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Tên và địa chỉ cơ quan" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Họ tên cha/mẹ/vợ/chồng" className="border px-3 py-2 rounded-md" />
                            <input placeholder="Ngày sinh của người thân" className="border px-3 py-2 rounded-md" type="date" />
                            <input placeholder="Hộ chiếu phổ thông gần nhất - ngày cấp" className="border px-3 py-2 rounded-md" type="date" />
                            <input placeholder="Hộ chiếu phổ thông gần nhất - nơi cấp" className="border px-3 py-2 rounded-md" />
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tải ảnh chân dung</label>
                                <input type="file" className="border px-3 py-2 rounded-md w-full" />
                            </div>
                            <div className="sm:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Tải ảnh CCCD mặt trước và sau</label>
                                <input type="file" multiple className="border px-3 py-2 rounded-md w-full" />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <input placeholder="Mã xác thực" className="border px-3 py-2 rounded-md" />
                            <button type="button" onClick={handleNextStep} className="rounded-md bg-indigo-600 px-4 py-2 text-white">Tiếp tục</button>
                        </div>
                    </form>
                )}

                {step === 4 && (
                    <div className="text-center">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Theo dõi kết quả</h3>
                        <p>Số hồ sơ: <span className="font-bold">HS20250001</span></p>
                        <p>Họ tên người đăng ký: <span className="font-bold">Nguyễn Văn A</span></p>
                    </div>
                )}
            </div>
        </div>
    );
}
