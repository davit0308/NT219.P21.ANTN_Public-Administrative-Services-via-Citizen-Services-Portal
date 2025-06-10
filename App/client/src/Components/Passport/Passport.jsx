import { useState, useEffect } from 'react';
import Select from 'react-select';
import { customToast } from '../../utils/customToast';
import ethnicList from '../../assets/ethnic.json';
import religionList from '../../assets/religion.json';
import countries from '../../assets/countries.json';

const steps = [
    'Đăng ký/Đăng nhập',
    'Lựa chọn DVC',
    'Nộp hồ sơ trực tuyến',
    'Theo dõi kết quả',
];

export default function Passport() {
    const [step, setStep] = useState(2);
    const [profileFile, setProfileFile] = useState();
    const [cccdFile, setCccdFile] = useState();
    const [lastName, setLastName] = useState('');
    const [middleAndFirstName, setMiddleAndFirstName] = useState('');
    const [provinces, setProvinces] = useState([]);
    const [birthPlace, setBirthPlace] = useState('');
    const [districts, setDistricts] = useState([]);
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedDistrict, setSelectedDistrict] = useState('');
    const [selectedGender, setSelectedGender] = useState('');
    const [errors, setErrors] = useState({});
    const [passportRequest, setPassportRequest] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [cccdNumber, setCccdNumber] = useState('');
    const [cccdIssueDate, setCccdIssueDate] = useState('');
    const [ethnic, setEthnic] = useState('');
    const [religion, setReligion] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');

    const validateStep3 = () => {
        const newErrors = {};
        if (!lastName.trim()) newErrors.lastName = 'Bắt buộc nhập';
        if (!middleAndFirstName.trim()) newErrors.middleAndFirstName = 'Bắt buộc nhập';
        if (!birthPlace) newErrors.birthPlace = 'Bắt buộc nhập';
        if (!selectedGender) newErrors.selectedGender = 'Bắt buộc nhập';
        if (!birthDate) newErrors.birthDate = 'Bắt buộc nhập';
        if (!cccdNumber) newErrors.cccdNumber = 'Bắt buộc nhập';
        if (!cccdIssueDate) newErrors.cccdIssueDate = 'Bắt buộc nhập';
        if (!ethnic) newErrors.ethnic = 'Bắt buộc nhập';
        if (!religion) newErrors.religion = 'Bắt buộc nhập';
        if (!phone) newErrors.phone = 'Bắt buộc nhập';
        if (!email) newErrors.email = 'Bắt buộc nhập';
        if (!selectedProvince) newErrors.selectedProvince = 'Bắt buộc nhập';
        if (!passportRequest) newErrors.passportRequest = 'Bắt buộc nhập';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleNextStep = () => {
        if (step === 3) {
            if (!validateStep3()) {
                customToast('Vui lòng nhập đầy đủ các trường bắt buộc!', 'error');
                return;
            }
        }
        if (step < steps.length) setStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };

    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data));
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts || []));
        } else {
            setDistricts([]);
        }
    }, [selectedProvince]);

    // Tạo options cho react-select
    const provinceOptions = provinces.map(p => ({ value: p.code, label: p.name }));
    const districtOptions = districts.map(d => ({ value: d.code, label: d.name }));
    const birthPlaceOptions = [
        {
            label: 'Việt Nam',
            options: provinces.map(p => ({ value: p.name, label: p.name }))
        },
        {
            label: 'Các nước khác',
            options: countries.map(c => ({ value: c.name, label: c.name }))
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-0 flex justify-center items-start w-full">
            <div className="w-full bg-white rounded-xl shadow-md border border-gray-200 p-8">
                <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
                    Đăng ký cấp Hộ chiếu
                </h2>

                {/* Stepper */}
                <div className="flex justify-between items-center mb-12 relative">
                    {steps.map((label, index) => (
                        <div
                            key={index}
                            className="flex flex-1 flex-col items-center text-center relative z-10"
                        >
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2 transition-all duration-300 ${step === index + 1
                                    ? 'bg-indigo-600 text-white border-indigo-600'
                                    : step > index + 1
                                        ? 'bg-green-500 text-white border-green-500'
                                        : 'bg-white text-gray-500 border-gray-300'
                                    }`}
                            >
                                {step > index + 1 ? '✓' : index + 1}
                            </div>
                            <span
                                className={`mt-2 text-xs md:text-sm ${step === index + 1
                                    ? 'text-indigo-600 font-semibold'
                                    : 'text-gray-500'
                                    }`}
                            >
                                {label}
                            </span>
                        </div>
                    ))}
                    <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0" />
                </div>

                {/* Form Step 2 */}
                {step === 2 && (
                    <form className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            Chọn trường hợp hồ sơ
                        </h3>

                        <div>
                            <label className="block text-sm font-medium text-lg text-gray-700 mb-1">
                                Cơ quan giải quyết hồ sơ
                            </label>
                            <select className="select select-bordered w-full">
                                <option>Cục Quản lý xuất nhập cảnh</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-lg text-gray-700 mb-1">
                                Trường hợp giải quyết
                            </label>
                            <select className="select select-bordered w-full">
                                <option>
                                    5 ngày làm việc - Cấp hộ chiếu phổ thông cho người từ 14 tuổi
                                </option>
                                <option>
                                    5 ngày làm việc - Cấp hộ chiếu phổ thông cho trẻ em dưới 14 tuổi
                                </option>
                            </select>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-5 py-2 text-gray-800 hover:bg-gray-300 transition"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn btn-primary"
                            >
                                Đồng ý và tiếp tục
                            </button>
                        </div>
                    </form>
                )}

                {/* Bước 3: Nộp hồ sơ */}
                {step === 3 && (
                    <form className="space-y-6">
                        <h3 className="text-xl font-semibold text-gray-700 mb-4">
                            Nộp hồ sơ trực tuyến
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Họ, Tên đệm và tên, Họ và tên, Giới tính */}
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">1. Họ (phải nhập đầy đủ nếu có)</label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder="NGUYỄN"
                                    value={lastName}
                                    onChange={e => setLastName(e.target.value)}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Tên đệm và tên <span className="text-red-500">*</span></label>
                                <input
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.middleAndFirstName ? 'border-red-500' : ''}`}
                                    placeholder="VĂN A"
                                    value={middleAndFirstName}
                                    onChange={e => setMiddleAndFirstName(e.target.value)}
                                />
                                {errors.middleAndFirstName && <div className="text-red-500 text-sm">{errors.middleAndFirstName}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Họ và tên <span className="text-red-500">*</span></label>
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100"
                                    placeholder="NGUYỄN VĂN A"
                                    value={`${lastName} ${middleAndFirstName}`.trim()}
                                    readOnly
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">2. Giới tính <span className="text-red-500">*</span></label>
                                <select
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    value={selectedGender}
                                    onChange={e => setSelectedGender(e.target.value)}
                                >
                                    <option value="">-- Chọn giới tính --</option>
                                    <option value="Nam">Nam</option>
                                    <option value="Nữ">Nữ</option>
                                </select>
                                {errors.selectedGender && <div className="text-red-500 text-sm">{errors.selectedGender}</div>}
                            </div>
                            {/* Sinh ngày, Nơi sinh, Số CCCD, Ngày cấp */}
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">3. Sinh ngày <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.birthDate ? 'border-red-500' : ''}`}
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                                {errors.birthDate && <div className="text-red-500 text-sm">{errors.birthDate}</div>}
                            </div>
                            <div className="col-span-3">
                                <label className="block mb-1 font-medium text-lg">
                                    Nơi sinh (theo giấy khai sinh) <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={birthPlaceOptions}
                                    value={birthPlace ? { value: birthPlace, label: birthPlace } : null}
                                    onChange={option => setBirthPlace(option?.value || '')}
                                    placeholder="Chọn nơi sinh..."
                                    isClearable
                                />
                                {errors.birthPlace && <div className="text-red-500 text-sm">{errors.birthPlace}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">4. Số CCCD/Số định danh <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.birthDate ? 'border-red-500' : ''}`}
                                    value={birthDate}
                                    onChange={e => setBirthDate(e.target.value)}
                                />
                                {errors.birthDate && <div className="text-red-500 text-sm">{errors.birthDate}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Ngày cấp <span className="text-red-500">*</span></label>
                                <input
                                    type="date"
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.cccdIssueDate ? 'border-red-500' : ''}`}
                                    value={cccdIssueDate}
                                    onChange={e => setCccdIssueDate(e.target.value)}
                                />
                                {errors.cccdIssueDate && <div className="text-red-500 text-sm">{errors.cccdIssueDate}</div>}
                            </div>
                            {/* Nơi cấp, Dân tộc, Tôn giáo, Số điện thoại */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Nơi cấp</label>
                                <select className="w-full border border-gray-300 rounded px-3 py-2">
                                    <option>Cục Cảnh sát quản lý hành chính về trật tự xã hội</option>
                                </select>
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">5. Dân tộc <span className="text-red-500">*</span></label>
                                <select
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.ethnic ? 'border-red-500' : ''}`}
                                    value={ethnic}
                                    onChange={e => setEthnic(e.target.value)}
                                >
                                    <option value="">-- Chọn dân tộc --</option>
                                    {ethnicList.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                {errors.ethnic && <div className="text-red-500 text-sm">{errors.ethnic}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">6. Tôn giáo <span className="text-red-500">*</span></label>
                                <select
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.ethnic ? 'border-red-500' : ''}`}
                                    value={ethnic}
                                    onChange={e => setEthnic(e.target.value)}
                                >
                                    <option value="">-- Chọn dân tộc --</option>
                                    {ethnicList.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                {errors.ethnic && <div className="text-red-500 text-sm">{errors.ethnic}</div>}
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">7. Số điện thoại <span className="text-red-500">*</span></label>
                                <input
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.phone ? 'border-red-500' : ''}`}
                                    placeholder="Nhập số điện thoại"
                                    value={phone}
                                    onChange={e => setPhone(e.target.value)}
                                />
                                {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                            </div>
                            {/* Email, Địa chỉ thường trú, Quận/huyện, ... */}
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Email <span className="text-red-500">*</span></label>
                                <input
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.email ? 'border-red-500' : ''}`}
                                    placeholder="Nhập email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                                {errors.email && <div className="text-red-500 text-sm">{errors.email}</div>}
                            </div>
                            {/* Địa chỉ thường trú (ghi theo sổ hộ khẩu) */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">
                                    8. Địa chỉ thường trú (ghi theo sổ hộ khẩu) <span className="text-red-500">*</span>
                                </label>
                                <Select
                                    options={provinceOptions}
                                    value={provinceOptions.find(opt => opt.value === selectedProvince) || null}
                                    onChange={option => {
                                        setSelectedProvince(option?.value || '');
                                        setSelectedDistrict('');
                                    }}
                                    placeholder="Chọn tỉnh/thành..."
                                    isClearable
                                />
                                {errors.selectedProvince && <div className="text-red-500 text-sm">{errors.selectedProvince}</div>}
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Quận/huyện</label>
                                <Select
                                    options={districtOptions}
                                    value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
                                    onChange={option => setSelectedDistrict(option?.value || '')}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!selectedProvince}
                                />
                            </div>

                            <div className="col-span-4">
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Số nhà, tên đường, thôn/xóm/khu phố, xã' />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">9. Địa chỉ tạm trú (ghi theo sổ tạm trú)</label>
                                <Select
                                    options={provinceOptions}
                                    value={provinceOptions.find(opt => opt.value === selectedProvince) || null}
                                    onChange={option => {
                                        setSelectedProvince(option?.value || '');
                                        setSelectedDistrict('');
                                    }}
                                    placeholder="Chọn tỉnh/thành..."
                                    isClearable
                                />
                            </div>
                            {/* Số nhà, Quận/Huyện tạm trú */}

                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Quận/Huyện</label>
                                <Select
                                    options={districtOptions}
                                    value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
                                    onChange={option => setSelectedDistrict(option?.value || '')}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!selectedProvince}
                                />
                            </div>
                            <div className="col-span-4">
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Số nhà, tên đường, thôn/xóm/khu phố, xã' />
                            </div>
                            {/* Nghề nghiệp, Tên và địa chỉ cơ quan */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">10. Nghề Nghiệp</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nghề nghiệp" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">11. Tên và địa chỉ cơ quan</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập tên cơ quan - Địa chỉ cơ quan" />
                            </div>
                            {/* Họ tên Cha, Họ tên Mẹ, Họ tên Vợ/Chồng */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">12. Họ tên Cha (phải nhập đầy đủ nếu có)</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Ngày sinh</label>
                                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập ngày sinh cha" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Họ tên Mẹ (phải nhập đầy đủ nếu có)</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Ngày sinh</label>
                                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập ngày sinh mẹ" />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Họ tên Vợ/Chồng</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập họ tên Vợ/Chồng" />
                            </div>

                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Ngày sinh</label>
                                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập ngày sinh Vợ/Chồng" />
                            </div>
                            {/* Hộ chiếu phổ thông gần nhất, Ngày cấp, Nơi cấp hộ chiếu */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Hộ chiếu phổ thông gần nhất</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập số hộ chiếu cũ" />
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Ngày cấp</label>
                                <input type="date" className="w-full border border-gray-300 rounded px-3 py-2" />
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Nơi cấp hộ chiếu</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nơi cấp hộ chiếu" />
                            </div>
                            {/* Nội dung đề nghị, Chi tiết nội dung đề nghị */}
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">14. Nội dung đề nghị: Cấp hộ chiếu <span className="text-red-500">*</span></label>
                                <select
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.passportRequest ? 'border-red-500' : ''}`}
                                    value={passportRequest}
                                    onChange={e => setPassportRequest(e.target.value)}
                                >
                                    <option value="">-- Chưa chọn --</option>
                                    <option>Cấp hộ chiếu lần đầu</option>
                                    <option>Cấp lại hộ chiếu do hộ chiếu cũ hết hạn</option>
                                    <option>Cấp lại hộ chiếu do hộ chiếu cũ sắp hết hạn</option>
                                    <option>Cấp lại hộ chiếu do hộ chiếu cũ hết trang</option>
                                    <option>Cấp lại hộ chiếu do bị mất</option>
                                    <option>Cấp lại hộ chiếu do bị hư hỏng</option>
                                    <option>Đề nghị khác</option>
                                </select>
                                {errors.passportRequest && <div className="text-red-500 text-sm">{errors.passportRequest}</div>}
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">Chi tiết nội dung đề nghị</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Nhập chi tiết nội dung đề nghị nếu có" />
                            </div>

                            {/* Upload ảnh chân dung */}
                            <div className="col-span-4">
                                <label className="block mb-1 font-medium text-lg">Tải ảnh chân dung</label>
                                <div className="flex items-center w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                    <label
                                        htmlFor="profileFile"
                                        className="cursor-pointer bg-red-50 text-red-700 font-semibold px-4 py-2 rounded mr-3 transition hover:bg-red-100"
                                        tabIndex={0}
                                    >
                                        Chọn tệp
                                        <input
                                            id="profileFile"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => setProfileFile(e.target.files[0]?.name)}
                                        />
                                    </label>
                                    <span className="text-gray-700 text-base mr-2">
                                        {profileFile ? profileFile : "Chưa có tệp nào được chọn"}
                                    </span>
                                    {profileFile && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                                            onClick={() => setProfileFile(undefined)}
                                            aria-label="Xóa file"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Upload ảnh CCCD mặt trước */}
                            <div className="col-span-4">
                                <label className="block mb-1 font-medium text-lg">Tải ảnh CCCD mặt trước</label>
                                <div className="flex items-center w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                    <label
                                        htmlFor="cccdFrontFile"
                                        className="cursor-pointer bg-red-50 text-red-700 font-semibold px-4 py-2 rounded mr-3 transition hover:bg-red-100"
                                        tabIndex={0}
                                    >
                                        Chọn tệp
                                        <input
                                            id="cccdFrontFile"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => setCccdFile(e.target.files[0]?.name)}
                                        />
                                    </label>
                                    <span className="text-gray-700 text-base mr-2">
                                        {cccdFile ? cccdFile : "Chưa có tệp nào được chọn"}
                                    </span>
                                    {cccdFile && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                                            onClick={() => setCccdFile(undefined)}
                                            aria-label="Xóa file"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Upload ảnh CCCD mặt sau */}
                            <div className="col-span-4">
                                <label className="block mb-1 font-medium text-lg">Tải ảnh CCCD mặt sau</label>
                                <div className="flex items-center w-full border border-gray-300 rounded px-3 py-2 bg-white">
                                    <label
                                        htmlFor="cccdBackFile"
                                        className="cursor-pointer bg-red-50 text-red-700 font-semibold px-4 py-2 rounded mr-3 transition hover:bg-red-100"
                                        tabIndex={0}
                                    >
                                        Chọn tệp
                                        <input
                                            id="cccdBackFile"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={e => setCccdFile(e.target.files[0]?.name)}
                                        />
                                    </label>
                                    <span className="text-gray-700 text-base mr-2">
                                        {cccdFile ? cccdFile : "Chưa có tệp nào được chọn"}
                                    </span>
                                    {cccdFile && (
                                        <button
                                            type="button"
                                            className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg"
                                            onClick={() => setCccdFile(undefined)}
                                            aria-label="Xóa file"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                            {/* Loại hộ chiếu đề nghị cấp */}
                            <div className="mt-2 w-200">
                                <label className="block mb-1 font-medium text-lg">Chọn loại hộ chiếu đề nghị cấp</label>
                                <div className="flex items-center">
                                    <div className="flex items-center mr-6">
                                        <input type="radio" name="radio-10" className="radio radio-xs radio-error mr-2" defaultChecked />
                                        <span>Cấp hộ chiếu không gắn chip điện tử</span>
                                    </div>
                                    <div className="flex items-center">
                                        <input type="radio" name="radio-10" className="radio radio-xs radio-error mr-2" />
                                        <span>Cấp hộ chiếu có gắn chip điện tử</span>
                                    </div>
                                </div>
                            </div>
                            {/* Mã xác thực */}
                            <div className="col-span-4">
                                <label className="block mb-1 font-medium text-lg">Mã xác thực</label>
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder="Mã xác thực" />
                            </div>
                        </div>

                        <div className="flex justify-between mt-8">
                            <button
                                type="button"
                                onClick={handlePrevStep}
                                className="inline-flex items-center justify-center rounded-md bg-gray-200 px-5 py-2 text-gray-800 hover:bg-gray-300 transition"
                            >
                                Quay lại
                            </button>
                            <button
                                type="button"
                                onClick={handleNextStep}
                                className="btn btn-primary"
                            >
                                Tiếp tục
                            </button>
                        </div>
                    </form>
                )}

                {/* Bước 4: Theo dõi */}
                {step === 4 && (
                    <div className="text-center space-y-2">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">
                            Theo dõi kết quả
                        </h3>
                        <p>
                            Số hồ sơ: <span className="font-bold">HS20250001</span>
                        </p>
                        <p>
                            Họ tên người đăng ký: <span className="font-bold">{`${lastName} ${middleAndFirstName}`.trim()}</span>
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
