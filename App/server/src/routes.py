from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt
import jwt
import datetime
from .utils.jwt import token_required

ACCESS_KEY = "your_secret_key_here"  # Thay bằng key bí mật thực tế của bạn

main = Blueprint("main", __name__)
bcrypt = Bcrypt()

# Giả lập user trong DB (username + hashed password + id)
users = {
    "User": {
        "id": 1,
        "password": bcrypt.generate_password_hash("123456").decode("utf-8"),
        "name": "User",
        "admin": False
    }
}

@main.route("/api/user-data")
@token_required
def user_data():
    return jsonify({"message": "Token hợp lệ", "user": request.user})

@main.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"success": False, "message": "Thiếu username hoặc mật khẩu"}), 400

    user = users.get(username)
    if not user or not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"success": False, "message": "Tên đăng nhập hoặc mật khẩu không đúng"}), 401

    # Tạo JWT token
    payload = {
        "id": user["id"],
        "username": username,
        "admin": user.get("admin", False),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, ACCESS_KEY, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Đăng nhập thành công",
        "token": token,
        "userData": {
            "username": username,
            "name": user["name"]
        }
    }), 200

@main.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask API!"})
