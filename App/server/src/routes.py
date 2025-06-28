from flask import Blueprint, request, jsonify,  make_response
from flask_bcrypt import Bcrypt
import jwt
import datetime
import uuid
import os
from .utils.jwt import token_required
from flask import Blueprint, jsonify, session
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.exceptions import InvalidSignature
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import base64
import json
from .models.PassportRequest import PassportRequest
from .models.IdentityCardRequest import IdentityCardRequest
from .models.EncryptedDocument import EncryptedDocument
from .models.PoliceRecord import PoliceRecord
from .models.CertificateRequest import CertificateRequest

from .utils.crypto_utils import generate_csr_from_pdf, sign_csr_with_ca

from mongoengine import connect

from flask_cors import cross_origin,CORS
import os
from dotenv import load_dotenv
from .models.User import User
from pymongo import MongoClient

load_dotenv()
ACCESS_KEY = os.getenv("ACCESS_KEY")

main = Blueprint("main", __name__)
bcrypt = Bcrypt()

CORS(main, supports_credentials=True, origins=["http://localhost:3000"])
# # Giả lập user trong DB (username + hashed password + id)
# users = {
#     "User": {
#         "id": 2,
#         "password": bcrypt.generate_password_hash("123456").decode("utf-8"),
#         "name": "User",
#         "admin": False
#     }
# }

# admin = {
#     "User": {
#         "id": 1,
#         "password": bcrypt.generate_password_hash("123456").decode("utf-8"),
#         "name": "Admin",
#         "admin": True
#     }
# }
connect(
    db=os.getenv("MONGO_DB_NAME"),
    host=os.getenv("MONGO_URI")
)


@main.route("/api/user-data")
@token_required
def user_data():
    return jsonify({"message": "Token hợp lệ", "user": request.user})

@main.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    # admin = data.get("admin")
    print("username", username)
    print("password", password)
    print (User.get(username)["username"])  
    print ("role admin: ", User.get(username)["admin"])  
    
    if not username or not password:
        return jsonify({"success": False, "message": "Thiếu username hoặc mật khẩu"}), 400

    user = User.get(username)
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Tên đăng nhập hoặc mật khẩu không đúng"}), 401

    # Tạo access token (3 giờ)
    access_payload = {
        "id": str(user["id"]),
        "username": user["username"],
        "admin": user["admin"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=3)
    }
    access_token = jwt.encode(access_payload, ACCESS_KEY, algorithm="HS256")

    # Tạo refresh token (3 ngày)
    refresh_payload = {
        "id": str(user["id"]),
        "username": user["username"],
        "admin": user["admin"],
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(days=3)
    }
    refresh_token = jwt.encode(refresh_payload, ACCESS_KEY, algorithm="HS256")

    response = make_response(jsonify({
        "success": True,
        "message": "Đăng nhập thành công",
        "token": access_token,
        "userData": {
            "username": username,
            "name": user["name"],
            "admin": user["admin"],
        }
    }))
    # Set refresh token trong cookie (HttpOnly, Secure)
    response.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Strict", max_age=3*24*60*60)

    return response

@main.route("/api/refresh-token", methods=["POST"])
def refresh_token():
    refresh_token = request.cookies.get("refresh_token")

    if not refresh_token:
        return jsonify({"success": False, "message": "Không có refresh token"}), 401

    try:
        data = jwt.decode(refresh_token, ACCESS_KEY, algorithms=["HS256"])
        # Tạo lại access token mới
        new_access_token = jwt.encode({
            "id": data["id"],
            "username": data["username"],
            "admin": data["admin"],
            "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=3)
        }, ACCESS_KEY, algorithm="HS256")

        return jsonify({"success": True, "token": new_access_token}), 200

    except jwt.ExpiredSignatureError:
        return jsonify({"success": False, "message": "Refresh token đã hết hạn"}), 403
    except jwt.InvalidTokenError:
        return jsonify({"success": False, "message": "Refresh token không hợp lệ"}), 403

 
@main.route("/api/logout", methods=["POST"])
@cross_origin(origin="http://localhost:5173", supports_credentials=True)
def logout():
    response = make_response(jsonify({"message": "Đăng xuất thành công"}), 200)
    response.set_cookie("refresh_token", "", max_age=0, httponly=True, samesite="Strict")
    return response


