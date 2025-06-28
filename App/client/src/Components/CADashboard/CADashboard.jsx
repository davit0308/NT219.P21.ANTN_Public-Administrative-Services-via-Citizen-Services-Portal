import { useState, useEffect } from "react";

export default function CADashboard() {
    const [activeTab, setActiveTab] = useState("unsigned");
    const [pendingCSRs, setPendingCSRs] = useState([]);
    const [signedCerts, setSignedCerts] = useState([]);
    const [modalDetail, setModalDetail] = useState(null);
    const [detailData, setDetailData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPendingCSRs();
        fetchSignedCertificates();
    }, []);

    const fetchPendingCSRs = async () => {
        try {
            const res = await fetch("/api/ca/certificate-requests");
            if (res.ok) {
                const data = await res.json();
                setPendingCSRs(data);
            }
        } catch (err) {
            console.error("Error fetching CSRs:", err);
        }
    };

    const fetchSignedCertificates = async () => {
        try {
            const res = await fetch("/api/ca/signed-certificates");
            if (res.ok) {
                const data = await res.json();
                setSignedCerts(data);
            }
        } catch (err) {
            console.error("Error fetching signed certificates:", err);
        }
    };

    const handleShowDetail = async (csr) => {
        setLoading(true);
        try {
            const res = await fetch(`/api/ca/certificate-request/${csr.id}`);
            if (res.ok) {
                const data = await res.json();
                setDetailData(data);
                setModalDetail(csr);
            } else {
                alert("Lỗi khi tải chi tiết CSR!");
            }
        } catch (err) {
            console.error("Error fetching CSR detail:", err);
            alert("Lỗi khi tải chi tiết CSR!");
        } finally {
            setLoading(false);
        }
    };

    const handleSignCSR = async () => {
        if (!modalDetail) return;

        setLoading(true);
        try {
            const res = await fetch("/api/ca/sign-certificate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    requestId: modalDetail.id,
                    caOfficerId: "ca_officer_001"
                }),
            });

            if (res.ok) {
                alert("Đã ký chứng chỉ thành công!");
                setModalDetail(null);
                setDetailData(null);
                // Refresh data
                fetchPendingCSRs();
                fetchSignedCertificates();
            } else {
                alert("Lỗi khi ký chứng chỉ!");
            }
        } catch (err) {
            console.error("Error signing certificate:", err);
            alert("Lỗi khi ký chứng chỉ!");
        } finally {
            setLoading(false);
        }
    };

    const renderCSRList = (csrs) => (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {csrs.map((csr) => (
                <div
                    key={csr.id}
                    className="bg-white p-6 rounded-lg shadow-md border hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => handleShowDetail(csr)}
                >
                    <div className="space-y-2">
                        <div className="font-semibold text-gray-800">
                            Mã hồ sơ: {csr.record_code}
                        </div>
                        <div className="text-sm text-gray-600">
                            Tên: {csr.user_name}
                        </div>
                        <div className="text-sm text-gray-600">
                            CCCD: {csr.user_id}
                        </div>
                        <div className="text-sm text-gray-600">
                            Cán bộ: {csr.officer_id}
                        </div>
                        <div className="text-sm text-gray-600">
                            Ngày tạo: {new Date(csr.created_date).toLocaleDateString('vi-VN')}
                        </div>
                        {csr.ca_signature_date && (
                            <div className="text-sm text-green-600">
                                Ngày ký: {new Date(csr.ca_signature_date).toLocaleDateString('vi-VN')}
                            </div>
                        )}
                        <div className={`text-sm font-medium ${csr.status === 'pending' ? 'text-yellow-600' : 'text-green-600'
                            }`}>
                            {csr.status === 'pending' ? 'Chờ ký' : 'Đã ký'}
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                    <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        CA Dashboard - Quản lý chứng chỉ số
                    </h1>

                    {/* Tabs */}
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setActiveTab("unsigned")}
                            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "unsigned"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Chờ xác thực ({pendingCSRs.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("signed")}
                            className={`px-4 py-2 rounded-lg font-medium ${activeTab === "signed"
                                    ? "bg-blue-500 text-white"
                                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                                }`}
                        >
                            Đã xác thực ({signedCerts.length})
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-6">
                    {activeTab === "unsigned" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                CSR chờ xác thực
                            </h2>
                            {pendingCSRs.length === 0 ? (
                                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                                    Không có CSR nào chờ xác thực
                                </div>
                            ) : (
                                renderCSRList(pendingCSRs)
                            )}
                        </div>
                    )}

                    {activeTab === "signed" && (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-4">
                                Chứng chỉ đã ký
                            </h2>
                            {signedCerts.length === 0 ? (
                                <div className="bg-white p-8 rounded-lg shadow text-center text-gray-500">
                                    Chưa có chứng chỉ nào được ký
                                </div>
                            ) : (
                                renderCSRList(signedCerts)
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {modalDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">
                                    Chi tiết CSR - {modalDetail.record_code}
                                </h3>
                                <button
                                    onClick={() => {
                                        setModalDetail(null);
                                        setDetailData(null);
                                    }}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {loading ? (
                                <div className="text-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                                    <p className="mt-2 text-gray-600">Đang tải...</p>
                                </div>
                            ) : detailData ? (
                                <div className="space-y-6">
                                    {/* User Info */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">Thông tin người dùng</h4>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>Họ tên: {detailData.user_name}</div>
                                            <div>CCCD: {detailData.user_id}</div>
                                            <div>Mã hồ sơ: {detailData.record_code}</div>
                                            <div>Cán bộ xử lý: {detailData.officer_id}</div>
                                            <div>Ngày nộp: {detailData.submit_date ? new Date(detailData.submit_date).toLocaleDateString('vi-VN') : 'N/A'}</div>
                                            <div>Ngày tạo CSR: {new Date(detailData.created_date).toLocaleDateString('vi-VN')}</div>
                                        </div>
                                    </div>

                                    {/* CSR Data */}
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <h4 className="font-semibold text-gray-800 mb-2">CSR Data</h4>
                                        <textarea
                                            value={atob(detailData.csr_data)}
                                            readOnly
                                            className="w-full h-32 p-2 border rounded-md font-mono text-xs bg-white"
                                        />
                                    </div>

                                    {/* Actions */}
                                    {modalDetail.status === 'pending' && (
                                        <div className="flex justify-end space-x-4">
                                            <button
                                                onClick={() => {
                                                    setModalDetail(null);
                                                    setDetailData(null);
                                                }}
                                                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                                            >
                                                Hủy
                                            </button>
                                            <button
                                                onClick={handleSignCSR}
                                                disabled={loading}
                                                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50"
                                            >
                                                {loading ? "Đang ký..." : "Ký CSR"}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-red-500">
                                    Lỗi khi tải chi tiết CSR
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
