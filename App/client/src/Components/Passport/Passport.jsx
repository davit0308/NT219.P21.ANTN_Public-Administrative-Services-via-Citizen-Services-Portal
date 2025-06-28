import { useState, useEffect } from "react";

export default function Passport() {
  const [pendingCSRs, setPendingCSRs] = useState([]);
  const [modalDetail, setModalDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Lấy danh sách CSR chờ xác thực
  const fetchPendingCSRs = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ca/certificate-requests");
      if (response.ok) {
        const data = await response.json();
        setPendingCSRs(Array.isArray(data) ? data : []);
      } else {
        setPendingCSRs([]);
      }
    } catch (error) {
      setPendingCSRs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCSRs();
  }, []);

  // Xem chi tiết CSR
  const handleShowDetail = async (csr) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/ca/certificate-request/${csr.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetailData(data);
        setModalDetail(csr);
      }
    } finally {
      setLoading(false);
    }
  };

  // Ký CSR
  const handleSignCSR = async () => {
    if (!modalDetail) return;
    setLoading(true);
    try {
      const response = await fetch("/api/ca/sign-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestId: modalDetail.id }),
      });
      if (response.ok) {
        alert("Đã ký chứng chỉ thành công!");
        setModalDetail(null);
        setDetailData(null);
        fetchPendingCSRs();
      }
    } finally {
      setLoading(false);
    }
  };

  // Lọc theo search
  const filteredCSRs = pendingCSRs.filter((csr) =>
    (csr.citizen_id || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (csr.common_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (csr.record_code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            CA Dashboard - Chờ xác thực
          </h1>
          <p className="text-gray-600 mb-4">
            Danh sách các yêu cầu ký chứng chỉ số (CSR) đang chờ xác thực
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo CCCD, Tên, hoặc mã hồ sơ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchPendingCSRs}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>
        </div>

        {/* CSR List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCSRs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-lg">
              {searchTerm ? "Không tìm thấy yêu cầu nào phù hợp" : "Chưa có yêu cầu nào chờ xác thực"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCSRs.map((csr) => (
              <div
                key={csr.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {csr.common_name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      CCCD: {csr.citizen_id}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Chờ ký
                  </span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Mã hồ sơ:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {csr.record_code}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ngày gửi:</span>
                    <span className="text-sm text-gray-900">
                      {csr.created_at ? new Date(csr.created_at).toLocaleDateString("vi-VN") : ""}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowDetail(csr)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {modalDetail && detailData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Chi tiết yêu cầu ký chứng chỉ số (CSR)
                </h2>
                <button
                  onClick={() => {
                    setModalDetail(null);
                    setDetailData(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* CSR Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Thông tin yêu cầu
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Mã hồ sơ</label>
                      <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                        {detailData.record_code}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tên chủ sở hữu</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {detailData.common_name}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">CCCD</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {detailData.citizen_id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày gửi</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {detailData.created_at ? new Date(detailData.created_at).toLocaleString("vi-VN") : ""}
                      </p>
                    </div>
                  </div>
                </div>
                {/* CSR Content */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Nội dung CSR
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
                      {detailData.csr_content}
                    </pre>
                  </div>
                </div>
              </div>
              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSignCSR}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Ký
                </button>
                <button
                  onClick={() => {
                    setModalDetail(null);
                    setDetailData(null);
                  }}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}