import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";

// Fake data mẫu
// const fakeRequests = [
//     {
//         id: "HS20250001",
//         name: "Nguyễn Văn A",
//         cccd: "012345678901",
//         type: "identitycard",
//         detail: {
//             fullname: "Nguyễn Văn A",
//             birthdate: "01/01/2000",
//             gender: "Nam",
//             phone: "0912345678",
//             email: "a@gmail.com",
//             reason: "Cấp thẻ căn cước lần đầu",
//         },
//         status: "pending",
//     },
//     {
//         id: "HS20250002",
//         name: "Trần Thị B",
//         cccd: "012345678902",
//         type: "passport",
//         detail: {
//             fullname: "Trần Thị B",
//             birthdate: "02/02/2001",
//             gender: "Nữ",
//             phone: "0987654321",
//             email: "b@gmail.com",
//             reason: "Cấp hộ chiếu lần đầu",
//         },
//         status: "approved",
//     },
//     {
//         id: "HS20250003",
//         name: "Lê Văn C",
//         cccd: "012345678903",
//         type: "identitycard",
//         detail: {
//             fullname: "Lê Văn C",
//             birthdate: "03/03/2002",
//             gender: "Nam",
//             phone: "0909090909",
//             email: "c@gmail.com",
//             reason: "Cấp lại do mất",
//         },
//         status: "rejected",
//         rejectReason: "Thiếu giấy tờ xác minh",
//     },
// ];

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
                {filtered.length === 0 && (
                    <div className="text-center text-gray-500 py-12">
                        Không có hồ sơ nào.
                    </div>
                )}
                {filtered.map((r) => (
                    <div
                        key={r.id}
                        className="bg-white rounded-lg shadow p-4 mb-4 flex items-center justify-between"
                    >
                        <div>
                            <div className="font-semibold text-lg">{r.id}</div>
                            <div className="text-gray-700">Tên: {r.name}</div>
                            <div className="text-gray-700">CCCD: {r.cccd}</div>
                        </div>
                        <button
                            className="btn btn-outline btn-primary"
                            onClick={() => setModalDetail(r)}
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
                            Thông tin hồ sơ {modalDetail.id}
                        </h3>
                        <div className="space-y-2">
                            <div>
                                <span className="font-semibold">Họ tên:</span>{" "}
                                {modalDetail.detail.fullname}
                            </div>
                            <div>
                                <span className="font-semibold">Ngày sinh:</span>{" "}
                                {modalDetail.detail.birthdate}
                            </div>
                            <div>
                                <span className="font-semibold">Giới tính:</span>{" "}
                                {modalDetail.detail.gender}
                            </div>
                            <div>
                                <span className="font-semibold">Số CCCD:</span> {modalDetail.cccd}
                            </div>
                            <div>
                                <span className="font-semibold">Số điện thoại:</span>{" "}
                                {modalDetail.detail.phone}
                            </div>
                            <div>
                                <span className="font-semibold">Email:</span>{" "}
                                {modalDetail.detail.email}
                            </div>
                            <div>
                                <span className="font-semibold">Lý do cấp:</span>{" "}
                                {modalDetail.detail.reason}
                            </div>
                            {modalDetail.status === "rejected" && (
                                <div className="text-red-600">
                                    <span className="font-semibold">Lý do từ chối:</span>{" "}
                                    {modalDetail.rejectReason}
                                </div>
                            )}
                        </div>
                        {modalDetail.status === "pending" && (
                            <div className="flex justify-end gap-3 mt-8">
                                <button
                                    className="btn btn-success text-white"
                                    onClick={() => {
                                        // Xử lý duyệt hồ sơ ở đây
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
                <dialog open className="modal" onClose={() => setModalReject(null)}>
                    <div className="modal-box max-w-md">
                        <form method="dialog">
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setModalReject(null)}
                                type="button"
                            >
                                ✕
                            </button>
                        </form>
                        <h3 className="text-lg font-bold mb-4">
                            Lý do từ chối hồ sơ {modalReject.id}
                        </h3>
                        <textarea
                            className="textarea textarea-bordered w-full mb-4"
                            placeholder="Nhập lý do từ chối..."
                            value={rejectReason}
                            onChange={(e) => setRejectReason(e.target.value)}
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                className="btn btn-error"
                                onClick={() => {
                                    // Xử lý từ chối hồ sơ ở đây
                                    setModalReject(null);
                                    setRejectReason("");
                                    alert("Đã từ chối hồ sơ!");
                                }}
                                disabled={!rejectReason.trim()}
                                type="button"
                            >
                                Xác nhận từ chối
                            </button>
                            <button
                                className="btn"
                                onClick={() => setModalReject(null)}
                                type="button"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </dialog>
            )}
        </div>
    );
}