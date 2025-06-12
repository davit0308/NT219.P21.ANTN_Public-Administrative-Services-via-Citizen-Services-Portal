from flask import Blueprint, request, jsonify,  make_response
from flask_bcrypt import Bcrypt
import jwt
import datetime
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
@cross_origin(origin="http://localhost:3000", supports_credentials=True)
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

        # Lưu encrypted PDF vào MongoDB
        doc = EncryptedDocument(
            userInfo=user_info,
            encryptedPdf=encrypted_pdf,
            iv=iv,
            encryptedAESKey=encrypted_aes_key
        )
        doc.save()

        # Lưu hồ sơ cho công an
        police_record = PoliceRecord(
            userId=user_info.get("identifyNumber"),
            userName=user_info.get("fullName"),
            recordCode="HS" + str(doc.id)[-8:],  # Ví dụ sinh mã hồ sơ
            submitDate=datetime.datetime.utcnow(),
            status="Chờ duyệt",
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


@api.route('/api/identity-card-requests', methods=['GET'])
def get_identity_card_requests():
    try:
        requests = PoliceRecord.objects()
        result = []
        for req in requests:
            result.append({
                "userId": str(getattr(req, "userId", "")),
                "userName": getattr(req, "userName", ""),
                "recordCode": str(getattr(req, "recordCode", req.id)),
                "submitDate": str(getattr(req, "submitDate", "")),
                "status": getattr(req, "status", "pending"),
                "approveDate": str(getattr(req, "approveDate", "")) if getattr(req, "approveDate", None) else ""
            })
        return jsonify(result)
    except Exception as e:
        print("Lỗi lấy danh sách CCCD:", e)
        return jsonify([]), 500