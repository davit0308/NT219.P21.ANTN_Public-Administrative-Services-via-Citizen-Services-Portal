import { useState, useEffect } from "react";
import Select from "react-select";
import { customToast } from "../../utils/customToast";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ExportDC02PDFButton from "../ExportDC02PDFButton/ExportDC02PDFButton";
import { generateFilledDC02PDF } from "../../utils/pdfUtils"; // import hàm mới

const steps = [
  "Đăng nhập/Đăng kí",
  "Nộp hồ sơ trực tuyến",
  "Đăng ký lịch thu nhận sinh trắc học",
  "Theo dõi kết quả",
];

export default function IdentityCard() {
  const [step, setStep] = useState(2);
  const [selectedDate, setSelectedDate] = useState(null);

  // Thông tin form
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [identifyNumber, setIdentifyNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [errors, setErrors] = useState({});
  const [agencyLevel, setAgencyLevel] = useState("xa"); // "xa" hoặc "tinh"

  // Thêm state cho tháng/năm của calendar
  const today = new Date();
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // Fetch tỉnh/thành
  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/p/")
      .then((res) => res.json())
      .then((data) => setProvinces(data));
  }, []);

  // Fetch quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts || []));
    } else {
      setDistricts([]);
      setSelectedDistrict("");
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedProvince]);

  // Fetch xã/phường khi chọn quận/huyện
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards || []));
    } else {
      setWards([]);
      setSelectedWard("");
    }
  }, [selectedDistrict]);

  // Tạo options cho react-select
  const provinceOptions = provinces.map((p) => ({
    value: p.code,
    label: p.name,
  }));
  const districtOptions = districts.map((d) => ({
    value: d.code,
    label: d.name,
  }));
  const wardOptions = wards.map((w) => ({
    value: w.code,
    label: w.name,
  }));

  // Validate các trường bắt buộc
  const validateStep2 = () => {
    const newErrors = {};
    if (!fullName.trim()) newErrors.fullName = "Bắt buộc nhập";
    if (!birthDate) newErrors.birthDate = "Bắt buộc nhập";
    if (!gender) newErrors.gender = "Bắt buộc chọn";
    if (!identifyNumber) newErrors.identifyNumber = "Bắt buộc nhập";
    if (!phone) newErrors.phone = "Bắt buộc nhập";
    if (!selectedProvince) newErrors.selectedProvince = "Bắt buộc chọn";
    if (!selectedDistrict) newErrors.selectedDistrict = "Bắt buộc chọn";
    if (!selectedWard) newErrors.selectedWard = "Bắt buộc chọn";
    if (!addressDetail.trim()) newErrors.addressDetail = "Bắt buộc nhập";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý chuyển bước
  const handleNextStep = () => {
    if (step === 2) {
      if (!validateStep2()) {
        customToast("Vui lòng nhập đầy đủ các trường bắt buộc!", "error");
        return;
      }
    }
    setStep((prev) => prev + 1);
  };

  // Calendar helper
  function renderCalendar() {
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const firstDay = new Date(calendarYear, calendarMonth, 1).getDay();
    const weeks = [];
    for (let w = 0; w < 6; w++) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dayNumber = w * 7 + d - firstDay + 1;
        if (dayNumber < 1 || dayNumber > daysInMonth) {
          week.push(<td key={d}></td>);
        } else {
          const isSelected =
            selectedDate &&
            selectedDate.getDate() === dayNumber &&
            selectedDate.getMonth() === calendarMonth &&
            selectedDate.getFullYear() === calendarYear;
          week.push(
            <td key={d}>
              <button
                className={`w-8 h-8 rounded-full ${isSelected
                  ? "bg-indigo-600 text-white"
                  : "hover:bg-indigo-100"
                  }`}
                onClick={() =>
                  setSelectedDate(new Date(calendarYear, calendarMonth, dayNumber))
                }
                type="button"
              >
                {dayNumber}
              </button>
            </td>
          );
        }
      }
      weeks.push(<tr key={w}>{week}</tr>);
    }
    // Thêm nút chuyển tháng
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <button
            className="px-2 py-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (calendarMonth === 0) {
                setCalendarMonth(11);
                setCalendarYear(calendarYear - 1);
              } else {
                setCalendarMonth(calendarMonth - 1);
              }
            }}
            type="button"
          >
            &lt;
          </button>
          <span className="font-semibold">
            {calendarMonth + 1}/{calendarYear}
          </span>
          <button
            className="px-2 py-1 rounded hover:bg-gray-200"
            onClick={() => {
              if (calendarMonth === 11) {
                setCalendarMonth(0);
                setCalendarYear(calendarYear + 1);
              } else {
                setCalendarMonth(calendarMonth + 1);
              }
            }}
            type="button"
          >
            &gt;
          </button>
        </div>
        <table className="mx-auto my-4">
          <thead>
            <tr>
              <th className="w-8">CN</th>
              <th className="w-8">T2</th>
              <th className="w-8">T3</th>
              <th className="w-8">T4</th>
              <th className="w-8">T5</th>
              <th className="w-8">T6</th>
              <th className="w-8">T7</th>
            </tr>
          </thead>
          <tbody>{weeks}</tbody>
        </table>
      </div>
    );
  }

  // Lấy tên tỉnh/huyện/xã đã chọn
  const selectedProvinceObj = provinces.find(p => p.code === selectedProvince);
  const selectedDistrictObj = districts.find(d => d.code === selectedDistrict);
  const selectedWardObj = wards.find(w => w.code === selectedWard);

  const provinceName = selectedProvinceObj ? selectedProvinceObj.name : "";
  const districtName = selectedDistrictObj ? selectedDistrictObj.name : "";
  const wardName = selectedWardObj ? selectedWardObj.name : "";

  // Địa chỉ thường trú đầy đủ
  const fullAddress = [wardName, districtName, provinceName].filter(Boolean).join(", ");

  // Lấy địa chỉ thường trú người dùng nhập (tùy bạn lưu ở đâu, ví dụ addressDetail)
  const [addressDetail, setAddressDetail] = useState("");
  const [ecdsaKeyPair, setEcdsaKeyPair] = useState(null);

  useEffect(() => {
    window.crypto.subtle.generateKey(
      { name: "ECDSA", namedCurve: "P-256" },
      true,
      ["sign", "verify"]
    ).then(setEcdsaKeyPair);
  }, []);

  async function signPdfWithECDSA(pdfBytes, keyPair) {
    const hashBuffer = new Uint8Array(await window.crypto.subtle.digest("SHA-256", pdfBytes));
    const signature = await window.crypto.subtle.sign(
      { name: "ECDSA", hash: { name: "SHA-256" } },
      keyPair.privateKey,
      hashBuffer
    );
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
      const pdfBytes = await generateFilledDC02PDF({
        fullName,
        dob: birthDate,
        gender,
        idNumber: identifyNumber,
        address: [addressDetail, wardName, districtName, provinceName].filter(Boolean).join(", "),
      });

      // 2. Ký số PDF
      const { signature, publicKey, sigAlg } = await signPdfWithECDSA(pdfBytes, ecdsaKeyPair);

      // 3. Gửi lên server
      const response = await fetch("/api/upload-signed-cccd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pdfBytes: Array.from(new Uint8Array(pdfBytes)),
          signature,
          publicKey,
          sigAlg,
          userInfo: {
            fullName,
            birthDate,
            gender,
            identifyNumber,
            phone,
            email,
            address: [addressDetail, wardName, districtName, provinceName].filter(Boolean).join(", "),
          },
        }),
      });

      const resJson = await response.json();
      if (response.ok) {
        alert("Đề nghị cấp CCCD của bạn đã được gửi đi!");
      } else {
        alert("Gửi đề nghị thất bại: " + (resJson.message || ""));
      }
    } catch (err) {
      alert("Có lỗi khi gửi đề nghị!");
      console.error(err);
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 py-12 px-0 flex justify-center items-start w-full">
        <div className="w-full bg-white p-8 rounded-lg shadow border border-gray-300">
          {/* Stepper */}
          <div className="flex justify-between items-center mb-12 relative">
            {steps.map((label, index) => (
              <div
                key={index}
                className="flex flex-1 flex-col items-center text-center relative z-10"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold border-2 transition-all duration-300 ${step === index + 1
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : step > index + 1
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-white text-gray-500 border-gray-300"
                    }`}
                >
                  {step > index + 1 ? "✓" : index + 1}
                </div>
                <span
                  className={`mt-2 text-xs md:text-sm ${step === index + 1
                    ? "text-indigo-600 font-semibold"
                    : "text-gray-500"
                    }`}
                >
                  {label}
                </span>
              </div>
            ))}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-300 z-0" />
          </div>

          {/* Step 1: Đăng nhập/Đăng kí (placeholder) */}
          {step === 1 && (
            <div className="text-center">
              <h2 className="text-3xl font-bold text-indigo-700 mb-10">
                Đăng nhập/Đăng kí
              </h2>
              <button
                className="btn btn-primary"
                onClick={() => setStep(2)}
              >
                Tiếp theo
              </button>
            </div>
          )}

          {/* Step 2: Nộp hồ sơ trực tuyến */}
          {step === 2 && (
            <>
              <h2 className="text-3xl font-bold text-center text-indigo-700 mb-10">
                Đăng ký cấp Căn cước công dân
              </h2>
              {/* THÔNG TIN NGƯỜI KÊ KHAI */}
              <div className="mb-8 border rounded-lg">
                <div className="bg-red-100 px-4 py-2 rounded-t-lg flex items-center">
                  <h3 className="text-lg font-bold flex-1">THÔNG TIN NGƯỜI KÊ KHAI</h3>
                </div>
                <div className="p-4 col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-1">
                      <label className="block font-medium">
                        Họ, chữ đệm và tên <span className="text-red-600">*</span>
                      </label>
                      <input
                        className={`form-control w-full border rounded px-3 py-2 ${errors.fullName ? "border-red-500" : ""}`}
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                      />
                      {errors.fullName && <div className="text-red-500 text-sm">{errors.fullName}</div>}
                    </div>
                    <div className="col-span-1">
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block font-medium">
                            Ngày, tháng, năm sinh <span className="text-red-600">*</span>
                          </label>
                          <input
                            type="date"
                            className={`form-control w-full border rounded px-3 py-2 ${errors.birthDate ? "border-red-500" : ""}`}
                            value={birthDate}
                            onChange={e => setBirthDate(e.target.value)}
                          />
                          {errors.birthDate && <div className="text-red-500 text-sm">{errors.birthDate}</div>}
                        </div>
                        <div className="flex-1">
                          <label className="block font-medium">
                            Giới tính <span className="text-red-600">*</span>
                          </label>
                          <select
                            className={`form-control w-full border rounded px-3 py-2 ${errors.gender ? "border-red-500" : ""}`}
                            value={gender}
                            onChange={e => setGender(e.target.value)}
                          >
                            <option value="">-- Chọn giới tính --</option>
                            <option value="Nam">Nam</option>
                            <option value="Nữ">Nữ</option>
                          </select>
                          {errors.gender && <div className="text-red-500 text-sm">{errors.gender}</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Giới tính (ẩn theo mẫu) */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 hidden">
                    <div>
                      <label className="block font-medium">
                        Giới tính <span className="text-red-600">*</span>
                      </label>
                      <select
                        className="form-control w-full border rounded px-3 py-2"
                        id="cboGENDER_ID_NDN"
                        name="cboGENDER_ID_NDN"
                        disabled
                      >
                        <option value="1">Chưa có thông tin</option>
                        <option value="2">Nam</option>
                        <option value="3">Nữ</option>
                        <option value="4">Khác</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium">
                        Số định danh cá nhân <span className="text-red-600">*</span>
                      </label>
                      <input
                        className={`form-control w-full border rounded px-3 py-2 ${errors.identifyNumber ? "border-red-500" : ""}`}
                        value={identifyNumber}
                        onChange={e => setIdentifyNumber(e.target.value)}
                        maxLength={12}
                      />
                      {errors.identifyNumber && <div className="text-red-500 text-sm">{errors.identifyNumber}</div>}
                    </div>
                    <div>
                      <label className="block font-medium">
                        Số điện thoại <span className="text-red-600">*</span>
                      </label>
                      <input
                        className={`form-control w-full border rounded px-3 py-2 ${errors.phone ? "border-red-500" : ""}`}
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        maxLength={12}
                      />
                      {errors.phone && <div className="text-red-500 text-sm">{errors.phone}</div>}
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium">Thư điện tử</label>
                    <input
                      className="form-control w-full border rounded px-3 py-2"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium text-lg">
                      Địa chỉ thường trú (ghi theo sổ hộ khẩu) <span className="text-red-500">*</span>
                    </label>
                    <Select
                      options={provinceOptions}
                      value={provinceOptions.find(opt => opt.value === selectedProvince) || null}
                      onChange={option => {
                        setSelectedProvince(option?.value || "");
                        setSelectedDistrict("");
                        setSelectedWard("");
                      }}
                      placeholder="Chọn tỉnh/thành..."
                      isClearable
                    />
                    {errors.selectedProvince && <div className="text-red-500 text-sm">{errors.selectedProvince}</div>}
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium text-lg">Quận/huyện <span className="text-red-500">*</span></label>
                    <Select
                      options={districtOptions}
                      value={districtOptions.find(opt => opt.value === selectedDistrict) || null}
                      onChange={option => {
                        setSelectedDistrict(option?.value || "");
                        setSelectedWard("");
                      }}
                      placeholder="Chọn quận/huyện..."
                      isClearable
                      isDisabled={!selectedProvince}
                    />
                    {errors.selectedDistrict && <div className="text-red-500 text-sm">{errors.selectedDistrict}</div>}
                  </div>
                  <div className="col-span-2">
                    <label className="block mb-1 font-medium text-lg">Xã/Phường <span className="text-red-500">*</span></label>
                    <Select
                      options={wardOptions}
                      value={wardOptions.find(opt => opt.value === selectedWard) || null}
                      onChange={option => setSelectedWard(option?.value || "")}
                      placeholder="Chọn xã/phường..."
                      isClearable
                      isDisabled={!selectedDistrict}
                    />
                    {errors.selectedWard && <div className="text-red-500 text-sm">{errors.selectedWard}</div>}
                  </div>
                  <div className="col-span-4">
                    <label className="block mb-1 font-medium text-lg">Số nhà, tên đường, thôn/xóm/khu phố <span className="text-red-500">*</span></label>
                    <input
                      className={`w-full border border-gray-300 rounded px-3 py-2 ${errors.addressDetail ? "border-red-500" : ""}`}
                      placeholder="Số nhà, tên đường, thôn/xóm/khu phố"
                      value={addressDetail}
                      onChange={e => setAddressDetail(e.target.value)}
                    />
                    {errors.addressDetail && <div className="text-red-500 text-sm">{errors.addressDetail}</div>}
                  </div>
                </div>
              </div>

              {/* THÔNG TIN NGƯỜI CẦN CẤP CĂN CƯỚC */}
              <div className="mb-8 border rounded-lg">
                <div className="bg-red-100 px-4 py-2 rounded-t-lg flex items-center">
                  <h3 className="text-lg font-bold flex-1">THÔNG TIN NGƯỜI CẦN CẤP CĂN CƯỚC</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        value="1"
                        name="radIsNCC"
                        id="chkIS_NCC"
                        checked
                        readOnly
                      />
                      <span className="font-medium">Người kê khai là người cần cấp căn cước</span>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="radio"
                        className="mr-2"
                        value="0"
                        name="radIsNCC"
                        id="chkIS_NOT_NCC"
                        readOnly
                      />
                      <span className="font-medium">Người kê khai là cha/ mẹ/ người đại diện hợp pháp của người cần cấp căn cước</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* HÌNH THỨC CẤP */}
              <div className="mb-8 border rounded-lg">
                <div className="bg-red-100 px-4 py-2 rounded-t-lg flex items-center">
                  <h3 className="text-lg font-bold flex-1">Hình thức cấp</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block font-medium">
                      Lý do cấp <span className="text-red-600">*</span>
                    </label>
                    <select
                      className="form-control w-full border rounded px-3 py-2"
                      id="cboLyDoCap"
                      name="cboLyDoCap"
                    >
                      <option value="01">Cấp thẻ căn cước lần đầu</option>
                      <option value="02">Cấp thẻ căn cước chuyển từ CMND 9 số</option>
                      <option value="03">Cấp thẻ căn cước chuyển từ CMND 12 số</option>
                      <option value="17">Cấp thẻ căn cước chuyển từ CCCD mã vạch</option>
                      <option value="19">Cấp thẻ căn cước chuyển từ CCCD gắn chíp</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium">
                      Cơ quan thực hiện <span className="text-red-600">*</span>
                    </label>
                    <div className="flex space-x-4 mt-2">
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="agencyLevel"
                          className="radio radio-xs radio-error mr-2"
                          checked={agencyLevel === "xa"}
                          onChange={() => setAgencyLevel("xa")}
                        />
                        <span>Cấp Xã</span>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="agencyLevel"
                          className="radio radio-xs radio-error mr-2"
                          checked={agencyLevel === "tinh"}
                          onChange={() => setAgencyLevel("tinh")}
                        />
                        <span>Cấp Tỉnh</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium">
                      Địa chỉ cơ quan Công an tiếp nhận, xử lý hồ sơ cấp căn cước, thu nhận sinh trắc học <span className="text-red-600">*</span>
                    </label>
                    <select
                      className="form-control w-full border rounded px-3 py-2"
                      id="cboDiaChiTram"
                      name="cboDiaChiTram"
                      disabled
                    >
                      {agencyLevel === "xa" && fullAddress && (
                        <option>
                          Công an {fullAddress}
                        </option>
                      )}
                      {agencyLevel === "tinh" && provinceName && (
                        <option>
                          Công an {provinceName}
                        </option>
                      )}
                      {/* Nếu muốn hiển thị mặc định khi chưa nhập đủ thông tin */}
                      {((agencyLevel === "xa" && !fullAddress) || (agencyLevel === "tinh" && !provinceName)) && (
                        <option>Vui lòng nhập đầy đủ địa chỉ</option>
                      )}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  className="btn btn-primary"
                  type="button"
                  onClick={handleNextStep}
                >
                  Tiếp theo
                </button>
              </div>
            </>
          )}

          {/* Step 3: ĐĂNG KÝ LỊCH THU NHẬN SINH TRẮC HỌC */}
          {step === 3 && (
            <div>
              <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
                ĐĂNG KÝ LỊCH THU NHẬN SINH TRẮC HỌC
              </h2>
              <div className="max-w-md mx-auto bg-gray-50 rounded-lg shadow p-6">
                <div className="text-center font-semibold mb-2">
                  Chọn ngày muốn đăng ký:
                </div>
                {renderCalendar()}
                {selectedDate && (
                  <div className="text-center mt-4 text-green-700 font-semibold">
                    Đã chọn: {selectedDate.toLocaleDateString("vi-VN")}
                  </div>
                )}
                <div className="flex justify-between mt-8">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="inline-flex items-center justify-center rounded-md bg-gray-200 px-5 py-2 text-gray-800 hover:bg-gray-300 transition"
                  >
                    Quay lại
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep(4)}
                    className="btn btn-primary"
                    disabled={!selectedDate}
                  >
                    Tiếp theo
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Theo dõi kết quả */}
          {step === 4 && (
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Theo dõi kết quả
              </h3>
              <p>
                Số hồ sơ: <span className="font-bold">HS20250001</span>
              </p>
              <p>
                Ngày đăng ký sinh trắc học:{" "}
                <span className="font-bold">
                  {selectedDate ? selectedDate.toLocaleDateString("vi-VN") : ""}
                </span>
              </p>
              <div className="mt-6">
                <ExportDC02PDFButton
                  data={{
                    fullName,
                    dob: birthDate ? birthDate.split("-").reverse().join("      ") : "",
                    gender,
                    idNumber: identifyNumber,
                    address: [addressDetail, wardName, districtName, provinceName].filter(Boolean).join(", "),
                  }}
                >
                  Tải tờ khai DC02 PDF
                </ExportDC02PDFButton>
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
    </>
  );
}