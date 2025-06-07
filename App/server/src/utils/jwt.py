from functools import wraps
from flask import request, jsonify
import jwt
# pip install PyJWT

from .config import SECRET_KEY  

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if 'Authorization' in request.headers:
            bearer = request.headers['Authorization']
            if bearer.startswith("Bearer "):
                token = bearer[7:]

        if not token:
            return jsonify({"message": "Token không được cung cấp"}), 401

        try:
            data = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            request.user = data
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token đã hết hạn"}), 403
        except jwt.InvalidTokenError:
            return jsonify({"message": "Token không hợp lệ"}), 403

        return f(*args, **kwargs)
    return decorated
