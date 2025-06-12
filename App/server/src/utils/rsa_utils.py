from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding
import os

def load_public_key_pem():
    # Lấy đường dẫn tuyệt đối tới file public key
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pem_path = os.path.join(base_dir, "..", "server_public.pem")
    pem_path = os.path.normpath(pem_path)
    with open(pem_path, "r") as f:
        return f.read()

def load_private_key():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pem_path = os.path.join(base_dir, "..", "server_private.pem")
    pem_path = os.path.normpath(pem_path)
    with open(pem_path, "rb") as f:
        return serialization.load_pem_private_key(f.read(), password=None)

def decrypt_rsa_oaep(private_key, ciphertext):
    return private_key.decrypt(
        ciphertext,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )

import os

def save_aes_key(user_id, aes_key_bytes):
    folder = "local_aes_keys"
    os.makedirs(folder, exist_ok=True)  # Tạo thư mục nếu chưa có
    file_path = os.path.join(folder, f"{user_id}.key")
    with open(file_path, "wb") as f:
        f.write(aes_key_bytes)