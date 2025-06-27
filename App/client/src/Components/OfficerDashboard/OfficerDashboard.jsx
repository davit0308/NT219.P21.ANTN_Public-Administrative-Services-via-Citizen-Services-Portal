import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const navTabs = [
    { key: "identitycard", label: "Quản lý tài liệu căn cước công dân" },
    { key: "passport", label: "Quản lý tài liệu hộ chiếu" },
];

const statusTabs = [
    { key: "unsigned", label: "Tài liệu chưa ký" },
    { key: "sent_for_verification", label: "Tài liệu đã gửi xác thực" },
    { key: "signed", label: "Tài liệu đã ký" },
];

export default function OfficerDashboard() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [nav, setNav] = useState(
        tabParam === "passport" ? "passport" : "identitycard"
    );
    const [statusTab, setStatusTab] = useState("unsigned");
    const [modalDetail, setModalDetail] = useState(null);
    const [modalReject, setModalReject] = useState(null);
    const [modalUpload, setModalUpload] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [requests, setRequests] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [uploadFile, setUploadFile] = useState(null);
    const [isDragOver, setIsDragOver] = useState(false); const handleShowDetail = async (record) => {
        setModalDetail(record);
        setPdfUrl(null);
        try {
            // Gọi API lấy thông tin chi tiết (bao gồm encryptedPdf, aesKey, iv, isUploaded)
            const res = await fetch(`/api/identity-card-request/${record.recordCode}`);
            if (!res.ok) {
                setPdfUrl(null);
                return;
            }
            const data = await res.json();

            if (!data.isUploaded && data.aesKey && data.iv) {
                // Giải mã PDF
                const pdfBytes = await decryptPdf(data.encryptedPdf, data.aesKey, data.iv);
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                setPdfUrl(URL.createObjectURL(blob));
            } else if (data.encryptedPdf) {
                // Không mã hóa, chỉ cần decode base64
                const pdfBytes = Uint8Array.from(atob(data.encryptedPdf), c => c.charCodeAt(0));
                const blob = new Blob([pdfBytes], { type: "application/pdf" });
                setPdfUrl(URL.createObjectURL(blob));
            } else {
                setPdfUrl(null);
            }
        } catch (err) {
            setPdfUrl(null);
        }
    };

    // Check for certificate updates periodically
    useEffect(() => {
        const checkCertificateUpdates = async () => {
            try {
                const res = await fetch("/api/officer/check-certificate-updates");
                if (res.ok) {
                    const updates = await res.json();
                    if (updates.length > 0) {
                        console.log("📋 Certificate updates available:", updates);
                        // Apply certificates automatically
                        await fetch("/api/check-and-apply-certificates", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" }
                        });
                        // Refresh the requests list
                        const requestsRes = await fetch("/api/identity-card-requests");
                        if (requestsRes.ok) {
                            const data = await requestsRes.json();
                            setRequests(data);
                        }
                    }
                }
            } catch (err) {
                console.error("Error checking certificate updates:", err);
            }
        };

        // Check immediately
        checkCertificateUpdates();

        // Check every 30 seconds
        const interval = setInterval(checkCertificateUpdates, 30000);
        return () => clearInterval(interval);
    }, []);

    // Fetch dữ liệu từ backend
    useEffect(() => {
        fetch("/api/identity-card-requests")
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(() => setRequests([]));
    }, []);

    // Cleanup blob URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    // Đồng bộ nav với query string khi URL thay đổi
    useEffect(() => {
        setNav(tabParam === "passport" ? "passport" : "identitycard");
    }, [tabParam]);

    // Lọc hồ sơ theo nav và status
    const filtered = requests.filter(
        (r) => r.type === nav && r.status === statusTab
    );

    const filteredRequests = requests.filter(r => {
        if (statusTab === "unsigned") return r.status === "pending";
        if (statusTab === "sent_for_verification") return r.status === "approved";
        if (statusTab === "signed") return r.status === "rejected";
        return true;
    });

    const handleAccept = async () => {
        try {
            const res = await fetch("/api/approve-identity-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recordCode: modalDetail.recordCode,
                    officerId: "officer123",
                }),
            });
            if (res.ok) {
                alert("Đã duyệt và ký số thành công!");
                setModalDetail(null);
                // Fetch lại danh sách hồ sơ để cập nhật trạng thái
                fetch("/api/identity-card-requests")
                    .then(res => res.json())
                    .then(data => setRequests(data))
                    .catch(() => setRequests([]));
            } else {
                alert("Lỗi khi duyệt!");
            }
        } catch (err) {
            alert("Lỗi khi duyệt!");
        }
    };

    const handleSendConfirmation = async (record) => {
        if (!record.recordCode) {
            alert("Thiếu mã hồ sơ (recordCode)!");
            return;
        }
        try {
            const pdfBytes = await fetchPdfBytes(record.recordCode);

            // 2. Gửi lên backend để tạo CSR
            const res = await fetch("/api/generate-csr", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    pdfData: Array.from(new Uint8Array(pdfBytes)),
                    recordCode: record.recordCode,
                    officerId: "officer123"
                }),
            });
            if (res.ok) {
                alert("Đã gửi xác nhận thành công!");
                // Cập nhật trạng thái sang "sent_for_verification"
            }
        } catch (err) {
            alert("Không lấy được file PDF: " + err.message);
        }
    };

    const handleUpload = async () => {
        if (!uploadFile) {
            alert("Vui lòng chọn file!");
            return;
        }

        const formData = new FormData();
        formData.append('file', uploadFile);

        try {
            const res = await fetch("/api/upload-document", {
                method: "POST",
                body: formData,
            });

            if (res.ok) {
                alert("Upload thành công!");
                setModalUpload(false);
                setUploadFile(null);
                // Fetch lại danh sách để hiển thị tài liệu mới
                fetch("/api/identity-card-requests")
                    .then(res => res.json())
                    .then(data => setRequests(data))
                    .catch(() => setRequests([]));
            } else {
                alert("Lỗi khi upload!");
            }
        } catch (err) {
            alert("Lỗi khi upload!");
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            setUploadFile(file);
        } else {
            alert('Vui lòng chọn file PDF!');
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
            setUploadFile(file);
        } else {
            alert('Vui lòng chọn file PDF!');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleReject = async () => {
        if (!rejectReason) {
            alert("Vui lòng nhập lý do từ chối!");
            return;
        }
        const res = await fetch("/api/reject-identity-card", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                recordCode: modalReject.recordCode,
                officerId: "officer123",
                reason: rejectReason,
            }),
        });
        if (res.ok) {
            alert("Đã từ chối hồ sơ!");
            setModalReject(null);
            setRejectReason("");
            // Fetch lại danh sách hồ sơ để cập nhật trạng thái
            fetch("/api/identity-card-requests")
                .then(res => res.json())
                .then(data => setRequests(data))
                .catch(() => setRequests([]));
        } else {
            alert("Lỗi khi từ chối!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Upload button */}
            <div className="flex justify-center mt-6">
                <button
                    className="btn btn-primary"
                    onClick={() => setModalUpload(true)}
                >
                    📁 Upload Tài liệu
                </button>
            </div>

            {/* Tabs nhỏ */}
            <div className="flex justify-center mt-6">
                <div className="join">
                    {statusTabs.map((tab) => {
                        let activeClass = "";
                        if (statusTab === tab.key) {
                            if (tab.key === "unsigned") activeClass = "btn-info";
                            else if (tab.key === "sent_for_verification") activeClass = "btn-success";
                            else if (tab.key === "signed") activeClass = "btn-error";
                        }
                        return (
                            <button
                                key={tab.key}
                                className={`btn join-item ${activeClass}`}
                                onClick={() => setStatusTab(tab.key)}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Danh sách tài liệu */}
            <div className="max-w-3xl mx-auto mt-8">
                {filteredRequests.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        Không có tài liệu nào.
                    </div>
                )}
                {filteredRequests.map((r) => (
                    <div
                        key={r.recordCode}
                        className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between"
                    >
                        <div>
                            <div className="font-semibold text-lg">{r.recordCode}</div>
                            <div className="text-gray-700">Tên: {r.userName}</div>
                            <div className="text-gray-700">ID: {r.userId}</div>
                            <div className="text-gray-700">
                                Trạng thái: {
                                    r.status === 'pending' ? 'Chưa ký' :
                                        r.status === 'approved' ? 'Đã gửi xác thực' :
                                            r.status === 'rejected' ? 'Đã ký' : r.status
                                }
                            </div>
                        </div>
                        <button
                            className="btn btn-outline btn-primary"
                            onClick={() => handleShowDetail(r)}
                        >
                            Xem chi tiết
                        </button>
                    </div>
                ))}
            </div>



            {/* Modal xem chi tiết */}
            {modalDetail && (
                <dialog open className="modal" onClose={() => setModalDetail(null)}>
                    <div className="modal-box max-w-2xl">
                        <form method="dialog">
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setModalDetail(null)}
                                type="button"
                            >
                                ✕
                            </button>
                        </form>
                        <h3 className="text-lg font-bold mb-4">
                            Thông tin tài liệu {modalDetail.recordCode}
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Họ tên:</span>{" "}
                                {modalDetail.userName}
                            </div>
                            <div>
                                <span className="font-semibold">Mã định danh:</span>{" "}
                                {modalDetail.userId}
                            </div>
                            <div>
                                <span className="font-semibold">Ngày nộp:</span>{" "}
                                {modalDetail.submitDate}
                            </div>
                            <div>
                                <span className="font-semibold">Trạng thái:</span>{" "}
                                {modalDetail.status}
                            </div>
                            <div>
                                <span className="font-semibold">Ngày duyệt:</span>{" "}
                                {modalDetail.approveDate || "Chưa duyệt"}
                            </div>
                        </div>
                        {/* Xem trước PDF */}
                        {pdfUrl && (
                            <div className="mt-4">
                                <h4 className="font-semibold mb-2">Xem trước tài liệu:</h4>
                                <iframe src={pdfUrl} width="100%" height="600px" title="PDF Preview" />
                            </div>
                        )}
                        {!pdfUrl && (
                            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-yellow-700">
                                    Không thể tải hoặc xem trước tài liệu PDF.
                                    {detailData?.error && (
                                        <span className="block mt-1 text-sm">
                                            Lỗi: {detailData.error}
                                        </span>
                                    )}
                                    <span className="block mt-1 text-sm">
                                        Vui lòng kiểm tra console để biết thêm chi tiết.
                                    </span>
                                </p>
                            </div>
                        )}

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setModalDetail(null)}
                            >
                                Close
                            </button>
                            {modalDetail.status === "pending" && (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleSendConfirmation(modalDetail)}
                                >
                                    Gửi xác nhận
                                </button>
                            )}
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal từ chối */}
            {modalReject && (
                <dialog open className="modal">
                    <div className="modal-box max-w-lg">
                        <h3 className="font-bold text-lg mb-4">Lý do từ chối hồ sơ</h3>
                        <textarea
                            className="textarea textarea-bordered w-full mb-4"
                            value={rejectReason}
                            onChange={e => setRejectReason(e.target.value)}
                            placeholder="Nhập lý do từ chối..."
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="btn btn-error text-white"
                                onClick={async () => {
                                    if (!rejectReason) {
                                        alert("Vui lòng nhập lý do từ chối!");
                                        return;
                                    }
                                    await handleReject();
                                    setModalReject(null); // Đóng modal từ chối
                                    setRejectReason("");  // Reset lý do
                                }}
                            >
                                Xác nhận từ chối
                            </button>
                            <button
                                className="btn"
                                onClick={() => {
                                    setModalReject(null);
                                    setRejectReason("");
                                }}
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </dialog>
            )}

            {/* Modal Upload */}
            {modalUpload && (
                <dialog open className="modal">
                    <div className="modal-box max-w-lg">
                        <h3 className="font-bold text-lg mb-4">Upload Tài liệu PDF</h3>

                        {/* Drag & Drop Area */}
                        <div
                            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                                }`}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                        >
                            {uploadFile ? (
                                <div className="text-green-600">
                                    <div className="text-2xl mb-2">📄</div>
                                    <div className="font-semibold">{uploadFile.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                                    </div>
                                </div>
                            ) : (
                                <div className="text-gray-500">
                                    <div className="text-4xl mb-4">📁</div>
                                    <div className="text-lg font-semibold mb-2">
                                        Kéo thả file PDF vào đây
                                    </div>
                                    <div className="text-sm mb-4">hoặc</div>
                                    <input
                                        type="file"
                                        accept=".pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="file-input"
                                    />
                                    <label
                                        htmlFor="file-input"
                                        className="btn btn-outline btn-primary cursor-pointer"
                                    >
                                        Chọn file
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                className="btn"
                                onClick={() => {
                                    setModalUpload(false);
                                    setUploadFile(null);
                                }}
                            >
                                Hủy
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleUpload}
                                disabled={!uploadFile}
                            >
                                OK
                            </button>
                        </div>
                    </div>
                </dialog>
            )}


        </div>
    );
}

// Hàm lấy PDF bytes từ backend
async function fetchPdfBytes(recordCode) {
    const res = await fetch(`/api/get-pdf/${recordCode}`);
    if (!res.ok) throw new Error("Không tìm thấy PDF");
    const blob = await res.blob();
    return await blob.arrayBuffer();
}

// Thêm hàm giải mã AES-CBC (dùng WebCrypto)
async function decryptPdf(encryptedBase64, keyBase64, ivBase64) {
    const encrypted = Uint8Array.from(atob(encryptedBase64), c => c.charCodeAt(0));
    const keyRaw = Uint8Array.from(atob(keyBase64), c => c.charCodeAt(0));
    const iv = Uint8Array.from(atob(ivBase64), c => c.charCodeAt(0));

    const cryptoKey = await window.crypto.subtle.importKey(
        "raw",
        keyRaw,
        { name: "AES-CBC" },
        false,
        ["decrypt"]
    );
    const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-CBC", iv },
        cryptoKey,
        encrypted
    );
    return new Uint8Array(decrypted);
}
