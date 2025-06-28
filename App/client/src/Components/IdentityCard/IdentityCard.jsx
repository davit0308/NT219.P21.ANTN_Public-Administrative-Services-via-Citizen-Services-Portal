import { useState, useEffect } from "react";

export default function IdentityCard() {
  const [signedCerts, setSignedCerts] = useState([]);
  const [modalDetail, setModalDetail] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch signed CRTs from the backend
  const fetchSignedCerts = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ca/signed-certificates");
      if (response.ok) {
        const data = await response.json();
        setSignedCerts(Array.isArray(data) ? data : []);
      } else {
        console.error("Failed to fetch signed CRTs");
      }
    } catch (error) {
      console.error("Error fetching signed CRTs:", error);
    } finally {
      setLoading(false);
    }
  };

  // Load signed CRTs on component mount
  useEffect(() => {
    fetchSignedCerts();
  }, []);

  // Handle view CRT details
  const handleShowDetail = async (crt) => {
    try {
      const response = await fetch(`/api/ca/certificate-request/${crt.id}`);
      if (response.ok) {
        const data = await response.json();
        setDetailData(data);
        setModalDetail(crt);
      } else {
        console.error("Failed to fetch CRT details");
      }
    } catch (error) {
      console.error("Error fetching CRT details:", error);
    }
  };

  // Handle download CRT
  const handleDownloadCRT = async (crtId, citizenId) => {
    try {
      const response = await fetch(`/api/ca/download-certificate/${crtId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `certificate_${citizenId}.crt`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download CRT");
      }
    } catch (error) {
      console.error("Error downloading CRT:", error);
    }
  };

  // Filter CRTs based on search term
  const filteredCRTs = signedCerts.filter((crt) =>
    crt.citizen_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crt.common_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    crt.certificate_id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            CA Dashboard - Đã xác thực
          </h1>
          <p className="text-gray-600 mb-4">
            Danh sách các chứng chỉ số đã được ký bởi CA
          </p>

          {/* Search and refresh controls */}
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Tìm kiếm theo CCCD, Tên, hoặc ID chứng chỉ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={fetchSignedCerts}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {filteredCRTs.length}
              </div>
              <div className="text-green-700">Chứng chỉ đã ký</div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {signedCerts.length}
              </div>
              <div className="text-blue-700">Tổng số chứng chỉ</div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {new Set(signedCerts.map(crt => crt.citizen_id)).size}
              </div>
              <div className="text-purple-700">Công dân duy nhất</div>
            </div>
          </div>
        </div>

        {/* CRT List */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredCRTs.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="text-gray-400 text-lg">
              {searchTerm ? "Không tìm thấy chứng chỉ nào phù hợp" : "Chưa có chứng chỉ nào được ký"}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCRTs.map((crt) => (
              <div
                key={crt.certificate_id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {crt.common_name || "N/A"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      CCCD: {crt.citizen_id}
                    </p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Đã ký
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">ID Chứng chỉ:</span>
                    <span className="text-sm font-mono text-gray-900">
                      {crt.certificate_id?.substring(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ngày ký:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(crt.signed_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Hết hạn:</span>
                    <span className="text-sm text-gray-900">
                      {new Date(crt.expires_at).toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleShowDetail(crt)}
                    className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDownloadCRT(crt.certificate_id, crt.citizen_id)}
                    className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Tải xuống
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
                  Chi tiết chứng chỉ số
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
                {/* Certificate Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Thông tin chứng chỉ
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID Chứng chỉ</label>
                      <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                        {detailData.certificate_id}
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
                      <label className="block text-sm font-medium text-gray-700">Ngày ký</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(detailData.signed_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày hết hạn</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(detailData.expires_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Original CSR Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                    Thông tin CSR gốc
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">ID Yêu cầu</label>
                      <p className="mt-1 text-sm font-mono text-gray-900 bg-gray-50 p-2 rounded">
                        {detailData.request_id}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ngày yêu cầu</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {new Date(detailData.created_at).toLocaleString("vi-VN")}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Loại tài liệu</label>
                      <p className="mt-1 text-sm text-gray-900">
                        {detailData.document_type}
                      </p>
                    </div>
                    {detailData.organization && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Tổ chức</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {detailData.organization}
                        </p>
                      </div>
                    )}
                    {detailData.country && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Quốc gia</label>
                        <p className="mt-1 text-sm text-gray-900">
                          {detailData.country}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Certificate Content */}
              <div className="mt-6 space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                  Nội dung chứng chỉ
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap break-all">
                    {detailData.certificate_content}
                  </pre>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => handleDownloadCRT(detailData.certificate_id, detailData.citizen_id)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Tải xuống chứng chỉ
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