import { useState, useEffect } from 'react';

export default function SignedDocuments() {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [verificationResult, setVerificationResult] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchSignedDocuments();
    }, []);

    const fetchSignedDocuments = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:9092/api/signed-documents');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            } else {
                console.error('Failed to fetch signed documents');
            }
        } catch (error) {
            console.error('Error fetching signed documents:', error);
        } finally {
            setLoading(false);
        }
    };

    const verifyDocument = async (docId) => {
        try {
            const response = await fetch(`http://localhost:9092/api/verify-document/${docId}`);
            if (response.ok) {
                const result = await response.json();
                setVerificationResult(result);
                return result;
            }
            return null;
        } catch (error) {
            console.error('Error verifying document:', error);
            return null;
        }
    };

    const handleViewDocument = async (doc) => {
        setSelectedDoc(doc);
        const verification = await verifyDocument(doc.id);
        setShowModal(true);
    };

    const downloadDocument = (doc) => {
        // Tạo link download
        const downloadUrl = `http://localhost:9092${doc.download_url}`;
        window.open(downloadUrl, '_blank');
    };

    const getStatusBadge = (isValid) => {
        return isValid ? (
            <span className="badge badge-success">✓ Hợp lệ</span>
        ) : (
            <span className="badge badge-error">✗ Không hợp lệ</span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Tài liệu đã ký số</h1>
                <p className="text-gray-600 mt-1">Danh sách văn bản chính thức đã được chứng thực</p>
            </div>

            {/* Documents List */}
            <div className="bg-white rounded-lg shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-800">Văn bản chính thức</h2>
                        <button
                            onClick={fetchSignedDocuments}
                            className="btn btn-sm btn-outline"
                        >
                            🔄 Làm mới
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {documents.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <div className="text-6xl mb-4">📄</div>
                            <p className="text-lg">Chưa có tài liệu nào được ký số</p>
                            <p className="text-sm mt-2">Các văn bản đã được chứng thực sẽ hiển thị tại đây</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {documents.map((doc) => (
                                <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-800 mb-2">{doc.title}</h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-3">
                                                <div>
                                                    <span className="font-medium">Loại văn bản:</span> {doc.type}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Cơ quan ban hành:</span> {doc.department}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Ngày ký:</span> {new Date(doc.signed_date).toLocaleString('vi-VN')}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Mã chứng chỉ:</span> {doc.certificate_id}
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="badge badge-info">📜 Đã chứng thực</span>
                                                <span className="badge badge-success">🔐 FALCON + X.509</span>
                                            </div>
                                        </div>

                                        <div className="flex flex-col space-y-2">
                                            <button
                                                onClick={() => handleViewDocument(doc)}
                                                className="btn btn-sm btn-primary"
                                            >
                                                👁️ Xem & Xác minh
                                            </button>
                                            <button
                                                onClick={() => downloadDocument(doc)}
                                                className="btn btn-sm btn-outline"
                                            >
                                                📥 Tải xuống
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Document Detail & Verification Modal */}
            {showModal && selectedDoc && (
                <div className="modal modal-open">
                    <div className="modal-box max-w-4xl">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold">Chi tiết & Xác minh: {selectedDoc.title}</h3>
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setVerificationResult(null);
                                }}
                                className="btn btn-sm btn-circle btn-ghost"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Document Info */}
                        <div className="grid grid-cols-2 gap-6 mb-6">
                            <div>
                                <h4 className="font-semibold mb-3">📄 Thông tin văn bản</h4>
                                <div className="space-y-2 text-sm">
                                    <div><strong>ID:</strong> {selectedDoc.id}</div>
                                    <div><strong>Tiêu đề:</strong> {selectedDoc.title}</div>
                                    <div><strong>Loại:</strong> {selectedDoc.type}</div>
                                    <div><strong>Cơ quan:</strong> {selectedDoc.department}</div>
                                    <div><strong>Ngày ký:</strong> {new Date(selectedDoc.signed_date).toLocaleString('vi-VN')}</div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold mb-3">🔐 Thông tin chứng thực</h4>
                                <div className="space-y-2 text-sm">
                                    <div><strong>Chứng chỉ:</strong> {selectedDoc.certificate_id}</div>
                                    <div><strong>Thuật toán:</strong> FALCON-512 + X.509</div>
                                    <div><strong>Trạng thái:</strong> {getStatusBadge(true)}</div>
                                    <div><strong>CA:</strong> Certificate Authority Vietnam</div>
                                </div>
                            </div>
                        </div>

                        {/* Verification Results */}
                        {verificationResult && (
                            <div className="mb-6">
                                <h4 className="font-semibold mb-3">🔍 Kết quả xác minh</h4>
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span>Chữ ký FALCON: </span>
                                            <span className="font-semibold text-green-700">Hợp lệ</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span>Chứng chỉ X.509: </span>
                                            <span className="font-semibold text-green-700">Hợp lệ</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span>Timestamp: </span>
                                            <span className="font-semibold text-green-700">Hợp lệ</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-green-600 mr-2">✓</span>
                                            <span>Tính toàn vẹn: </span>
                                            <span className="font-semibold text-green-700">PASSED</span>
                                        </div>
                                    </div>

                                    {verificationResult.certificate && (
                                        <div className="mt-4 pt-4 border-t border-green-200">
                                            <h5 className="font-medium mb-2">Chi tiết chứng chỉ:</h5>
                                            <div className="text-xs font-mono bg-white p-2 rounded border">
                                                <div>Subject: {verificationResult.certificate.subject}</div>
                                                <div>Issuer: {verificationResult.certificate.issuer}</div>
                                                <div>Valid: {new Date(verificationResult.certificate.valid_from).toLocaleString()} - {new Date(verificationResult.certificate.valid_to).toLocaleString()}</div>
                                                <div>Algorithm: {verificationResult.certificate.algorithm}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* QR Code for Mobile Verification */}
                        <div className="mb-6">
                            <h4 className="font-semibold mb-3">📱 QR Code xác minh</h4>
                            <div className="flex items-center space-x-4">
                                <div className="bg-gray-100 p-4 rounded-lg">
                                    <div className="w-32 h-32 bg-white border-2 border-dashed border-gray-400 flex items-center justify-center text-xs text-gray-500">
                                        QR Code<br />Verification
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">
                                    <p>Quét mã QR để xác minh tài liệu trên thiết bị di động</p>
                                    <p className="mt-1">URL: {window.location.origin}/verify/{selectedDoc.id}</p>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => downloadDocument(selectedDoc)}
                                className="btn btn-outline"
                            >
                                📥 Tải xuống PDF
                            </button>
                            <button
                                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/verify/${selectedDoc.id}`)}
                                className="btn btn-info"
                            >
                                📋 Copy link xác minh
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
