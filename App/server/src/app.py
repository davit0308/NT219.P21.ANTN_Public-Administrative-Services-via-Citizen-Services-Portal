from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from mongoengine import connect
from dotenv import load_dotenv
import os
from src.routes import main

load_dotenv()

app = Flask(__name__)

bcrypt = Bcrypt(app)

# Kết nối MongoDB Atlas
connect(host=os.getenv("MONGO_URI"))

# Đăng ký blueprint
app.register_blueprint(main)
CORS(main, supports_credentials=True, origins=["http://localhost:5173"])
if __name__ == "__main__":
    app.run(debug=True, port=9090,use_reloader=False)
    
