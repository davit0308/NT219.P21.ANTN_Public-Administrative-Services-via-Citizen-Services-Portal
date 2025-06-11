from flask import Blueprint, request, jsonify,  make_response
from flask_bcrypt import Bcrypt
import jwt
import datetime
from .utils.jwt import token_required
from flask import Blueprint, jsonify, session
from cryptography.hazmat.primitives.asymmetric import dh
from cryptography.hazmat.primitives.asymmetric import ec
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.kdf.hkdf import HKDF
import base64
import json
from .models.PassportRequest import PassportRequest

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

@api.route('/api/upload-signed-pdf', methods=['POST'])
def upload_signed_pdf():
    data = request.get_json()
    try:
        request_doc = PassportRequest(
            userInfo = data["userInfo"],
            signature = data["signature"],
            publicKey = data["publicKey"],
            sigAlg = data["sigAlg"],
            pdfBytes = bytes(data["pdfBytes"])  # chuyển mảng byte về bytes
        )
        request_doc.save()
        return jsonify({"status": "ok"})
    except Exception as e:
        print("Lỗi lưu DB:", e)
        return jsonify({"status": "error", "message": str(e)}), 500

