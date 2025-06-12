import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

const navTabs = [
    { key: "identitycard", label: "Xét duyệt yêu cầu cấp căn cước công dân" },
    { key: "passport", label: "Xét duyệt yêu cầu cấp hộ chiếu" },
];

const statusTabs = [
    { key: "pending", label: "Hồ sơ chờ duyệt" },
    { key: "approved", label: "Hồ sơ đã duyệt" },
    { key: "rejected", label: "Hồ sơ từ chối" },
];

export default function OfficerDashboard() {
    const [searchParams] = useSearchParams();
    const tabParam = searchParams.get("tab");
    const [nav, setNav] = useState(
        tabParam === "passport" ? "passport" : "identitycard"
    );
    const [statusTab, setStatusTab] = useState("pending");
    const [modalDetail, setModalDetail] = useState(null);
    const [modalReject, setModalReject] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [requests, setRequests] = useState([]);
    const [detailData, setDetailData] = useState(null);
    const [pdfUrl, setPdfUrl] = useState(null);

    const handleShowDetail = async (record) => {
        try {
            const res = await fetch(`/api/identity-card-request/${record.recordCode}`);
            const data = await res.json();
            setDetailData(data);
            setModalDetail(record);

            // Giải mã PDF trên client
            const encryptedPdf = Uint8Array.from(atob(data.encryptedPdf), c => c.charCodeAt(0));
            const iv = Uint8Array.from(atob(data.iv), c => c.charCodeAt(0));
            const aesKeyRaw = Uint8Array.from(atob(data.aesKey), c => c.charCodeAt(0));
            const aesKey = await window.crypto.subtle.importKey(
                "raw",
                aesKeyRaw,
                { name: "AES-GCM" },
                false,
                ["decrypt"]
            );
            const decryptedPdf = await window.crypto.subtle.decrypt(
                { name: "AES-GCM", iv },
                aesKey,
                encryptedPdf
            );
            const blob = new Blob([decryptedPdf], { type: "application/pdf" });
            setPdfUrl(URL.createObjectURL(blob));
        } catch (err) {
            setDetailData(null);
            setModalDetail(record);
            setPdfUrl(null);
        }
    };

    // Fetch dữ liệu từ backend
    useEffect(() => {
        fetch("/api/identity-card-requests")
            .then(res => res.json())
            .then(data => setRequests(data))
            .catch(() => setRequests([]));
    }, []);

    // Đồng bộ nav với query string khi URL thay đổi
    useEffect(() => {
        setNav(tabParam === "passport" ? "passport" : "identitycard");
    }, [tabParam]);

    // Lọc hồ sơ theo nav và status
    const filtered = requests.filter(
        (r) => r.type === nav && r.status === statusTab
    );

    const filteredRequests = requests.filter(r => {
        if (statusTab === "pending") return r.status === "Chờ duyệt" || r.status === "pending";
        if (statusTab === "approved") return r.status === "approved";
        if (statusTab === "rejected") return r.status === "rejected";
        return true;
    });

    const handleAccept = async () => {
        try {
            // Gửi yêu cầu ký số lên server (ví dụ /api/approve-identity-card)
            const res = await fetch("/api/approve-identity-card", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    recordCode: modalDetail.recordCode,
                    officerId: "officer123", // hoặc lấy từ session
                }),
            });
            if (res.ok) {
                alert("Đã duyệt và ký số thành công!");
                setModalDetail(null);
                // Cập nhật lại danh sách hồ sơ
            } else {
                alert("Lỗi khi duyệt!");
            }
        } catch (err) {
            alert("Lỗi khi duyệt!");
        }
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
                recordCode: modalDetail.recordCode,
                officerId: "officer123", // hoặc lấy từ session
                reason: rejectReason,
            }),
        });
        if (res.ok) {
            alert("Đã từ chối hồ sơ!");
            setModalReject(null);
            // reload lại danh sách
        } else {
            alert("Lỗi khi từ chối!");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Tabs nhỏ */}
            <div className="flex justify-center mt-6">
                <div className="join">
                    {statusTabs.map((tab) => {
                        let activeClass = "";
                        if (statusTab === tab.key) {
                            if (tab.key === "pending") activeClass = "btn-info";
                            else if (tab.key === "approved") activeClass = "btn-success";
                            else if (tab.key === "rejected") activeClass = "btn-error";
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

            {/* Danh sách hồ sơ */}
            <div className="max-w-3xl mx-auto mt-8">
                {filteredRequests.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        Không có hồ sơ nào.
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
                            <div className="text-gray-700">CCCD: {r.userId}</div>
                        </div>
                        <button
                            className="btn btn-outline btn-primary"
                            // onClick={() => setModalDetail(r)}
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
                            Thông tin hồ sơ {modalDetail.recordCode}
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
                            <iframe src={pdfUrl} width="100%" height="600px" title="PDF Preview" />
                        )}
                        {modalDetail.status === "pending" && (
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    className="btn btn-success text-white"
                                    onClick={() => {
                                        setModalDetail(null);
                                        alert("Đã duyệt hồ sơ!");
                                    }}
                                >
                                    Accept
                                </button>
                                <button
                                    className="btn btn-error text-white"
                                    onClick={() => {
                                        setModalDetail(null);
                                        setModalReject(modalDetail);
                                    }}
                                    type="button"
                                >
                                    Reject
                                </button>
                            </div>
                        )}
                    </div>
                </dialog>
            )}

            {/* Modal từ chối */}
            {modalReject && (
                <div>
                    <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Nhập lý do từ chối..." />
                    <button onClick={handleReject}>Xác nhận từ chối</button>
                    <button onClick={() => setModalReject(null)}>Hủy</button>
                </div>
            )}


        </div>
    );
}