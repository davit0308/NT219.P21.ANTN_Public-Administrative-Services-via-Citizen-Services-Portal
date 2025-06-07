from flask import Blueprint, request, jsonify,  make_response
from flask_bcrypt import Bcrypt
import jwt
import datetime
from .utils.jwt import token_required
from flask import Blueprint

from mongoengine import connect

from flask_cors import cross_origin
import os
from dotenv import load_dotenv
from .models.User import User

load_dotenv()
ACCESS_KEY = os.getenv("ACCESS_KEY")

main = Blueprint("main", __name__)
bcrypt = Bcrypt()
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

    # Tạo JWT token
    payload = {
        "id": str(user["id"]),
        "username": user["username"],
        "admin": user["admin"],
        "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }
    token = jwt.encode(payload, ACCESS_KEY, algorithm="HS256")

    return jsonify({
        "success": True,
        "message": "Đăng nhập thành công",
        "token": token,
        "userData": {
            "username": username,
            "name": user["name"],
            "admin": user["admin"],
            
        }
    }), 200

@main.route("/api/logout", methods=["POST"])
@cross_origin(origin="http://localhost:3000", supports_credentials=True)
def logout():
    response = make_response(jsonify({"message": "Đăng xuất thành công"}), 200)
    response.set_cookie("refresh_token", "", max_age=0, httponly=True, samesite="Strict")
    return response



@main.route("/api/hello")
def hello():
    return jsonify({"message": "Hello from Flask API!"})
