import { useState, useEffect } from 'react';
import Select from 'react-select';
import { loadOQS } from '../../utils/oqsLoader';
import { PDFDocument } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import ethnicList from '../../assets/ethnic.json';
import religionList from '../../assets/religion.json';
import countries from '../../assets/countries.json';
import ExportPassportPDFButton from "../ExportPassportPDFButton/ExportPassportPDFButton";
import { generateFilledPassportPDF } from "../../utils/pdfUtils";

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
    const [addressDetail, setAddressDetail] = useState('');
    const [tempAddressDetail, setTempAddressDetail] = useState('');

    // Thêm state riêng cho tạm trú:
    const [tempProvince, setTempProvince] = useState('');
    const [tempDistrict, setTempDistrict] = useState('');
    const [tempDistricts, setTempDistricts] = useState([]);
    const [tempSelectedWard, setTempSelectedWard] = useState('');
    const [tempWards, setTempWards] = useState([]);


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
    const [occupation, setOccupation] = useState('');
    const [selectedWard, setSelectedWard] = useState('');
    const [wards, setWards] = useState([]);
    const [ecdsaKeyPair, setEcdsaKeyPair] = useState(null);

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
                alert('Vui lòng nhập đầy đủ các trường bắt buộc!');
                return;
            }
        }
        if (step < steps.length) setStep((prev) => prev + 1);
    };

    const handlePrevStep = () => {
        if (step > 1) setStep((prev) => prev - 1);
    };

    // Khi load trang, fetch danh sách tỉnh
    useEffect(() => {
        fetch('https://provinces.open-api.vn/api/p/')
            .then(res => res.json())
            .then(data => setProvinces(data));
    }, []);

    // Khi chọn tỉnh thường trú, fetch huyện
    useEffect(() => {
        if (selectedProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
                .then(res => res.json())
                .then(data => setDistricts(data.districts || []));
        } else {
            setDistricts([]);
        }
        setSelectedDistrict('');
        setSelectedWard('');
        setWards([]);
    }, [selectedProvince]);

    // Khi chọn huyện thường trú, fetch xã
    useEffect(() => {
        if (selectedDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
                .then(res => res.json())
                .then(data => setWards(data.wards || []));
        } else {
            setWards([]);
        }
        setSelectedWard('');
    }, [selectedDistrict]);

    // Khi chọn tỉnh tạm trú, fetch huyện
    useEffect(() => {
        if (tempProvince) {
            fetch(`https://provinces.open-api.vn/api/p/${tempProvince}?depth=2`)
                .then(res => res.json())
                .then(data => setTempDistricts(data.districts || []));
        } else {
            setTempDistricts([]);
        }
        setTempDistrict('');
        setTempSelectedWard('');
        setTempWards([]);
    }, [tempProvince]);

    // Khi chọn huyện tạm trú, fetch xã
    useEffect(() => {
        if (tempDistrict) {
            fetch(`https://provinces.open-api.vn/api/d/${tempDistrict}?depth=2`)
                .then(res => res.json())
                .then(data => setTempWards(data.wards || []));
        } else {
            setTempWards([]);
        }
        setTempSelectedWard('');
    }, [tempDistrict]);


    // Tạo options cho select
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

    // Tạo options cho địa chỉ tạm trú (đặt lên trên)
    const tempProvinceOptions = provinces.map(p => ({ value: p.code, label: p.name }));
    const tempDistrictOptions = tempDistricts.map(d => ({ value: d.code, label: d.name }));
    const wardOptions = wards.map(w => ({ value: w.code, label: w.name }));
    const tempWardOptions = tempWards.map(w => ({ value: w.code, label: w.name }));

    // Lấy dữ liệu đầy đủ để truyền vào ExportPassportPDFButton
    const fullName = `${lastName} ${middleAndFirstName}`.trim();
    const address = [
        addressDetail,
        districtOptions.find(opt => opt.value === selectedDistrict)?.label,
        provinceOptions.find(opt => opt.value === selectedProvince)?.label
    ].filter(Boolean).join(', ');

    const temporaryAddress = [
        tempAddressDetail,
        tempDistrictOptions.find(opt => opt.value === tempDistrict)?.label,
        tempProvinceOptions.find(opt => opt.value === tempProvince)?.label
    ].filter(Boolean).join(', ');

    const data = {
        lastName,
        middleAndFirstName,
        birthDate,
        gender: selectedGender,
        birthPlace,
        nationality: "Việt Nam",
        cccdNumber,
        cccdIssueDate,
        cccdIssuePlace: "Cục CSQLHC về TTXH",
        ethnic,
        religion,
        occupation,
        address: [
            addressDetail,
            districtOptions.find(opt => opt.value === selectedDistrict)?.label,
            provinceOptions.find(opt => opt.value === selectedProvince)?.label
        ].filter(Boolean).join(', '),
        temporaryAddress,
        phone,
        email,
        passportRequest,
    };

    async function signPdfWithOQS(pdfBytes) {
        try {
            const OQS = await loadOQS();
            console.log("✅ OQS loaded:", !!OQS);

            // Wrap các hàm native
            const sig_new = OQS.cwrap('_OQS_SIG_new', 'number', ['string']);
            const sig_keypair = OQS.cwrap('_OQS_SIG_keypair', 'number', ['number', 'number', 'number']);
            const sig_sign = OQS.cwrap('_OQS_SIG_sign', 'number', ['number', 'number', 'number', 'number', 'number', 'number']);
            const sig_free = OQS.cwrap('_OQS_SIG_free', null, ['number']);

            const sigAlg = "Falcon-512";
            // 1. Khởi tạo thuật toán
            const sig = sig_new(sigAlg);

            // 2. Cấp phát vùng nhớ cho publicKey, secretKey
            const pubKeyLen = 897; // Falcon-512 public key bytes
            const secKeyLen = 1281; // Falcon-512 secret key bytes
            const pubKeyPtr = OQS._malloc(pubKeyLen);
            const secKeyPtr = OQS._malloc(secKeyLen);

            // 3. Sinh keypair
            sig_keypair(sig, pubKeyPtr, secKeyPtr);

            // 4. Hash PDF (SHA-256)
            const hashBuffer = new Uint8Array(await window.crypto.subtle.digest("SHA-256", pdfBytes));
            const msgPtr = OQS._malloc(hashBuffer.length);
            OQS.HEAPU8.set(hashBuffer, msgPtr);

            // 5. Cấp phát vùng nhớ cho chữ ký
            const sigMaxLen = 690; // Falcon-512 signature bytes
            const sigPtr = OQS._malloc(sigMaxLen);
            const sigLenPtr = OQS._malloc(4); // uint32

            // 6. Ký số
            sig_sign(sig, sigPtr, sigLenPtr, msgPtr, hashBuffer.length, secKeyPtr);
            console.log("Ký thành công. sigLen =", OQS.HEAPU32[sigLenPtr >> 2]);


            // 7. Lấy chữ ký và publicKey ra JS array
            const sigLen = OQS.HEAPU32[sigLenPtr >> 2];
            const signature = Array.from(OQS.HEAPU8.subarray(sigPtr, sigPtr + sigLen));
            const publicKey = Array.from(OQS.HEAPU8.subarray(pubKeyPtr, pubKeyPtr + pubKeyLen));

            // 8. Giải phóng bộ nhớ
            OQS._free(pubKeyPtr);
            OQS._free(secKeyPtr);
            OQS._free(msgPtr);
            OQS._free(sigPtr);
            OQS._free(sigLenPtr);
            sig_free(sig);

            console.log("✅ Ký số thành công:", {
                signature,
                publicKey,
                sigAlg,
            });

            return {
                signature,
                publicKey,
                sigAlg,
            };
        } catch (err) {
            console.error("❌ Lỗi trong signPdfWithOQS:", err);
            throw err; // Để propagate ra ngoài handleFinish
        }

    }

    async function signPdfWithECDSA(pdfBytes, keyPair) {
        // Hash PDF
        const hashBuffer = new Uint8Array(await window.crypto.subtle.digest("SHA-256", pdfBytes));
        // Ký số
        const signature = await window.crypto.subtle.sign(
            { name: "ECDSA", hash: { name: "SHA-256" } },
            keyPair.privateKey,
            hashBuffer
        );
        // Export publicKey
        const exportedPubKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
        const pubKeyBase64 = btoa(String.fromCharCode(...new Uint8Array(exportedPubKey)));
        return {
            signature: Array.from(new Uint8Array(signature)),
            publicKey: pubKeyBase64,
            sigAlg: "ECDSA-P256",
        };
    }

    const handleFinish = async () => {
        try {
            if (!ecdsaKeyPair) {
                alert("Chưa khởi tạo khoá ký!");
                return;
            }
            // 1. Tạo PDF đã điền thông tin
            const pdfBytes = await generateFilledPassportPDF(data);

            // 2. Ký số bằng ECDSA
            const { signature, publicKey, sigAlg } = await signPdfWithECDSA(pdfBytes, ecdsaKeyPair);

            // 3. Gửi lên server
            const response = await fetch("/api/upload-signed-pdf", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfBytes: Array.from(new Uint8Array(pdfBytes)),
                    signature,
                    publicKey,
                    sigAlg,
                    userInfo: data,
                }),
            });

            const resJson = await response.json();
            console.log("Upload signed PDF response:", response.status, resJson);

            if (response.ok) {
                alert("Đề nghị cấp hộ chiếu của bạn đã được gửi đi!");
            } else {
                alert("Gửi đề nghị thất bại: " + (resJson.message || ""));
            }
        } catch (err) {
            alert("Có lỗi khi gửi đề nghị!");
            console.error(err);
        }
    };

    useEffect(() => {
        // Tạo keypair khi vào form
        window.crypto.subtle.generateKey(
            { name: "ECDSA", namedCurve: "P-256" },
            true,
            ["sign", "verify"]
        ).then(setEcdsaKeyPair);
    }, []);

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
                            </select>
                        </div>

                        <div className="flex justify-between align-left mt-8">
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
                                    type="text"
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.cccdNumber ? 'border-red-500' : ''}`}
                                    value={cccdNumber}
                                    onChange={e => setCccdNumber(e.target.value)}
                                />
                                {errors.cccdNumber && <div className="text-red-500 text-sm">{errors.cccdNumber}</div>}
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
                                    className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.religion ? 'border-red-500' : ''}`}
                                    value={religion}
                                    onChange={e => setReligion(e.target.value)}
                                >
                                    <option value="">-- Chọn dân tộc --</option>
                                    {religionList.map((item) => (
                                        <option key={item} value={item}>{item}</option>
                                    ))}
                                </select>
                                {errors.religion && <div className="text-red-500 text-sm">{errors.religion}</div>}
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
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Quận/Huyện/Thị xã/Thành phố</label>
                                <Select
                                    options={districtOptions}
                                    value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
                                    onChange={option => setSelectedDistrict(option?.value || '')}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!selectedProvince}
                                />
                            </div>
                            <div className="col-span-1">
                                <label className="block mb-1 font-medium text-lg">Xã/Phường/Thị trấn</label>
                                <Select
                                    options={wardOptions}
                                    value={wardOptions.find(opt => opt.value === selectedWard) || null}
                                    onChange={option => setSelectedWard(option?.value || '')}
                                    placeholder="Chọn xã/phường..."
                                    isClearable
                                    isDisabled={!selectedDistrict}
                                />
                            </div>

                            <div className="col-span-4">
                                <input className="w-full border border-gray-300 rounded px-3 py-2" placeholder='Số nhà, tên đường, thôn/xóm/khu phố' />
                            </div>
                            <div className="col-span-2">
                                <label className="block mb-1 font-medium text-lg">9. Địa chỉ tạm trú (ghi theo sổ tạm trú)</label>
                                <Select
                                    options={tempProvinceOptions}
                                    value={tempProvinceOptions.find(opt => opt.value === tempProvince) || null}
                                    onChange={option => {
                                        setTempProvince(option?.value || '');
                                        setTempDistrict('');
                                    }}
                                    placeholder="Chọn tỉnh/thành..."
                                    isClearable
                                />
                            </div>
                            {/* Số nhà, Quận/Huyện tạm trú */}


                            <div className='col-span-1'>
                                <label className="block mb-1 font-medium text-lg">Quận/Huyện/Thị xã/Thành phố</label>
                                <Select
                                    options={tempDistrictOptions}
                                    value={tempDistrictOptions.find(opt => opt.value === tempDistrict) || null}
                                    onChange={option => setTempDistrict(option?.value || '')}
                                    placeholder="Chọn quận/huyện..."
                                    isClearable
                                    isDisabled={!tempProvince}
                                />
                            </div>
                            <div className='col-span-1'>
                                <label className="block mb-1 font-medium text-lg">Xã/Phường/Thị trấn</label>
                                <Select
                                    options={tempWardOptions}
                                    value={tempWardOptions.find(opt => opt.value === tempSelectedWard) || null}
                                    onChange={option => setTempSelectedWard(option?.value || '')}
                                    placeholder="Chọn xã/phường..."
                                    isClearable
                                    isDisabled={!tempDistrict}
                                />
                            </div>

                            <div className="col-span-4">
                                <input
                                    className="w-full border border-gray-300 rounded px-3 py-2"
                                    placeholder='Số nhà, tên đường, thôn/xóm/khu phố'
                                    value={tempAddressDetail}
                                    onChange={e => setTempAddressDetail(e.target.value)}
                                />
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
                        <div className="mt-6">
                            <ExportPassportPDFButton
                                data={data}
                            >
                                Tải tờ khai Passport PDF
                            </ExportPassportPDFButton>
                        </div>
                        <div className="mt-4">
                            <button
                                className="btn btn-primary"
                                onClick={handleFinish}
                            >
                                Hoàn tất
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
