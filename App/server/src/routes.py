from flask import Blueprint, request, jsonify
from flask_bcrypt import Bcrypt

main = Blueprint("main", __name__)
bcrypt = Bcrypt()

# Giả lập user trong DB (username + hashed password)
users = {
    "User": {
        "password": bcrypt.generate_password_hash("123456").decode("utf-8"),
        "name": "User"
    }
}

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

    return jsonify({
        "success": True,
        "message": "Đăng nhập thành công",
        "userData": {
            "username": username,
            "name": user["name"]
        }
    }), 200

@main.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask API!"})
