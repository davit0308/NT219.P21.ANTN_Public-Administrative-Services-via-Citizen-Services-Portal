# config.py

import os

from dotenv import load_dotenv
# pip install python-dotenv

# Load các biến môi trường từ file .env vào môi trường chạy
load_dotenv()

# Lấy SECRET_KEY từ biến môi trường, nếu không có thì dùng giá trị mặc định
SECRET_KEY = os.getenv("SECRET_KEY", "fallback_secret_key")