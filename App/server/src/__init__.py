from flask import Flask
from flask_cors import CORS
import os
from src.routes import main, api

def create_app():
    app = Flask(__name__)
    CORS(app)

    app.config['SECRET_KEY'] = os.environ.get("SECRET_KEY", "fallback_secret_key")

    from src.routes import main
    app.register_blueprint(main)
    app.register_blueprint(api)

    return app
