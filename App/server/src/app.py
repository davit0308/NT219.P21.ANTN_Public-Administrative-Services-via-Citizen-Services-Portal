from flask import Flask
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from routes import main  # Import route từ file trên

app = Flask(__name__)
CORS(app)
bcrypt = Bcrypt(app)

app.register_blueprint(main)

if __name__ == "__main__":
    app.run(debug=True, port=9090)
