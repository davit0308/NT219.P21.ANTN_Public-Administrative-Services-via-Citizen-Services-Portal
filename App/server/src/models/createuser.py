from pymongo import MongoClient
from werkzeug.security import generate_password_hash
import os
from dotenv import load_dotenv
from flask_bcrypt import Bcrypt

# Load .env
load_dotenv()
bcrypt = Bcrypt()
MONGO_URI = os.getenv("MONGO_URI")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME")

# Kết nối đến MongoDB
client = MongoClient(MONGO_URI)

# Tạo database và collection nếu chưa có
db = client[MONGO_DB_NAME]           # Tên database
users = db["Account"]                    # Tên collection, ví dụ "users"

# Kiểm tra xem admin đã tồn tại chưa
if not users.find_one({"name": "CongAn"}):
    users.insert_one({
        "username": "CongAn",
        "password":  bcrypt.generate_password_hash("123456").decode("utf-8"),
        "admin": True
    })
    print("admin created successfully.")
    
if not users.find_one({"name": "User"}):

    users.insert_one({
        "username": "User",
        "password":  bcrypt.generate_password_hash("123456").decode("utf-8"),
        "admin": False
    })
    print("user created successfully.")
else:
    print("user/congan already exists.")


# from pymongo.mongo_client import MongoClient
# from pymongo.server_api import ServerApi

# uri = "mongodb+srv://PublicService:<PS123456789>@cluster0.3tbeh83.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

# # Create a new client and connect to the server
# client = MongoClient(uri, server_api=ServerApi('1'))

# # Send a ping to confirm a successful connection
# try:
#     client.admin.command('ping')
#     print("Pinged your deployment. You successfully connected to MongoDB!")
# except Exception as e:
#     print(e)