# Sinh keypair ECDH (prime256v1 có tên gọi khác là P-256 hay secp256r1)
server_private_key = ec.generate_private_key(ec.SECP256R1())
server_public_key = server_private_key.public_key()

@main.route("/api/ecdh-params", methods=["GET"])
def get_ecdh_params():
    pub_bytes = server_public_key.public_bytes(
        serialization.Encoding.PEM,
        serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return jsonify({
        "server_public_key": pub_bytes.decode()
    })

@main.route("/api/ecdh-exchange", methods=["POST"])
def ecdh_exchange():
    client_pub_pem = request.json["client_public_key"].encode()
    client_public_key = serialization.load_pem_public_key(client_pub_pem)
    shared_key = server_private_key.exchange(ec.ECDH(), client_public_key)
    session_key = HKDF(
        algorithm=hashes.SHA256(),
        length=32,
        salt=None,
        info=b'handshake data'
    ).derive(shared_key)
    session["session_key"] = base64.b64encode(session_key).decode()
    return jsonify({"success": True})


api = Blueprint('api', __name__)
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]

import base64

@api.route('/api/upload-signed-pdf', methods=['POST'])
def upload_signed_pdf():
    data = request.get_json()
    try:
        print("📥 Dữ liệu nhận được:", data.keys())
        print("🔢 Kích thước PDF bytes:", len(data["pdfBytes"]))

        # Nếu signature và publicKey là list số nguyên
        sig_b64 = base64.b64encode(bytearray(data["signature"])).decode()
        # Nếu publicKey là base64 string từ client, dùng luôn:
        pub_b64 = data["publicKey"]

        # Nếu pdfBytes là list số nguyên:
        pdf_bytes = bytes(data["pdfBytes"])
        # Nếu pdfBytes là base64 string:
        # pdf_bytes = base64.b64decode(data["pdfBytes"])

        request_doc = PassportRequest(
            userInfo = data["userInfo"],
            signature = sig_b64,
            publicKey = pub_b64,
            sigAlg = data["sigAlg"],
            pdfBytes = pdf_bytes
        )
        request_doc.save()

        return jsonify({"status": "ok"})
    except Exception as e:
        print("❌ Lỗi lưu DB:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@api.route('/api/upload-signed-cccd', methods=['POST'])
def upload_signed_cccd():
    data = request.get_json()
    try:
        sig_b64 = base64.b64encode(bytearray(data["signature"])).decode()
        pub_b64 = data["publicKey"]
        pdf_bytes = bytes(data["pdfBytes"])

        request_doc = IdentityCardRequest(
            userInfo = data["userInfo"],
            signature = sig_b64,
            publicKey = pub_b64,
            sigAlg = data["sigAlg"],
            pdfBytes = pdf_bytes
        )
        request_doc.save()

        return jsonify({"status": "ok"})
    except Exception as e:
        print("❌ Lỗi lưu DB CCCD:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

@api.route('/api/upload-encrypted-doc', methods=['POST'])
def upload_encrypted_doc():
    data = request.get_json()
    try:
        encrypted_pdf = bytes(data["encryptedPdf"])
        iv = bytes(data["iv"])
        encrypted_aes_key = bytes(data["encryptedAESKey"])
        user_info = data["userInfo"]

        # Giải mã AES key bằng private RSA
        from .utils.rsa_utils import load_private_key, decrypt_rsa_oaep
        private_key = load_private_key()  # Đọc từ file .pem
        aes_key = decrypt_rsa_oaep(private_key, encrypted_aes_key)

        # Lưu AES key xuống local storage (mô phỏng vault)
        from src.utils.rsa_utils import save_aes_key
        save_aes_key(user_info['identifyNumber'], aes_key)

        doc = EncryptedDocument(
            userInfo=user_info,
            encryptedPdf=encrypted_pdf,
            iv=iv,
            encryptedAESKey=encrypted_aes_key,
            recordCode=user_info.get("recordCode")  # Đảm bảo có dòng này!
        )
        doc.save()

        # Lưu hồ sơ cho công an
        police_record = PoliceRecord(
            userId=user_id,
            userName="Uploaded Document",
            recordCode=record_code,
            submitDate=datetime.datetime.utcnow(),
            status="unsigned",  # Đổi từ "unsigned" sang "unsigned"
            approveDate=None
        )
        police_record.save()

        return jsonify({"status": "ok"})
    except Exception as e:
        print("❌ Lỗi lưu DB:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

def verify_signature(pdf_bytes, signature_bytes, public_key_b64):
    public_key = serialization.load_der_public_key(base64.b64decode(public_key_b64))
    digest = hashes.Hash(hashes.SHA256())
    digest.update(pdf_bytes)
    pdf_hash = digest.finalize()
    try:
        public_key.verify(signature_bytes, pdf_hash, ec.ECDSA(hashes.SHA256()))
        return True
    except InvalidSignature:
        return False


@main.route("/api/server-rsa-public-key", methods=["GET"])
def get_server_rsa_public_key():
    from src.utils.rsa_utils import load_public_key_pem
    pem = load_public_key_pem()  # Hàm này trả về chuỗi PEM public key
    return jsonify({"publicKey": pem})


@api.route('/api/upload-document', methods=['POST'])
def upload_document():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
            
        if not file.filename.endswith('.pdf'):
            return jsonify({"error": "Only PDF files are allowed"}), 400
        
        # Read PDF content
        pdf_content = file.read()
        print(f"📄 PDF content size: {len(pdf_content)} bytes")
        
        # Validate PDF signature
        if not pdf_content.startswith(b'%PDF-'):
            print(f"❌ Invalid PDF file - does not start with PDF signature")
            print(f"❌ First 20 bytes: {pdf_content[:20]}")
            return jsonify({"error": "Invalid PDF file"}), 400
        
        print(f"✅ Valid PDF signature detected")
        print(f"📋 PDF header: {pdf_content[:20].decode('latin-1', errors='ignore')}")
        
        # Generate a unique record code
        import uuid
        record_code = "DOC" + str(uuid.uuid4())[:8].upper()
        user_id = "UPLOAD_" + str(uuid.uuid4())[:8]
        
        print(f"🆔 Generated userId: {user_id}")
        print(f"🆔 Generated recordCode: {record_code}")
        
        # Create a police record with pending status (maps to "unsigned" on frontend)
        police_record = PoliceRecord(
            userId=user_id,
            userName="Uploaded Document",
            recordCode=record_code,
            submitDate=datetime.datetime.utcnow(),
            status="unsigned",  # This will be mapped to "unsigned" on frontend
            approveDate=None
        )
        police_record.save()
        print(f"✅ Police record saved with userId: {police_record.userId}")
        
        # Save the PDF to EncryptedDocument (for simplicity, not encrypting here)
        # In a real scenario, you might want to encrypt this
        user_info = {
            "identifyNumber": user_id,
            "fullName": f"Uploaded Document - {file.filename}",
            "recordCode": record_code
        }

        
        doc = EncryptedDocument(
            userInfo=user_info,
            encryptedPdf=pdf_content,
            iv=b'dummy_iv_for_uploaded_doc',  # Dummy IV since we're not encrypting
            encryptedAESKey=b'dummy_aes_key',  # Dummy AES key
            recordCode=record_code            # <-- BẮT BUỘC PHẢI CÓ DÒNG NÀY
        )
        doc.save()
        print(f"✅ EncryptedDocument saved with userInfo: {user_info}")
        
        return jsonify({"status": "ok", "message": "Document uploaded successfully"})
        
    except Exception as e:
        print(f"❌ Lỗi upload document: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"status": "error", "message": str(e)}), 500

@api.route('/api/send-confirmation', methods=['POST'])
def send_confirmation():
    data = request.get_json()
    record_code = data.get("recordCode")
    officer_id = data.get("officerId")
    pdf_data = data.get("pdfData")  # PDF bytes array from frontend
    user_info = data.get("userInfo")
    signature = data.get("signature")
    public_key = data.get("publicKey")
    sig_alg = data.get("sigAlg")
    
    try:
        # Convert PDF data array back to bytes
        if pdf_data:
            pdf_bytes = bytes(pdf_data)
        else:
            pdf_bytes = b'dummy_pdf_data'

        # Create or update PoliceRecord
        police_record = PoliceRecord.objects(recordCode=record_code).first()
        if not police_record:
            # Create new police record
            police_record = PoliceRecord(
                userId=user_info.get("identifyNumber") or user_info.get("cccdNumber"),
                userName=user_info.get("fullName"),
                recordCode=record_code,
                submitDate=datetime.datetime.utcnow(),
                status="unsigned"
            )
            police_record.save()

        # Create or update EncryptedDocument
        encrypted_doc = EncryptedDocument.objects(recordCode=record_code).first()
        if not encrypted_doc:
            encrypted_doc = EncryptedDocument(
                recordCode=record_code,
                userInfo=user_info,
                encryptedPdf=pdf_bytes,
                encryptedContent=pdf_bytes
            )
            encrypted_doc.save()

        # Save to appropriate collection based on document type
        if "CCCD" in record_code:
            # Save as IdentityCardRequest
            identity_request = IdentityCardRequest(
                userInfo=user_info,
                signature=str(signature),
                publicKey=public_key,
                sigAlg=sig_alg,
                pdfBytes=pdf_bytes
            )
            identity_request.save()
        elif "PASSPORT" in record_code:
            # Save as PassportRequest
            passport_request = PassportRequest(
                userInfo=user_info,
                signature=str(signature),
                publicKey=public_key,
                sigAlg=sig_alg,
                pdfBytes=pdf_bytes
            )
            passport_request.save()

        # Tạo CSR từ PDF
        csr_pem = generate_csr_from_pdf(pdf_bytes, record_code, officer_id)

        # Lưu CSR vào database
        cert_request = CertificateRequest(
            record_code=record_code,
            csr_data=csr_pem,
            officer_id=officer_id,
            status="unsigned"
        )
        cert_request.save()

        # Cập nhật trạng thái hồ sơ thành "sent_for_verification" (maps to "sent_for_verification" on frontend)
        police_record.status = "sent_for_verification"  # Đổi từ "sent_for_verification"
        police_record.approveDate = datetime.datetime.utcnow()
        police_record.save()

        return jsonify({
            "status": "ok", 
            "message": "CSR generated and sent for verification",
            "csr_id": str(cert_request.id)
        })
    except Exception as e:
        print(f"Error in send_confirmation: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/identity-card-requests', methods=['GET'])
def get_identity_card_requests():
    try:
        requests = PoliceRecord.objects()
        result = []
        for req in requests:
            record_code = str(getattr(req, "recordCode", req.id))
            status = getattr(req, "status", "unsigned")

            # Xác định loại tài liệu
            if "CCCD" in record_code:
                doc_type = "identitycard"
            elif "PASSPORT" in record_code:
                doc_type = "passport"
            else:
                doc_type = "identitycard"

            # Mapping status giữ nguyên theo backend mới
            # (unsigned, sent_for_verification, signed)
            mapped_status = status

            result.append({
                "userId": str(getattr(req, "userId", "")),
                "userName": getattr(req, "userName", ""),
                "recordCode": record_code,
                "submitDate": str(getattr(req, "submitDate", "")),
                "status": mapped_status,
                "type": doc_type,
                "originalStatus": status,
                "approveDate": str(getattr(req, "approveDate", "")) if getattr(req, "approveDate", None) else ""
            })
        return jsonify(result)
    except Exception as e:
        print("Lỗi lấy danh sách requests:", e)
        return jsonify([]), 500

@api.route('/api/identity-card-request/<record_code>', methods=['GET'])
def get_identity_card_request_detail(record_code):
    try:
        print(f"🔍 Looking for record: {record_code}")
        
        # Tìm hồ sơ PoliceRecord
        police_record = PoliceRecord.objects(recordCode=record_code).first()
        if not police_record:
            print(f"❌ No police record found for: {record_code}")
            return jsonify({"error": "Không tìm thấy hồ sơ"}), 404

        # Tìm EncryptedDocument theo userId (identifyNumber)
        user_id = police_record.userId
        print(f"🔍 Looking for EncryptedDocument with userId: {user_id}")
        
        # Try different query methods to find the document
        encrypted_doc = EncryptedDocument.objects(userInfo__identifyNumber=user_id).first()
        
        if not encrypted_doc:
            print(f"❌ No encrypted document found with userInfo__identifyNumber={user_id}")
            # Try alternative query for uploaded documents
            all_docs = EncryptedDocument.objects()
            print(f"📝 Total documents in DB: {len(all_docs)}")
            for doc in all_docs:
                print(f"📄 Document userInfo: {doc.userInfo}")
                if isinstance(doc.userInfo, dict) and doc.userInfo.get('identifyNumber') == user_id:
                    encrypted_doc = doc
                    print(f"✅ Found document via manual search")
                    break
        
        if not encrypted_doc:
            print(f"❌ Still no document found after manual search")
            return jsonify({"error": "Không tìm thấy PDF"}), 404

        print(f"✅ Found document, userInfo: {encrypted_doc.userInfo}")
        
        # Check if this is an uploaded document (starts with UPLOAD_)
        if user_id.startswith("UPLOAD_"):
            print(f"📤 Processing uploaded document")
            print(f"📄 PDF data size: {len(encrypted_doc.encryptedPdf)} bytes")
            
            # Verify the PDF data starts with PDF signature
            if encrypted_doc.encryptedPdf.startswith(b'%PDF-'):
                print(f"✅ Valid PDF signature detected")
            else:
                print(f"❌ Invalid PDF signature, first 10 bytes: {encrypted_doc.encryptedPdf[:10]}")
            
            # For uploaded documents, return the PDF directly without decryption
            return jsonify({
                "userInfo": encrypted_doc.userInfo,
                "encryptedPdf": base64.b64encode(encrypted_doc.encryptedPdf).decode(),
                "iv": "",  # Empty for uploaded docs
                "aesKey": "",  # Empty for uploaded docs
                "isUploaded": True  # Flag to indicate this is an uploaded document
            })
        else:
            print(f"🔐 Processing encrypted document")
            # Original encrypted document handling
            try:
                # Giải mã AES key từ file local
                try:
                    from src.utils.rsa_utils import load_private_key, decrypt_rsa_oaep, save_aes_key
                except ImportError as import_error:
                    print(f"❌ Import error for rsa_utils: {import_error}")
                    return jsonify({"error": "RSA utilities not available"}), 500
                
                aes_key_path = os.path.join("local_aes_keys", f"{user_id}.key")
                
                if not os.path.exists(aes_key_path):
                    print(f"❌ AES key file not found: {aes_key_path}")
                    # For demo purposes, if AES key is missing, treat as uploaded document
                    print(f"🔄 Treating as uploaded document due to missing AES key")
                    return jsonify({
                        "userInfo": encrypted_doc.userInfo,
                        "encryptedPdf": base64.b64encode(encrypted_doc.encryptedPdf).decode(),
                        "iv": "",  # Empty for fallback
                        "aesKey": "",  # Empty for fallback
                        "isUploaded": True  # Treat as uploaded for simplicity
                    })
                
                with open(aes_key_path, "rb") as f:
                    aes_key = f.read()

                print(f"✅ AES key loaded, size: {len(aes_key)} bytes")

                # Trả về PDF đã mã hóa, IV, AES key (dạng base64)
                return jsonify({
                    "userInfo": encrypted_doc.userInfo,
                    "encryptedPdf": base64.b64encode(encrypted_doc.encryptedPdf).decode(),
                    "iv": base64.b64encode(encrypted_doc.iv).decode(),
                    "aesKey": base64.b64encode(aes_key).decode(),
                    "isUploaded": False
                })
            except FileNotFoundError as file_error:
                print(f"❌ File not found error: {file_error}")
                return jsonify({"error": f"Required file not found: {str(file_error)}"}), 404
            except Exception as encrypt_error:
                print(f"❌ Encryption handling error: {encrypt_error}")
                import traceback
                traceback.print_exc()
                return jsonify({"error": f"Error processing encrypted document: {str(encrypt_error)}"}), 500
    except Exception as e:
        print(f"❌ Lỗi lấy chi tiết hồ sơ: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@api.route('/api/approve-identity-card', methods=['POST'])
def approve_identity_card():
    data = request.get_json()
    record_code = data.get("recordCode")
    officer_id = data.get("officerId")
    try:
        # Tìm hồ sơ
        police_record = PoliceRecord.objects(recordCode=record_code).first()
        if not police_record:
            return jsonify({"error": "Không tìm thấy hồ sơ"}), 404

        # Cập nhật trạng thái
        police_record.status = "sent_for_verification"
        police_record.approveDate = datetime.datetime.utcnow()
        police_record.save()

        # Ký số PDF (giả lập, thực tế cần ký số thật)
        # Lưu vào bảng mới, ví dụ: ApprovedIdentityCard
        # Bạn tự định nghĩa model này

        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/reject-identity-card', methods=['POST'])
def reject_identity_card():
    data = request.get_json()
    record_code = data.get("recordCode")
    officer_id = data.get("officerId")
    reason = data.get("reason", "")
    try:
        police_record = PoliceRecord.objects(recordCode=record_code).first()
        if not police_record:
            return jsonify({"error": "Không tìm thấy hồ sơ"}), 404

        police_record.status = "signed"
        police_record.approveDate = datetime.datetime.utcnow()
        police_record.rejectReason = reason
        police_record.save()

        return jsonify({"status": "ok"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/debug/list-documents', methods=['GET'])
def list_documents_debug():
    try:
        # List all PoliceRecords
        police_records = PoliceRecord.objects()
        print("=== POLICE RECORDS ===")
        for record in police_records:
            print(f"RecordCode: {record.recordCode}, UserId: {record.userId}, Status: {record.status}")
        
        # List all EncryptedDocuments
        encrypted_docs = EncryptedDocument.objects()
        print("=== ENCRYPTED DOCUMENTS ===")
        for doc in encrypted_docs:
            print(f"UserInfo: {doc.userInfo}, PDF Size: {len(doc.encryptedPdf)} bytes")
        
        return jsonify({
            "police_records": [
                {
                    "recordCode": r.recordCode,
                    "userId": r.userId,
                    "userName": r.userName,
                    "status": r.status
                } for r in police_records
            ],
            "encrypted_documents": [
                {
                    "userInfo": d.userInfo,
                    "pdfSize": len(d.encryptedPdf)
                } for d in encrypted_docs
            ]
        })
    except Exception as e:
        print(f"❌ Debug error: {e}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/debug/check-pdf/<user_id>', methods=['GET'])
def debug_check_pdf(user_id):
    """Debug endpoint to check PDF data in database"""
    try:
        print(f"🔍 Debug: Looking for document with userId: {user_id}")
        
        encrypted_doc = EncryptedDocument.objects(userInfo__identifyNumber=user_id).first()
        if not encrypted_doc:
            return jsonify({"error": "Document not found"}), 404
        
        pdf_data = encrypted_doc.encryptedPdf
        print(f"📄 PDF data size: {len(pdf_data)} bytes")
        print(f"📋 First 20 bytes: {pdf_data[:20]}")
        print(f"📋 Starts with PDF signature: {pdf_data.startswith(b'%PDF-')}")
        
        if pdf_data.startswith(b'%PDF-'):
            print(f"✅ Valid PDF signature")
            # Try to extract PDF version
            header_line = pdf_data.split(b'\n')[0]
            print(f"📋 PDF header line: {header_line.decode('latin-1', errors='ignore')}")
        else:
            print(f"❌ Invalid PDF signature")
            print(f"❌ Data type: {type(pdf_data)}")
            
        return jsonify({
            "userId": user_id,
            "pdfSize": len(pdf_data),
            "isValidPdf": pdf_data.startswith(b'%PDF-'),
            "firstBytes": pdf_data[:20].hex(),
            "userInfo": encrypted_doc.userInfo
        })
        
    except Exception as e:
        print(f"❌ Debug error: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@api.route('/api/ca/certificate-requests', methods=['GET'])
def get_certificate_requests():
    """Get all pending certificate requests for CA dashboard"""
    try:
        from .models.CertificateRequest import CertificateRequest
        csrs = CertificateRequest.objects(status="unsigned")
        result = []
        for csr in csrs:
            result.append({
                "id": str(csr.id),
                "record_code": csr.record_code,
                "created_date": csr.created_date,
                "status": csr.status,
                "officer_id": csr.officer_id,
                # Thêm các trường khác nếu cần
            })
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@api.route('/api/ca/certificate-request/<request_id>', methods=['GET'])
def get_certificate_request_detail(request_id):
    """Get CSR details for CA review"""
    try:
        cert_request = CertificateRequest.objects(id=request_id).first()
        if not cert_request:
            return jsonify({"error": "Certificate request not found"}), 404
        
        police_record = PoliceRecord.objects(recordCode=cert_request.record_code).first()
        
        # Convert CSR to base64 for frontend display
        csr_base64 = base64.b64encode(cert_request.csr_data).decode('utf-8')
        
        return jsonify({
            "id": str(cert_request.id),
            "record_code": cert_request.record_code,
            "created_date": str(cert_request.created_date),
            "officer_id": cert_request.officer_id,
            "status": cert_request.status,
            "csr_data": csr_base64,
            "user_name": police_record.userName if police_record else "Unknown",
            "user_id": police_record.userId if police_record else "Unknown",
            "submit_date": str(police_record.submitDate) if police_record else None
        })
    except Exception as e:
        print(f"Error getting certificate request detail: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/ca/sign-certificate', methods=['POST'])
def sign_certificate():
    """Sign CSR with CA private key to generate certificate"""
    data = request.get_json()
    request_id = data.get("requestId")
    ca_officer_id = data.get("caOfficerId", "ca_officer")
    
    try:
        # Find certificate request
        cert_request = CertificateRequest.objects(id=request_id).first()
        if not cert_request:
            return jsonify({"error": "Certificate request not found"}), 404
        
        if cert_request.status != "unsigned":
            return jsonify({"error": "Certificate request is not pending"}), 400
        
        # Sign CSR to generate certificate
        certificate_pem = sign_csr_with_ca(cert_request.csr_data)
        
        # Update certificate request with signed certificate
        cert_request.certificate_data = certificate_pem
        cert_request.status = "signed"
        cert_request.ca_signature_date = datetime.datetime.utcnow()
        cert_request.save()
        
        # Update police record status to "signed" (maps to "signed" on frontend)
        police_record = PoliceRecord.objects(recordCode=cert_request.record_code).first()
        if police_record:
            police_record.status = "signed"  # Đổi từ "signed"
            police_record.save()
        
        return jsonify({
            "status": "ok",
            "message": "Certificate signed successfully",
            "certificate_id": str(cert_request.id)
        })
        
    except Exception as e:
        print(f"Error signing certificate: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/ca/signed-certificates', methods=['GET'])
def get_signed_certificates():
    """Get all signed certificates for CA dashboard"""
    try:
        cert_requests = CertificateRequest.objects(status="signed")
        result = []
        for req in cert_requests:
            police_record = PoliceRecord.objects(recordCode=req.record_code).first()
            # Giả lập các trường cho frontend
            result.append({
                "certificate_id": str(req.id),
                "citizen_id": police_record.userId if police_record else "Unknown",
                "common_name": police_record.userName if police_record else "Unknown",
                "signed_at": str(req.ca_signature_date) if hasattr(req, "ca_signature_date") else "",
                "expires_at": "",  # Nếu có trường hết hạn thì trả về, không thì để rỗng
                "status": req.status,
                # Các trường khác nếu cần
            })
        return jsonify(result)
    except Exception as e:
        print(f"Error getting signed certificates: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Add this endpoint for checking and applying certificates to officer documents
@api.route('/api/check-and-apply-certificates', methods=['POST'])
def check_and_apply_certificates():
    """Check for new certificates and apply them to officer documents"""
    try:
        from .utils.pdf_utils import attach_certificate_to_pdf
        
        # Find all signed certificates that haven't been applied yet
        signed_certs = CertificateRequest.objects(status="signed")
        applied_count = 0
        
        for cert_request in signed_certs:
            # Find the corresponding police record
            police_record = PoliceRecord.objects(recordCode=cert_request.record_code).first()
            if not police_record:
                continue
                
            # Check if already processed (status should be "signed" which maps to "signed")
            if police_record.status != "signed":
                # Find the encrypted document
                encrypted_doc = EncryptedDocument.objects(recordCode=cert_request.record_code).first()
                if not encrypted_doc:
                    encrypted_doc = EncryptedDocument.objects(userInfo__identifyNumber=police_record.userId).first()
                
                if encrypted_doc:
                    # Get PDF data
                    pdf_data = encrypted_doc.encryptedPdf or encrypted_doc.encryptedContent or b'dummy_pdf_data'
                    
                    # Attach certificate to PDF
                    signed_pdf = attach_certificate_to_pdf(pdf_data, cert_request.certificate_data, cert_request.record_code)
                    
                    # Update the encrypted document with signed PDF
                    encrypted_doc.encryptedPdf = signed_pdf
                    encrypted_doc.encryptedContent = signed_pdf
                    encrypted_doc.save()
                    
                    # Update police record status to "signed" (maps to "signed" on frontend)
                    police_record.status = "unsigned"
                    police_record.save()
                    
                    applied_count += 1
        
        return jsonify({
            "status": "ok",
            "message": f"Applied {applied_count} certificates to documents"
        })
        
    except Exception as e:
        print(f"Error in check_and_apply_certificates: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/officer/check-certificate-updates', methods=['GET'])
def check_certificate_updates():
    """Check for certificate updates for officer dashboard"""
    try:
        # Find documents that have received certificates
        updated_records = []
        
        # Get all police records in "sent_for_verification" status (sent_for_verification)
        pending_records = PoliceRecord.objects(status="sent_for_verification")
        
        for record in pending_records:
            # Check if there's a signed certificate for this record
            cert_request = CertificateRequest.objects(record_code=record.recordCode, status="signed").first()
            if cert_request:
                updated_records.append({
                    "recordCode": record.recordCode,
                    "userName": record.userName,
                    "userId": record.userId,
                    "certificateReady": True
                })
        
        return jsonify(updated_records)
        
    except Exception as e:
        print(f"Error checking certificate updates: {str(e)}")
        return jsonify({"error": str(e)}), 500

@api.route('/api/generate-csr', methods=['POST'])
def generate_csr():
    data = request.get_json()
    pdf_bytes = bytes(data["pdfData"])
    record_code = data["recordCode"]
    officer_id = data["officerId"]
    from .utils.crypto_utils import generate_csr_from_pdf
    csr_pem = generate_csr_from_pdf(pdf_bytes, record_code, officer_id)
    from .models.CertificateRequest import CertificateRequest
    cert_req = CertificateRequest(
        record_code=record_code,
        csr_data=csr_pem,
        officer_id=officer_id,
        status="unsigned"
    )
    cert_req.save()

    # Cập nhật trạng thái hồ sơ
    from .models.PoliceRecord import PoliceRecord
    police_record = PoliceRecord.objects(recordCode=record_code).first()
    if police_record:
        police_record.status = "sent_for_verification"
        police_record.save()

    return jsonify({"status": "ok"})

@api.route('/api/get-pdf/<record_code>', methods=['GET'])
def get_pdf_by_record_code(record_code):
    from .models.EncryptedDocument import EncryptedDocument
    from .models.IdentityCardRequest import IdentityCardRequest
    from .models.PassportRequest import PassportRequest

    # Ưu tiên lấy từ EncryptedDocument
    doc = EncryptedDocument.objects(recordCode=record_code).first()
    if not doc:
        doc = EncryptedDocument.objects(userInfo__recordCode=record_code).first()

    if doc and doc.encryptedPdf:
        response = make_response(doc.encryptedPdf)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', 'inline', filename=f"{record_code}.pdf")
        return response

    # Nếu không có, thử lấy từ IdentityCardRequest
    id_card = IdentityCardRequest.objects(userInfo__recordCode=record_code).first()
    if id_card and id_card.pdfBytes:
        response = make_response(id_card.pdfBytes)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', 'inline', filename=f"{record_code}.pdf")
        return response

    # Nếu không có, thử lấy từ PassportRequest
    passport = PassportRequest.objects(userInfo__recordCode=record_code).first()
    if passport and passport.pdfBytes:
        response = make_response(passport.pdfBytes)
        response.headers.set('Content-Type', 'application/pdf')
        response.headers.set('Content-Disposition', 'inline', filename=f"{record_code}.pdf")
        return response

    return jsonify({"error": "Không tìm thấy PDF"}), 404

@api.route('/api/debug/list-record-codes', methods=['GET'])
def debug_list_record_codes():
    from .models.EncryptedDocument import EncryptedDocument
    from .models.IdentityCardRequest import IdentityCardRequest
    from .models.PassportRequest import PassportRequest

    encrypted = [doc.recordCode for doc in EncryptedDocument.objects()]
    idcards = [doc.userInfo.get("recordCode") for doc in IdentityCardRequest.objects()]
    passports = [doc.userInfo.get("recordCode") for doc in PassportRequest.objects()]

    return jsonify({
        "encrypted": encrypted,
        "idcards": idcards,
        "passports": passports
    })