import jwt
from flask import request, jsonify, g
from functools import wraps
from models import User  # Giả sử bạn có model User với phương thức find_by_id
import os

ACCESS_KEY = os.environ.get("ACCESS_KEY", "your_default_secret_key")

def verify_token(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if auth_header:
            try:
                token = auth_header.split(" ")[1]
                decoded = jwt.decode(token, ACCESS_KEY, algorithms=["HS256"])
                user_id = decoded.get("id")
                user = User.find_by_id(user_id)

                if not user:
                    return jsonify({"message": "User not found"}), 404

                g.user = user  # Lưu user vào global context
                return f(*args, **kwargs)

            except jwt.ExpiredSignatureError:
                return jsonify({"message": "Token has expired"}), 403
            except jwt.InvalidTokenError:
                return jsonify({"message": "Token is not valid"}), 403
            except Exception as e:
                return jsonify({"message": "Internal server error"}), 500
        else:
            return jsonify({"message": "You are not authenticated"}), 401

    return decorated

