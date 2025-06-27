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

def verify_falcon_signature(pdf_data, signature_data, public_key):
    """
    Xác minh chữ ký FALCON cho tài liệu PDF
    """
    import hashlib
    
    # Tính hash của PDF
    pdf_hash = hashlib.sha256(pdf_data).hexdigest()
    
    # Trong thực tế sẽ dùng thư viện FALCON để verify
    # Ở đây giả lập quá trình verify
    try:
        # Giả lập việc verify signature với FALCON
        # signature_data chứa thông tin từ CA
        expected_hash = signature_data.get('document_hash')
        algorithm = signature_data.get('algorithm')
        
        if algorithm == 'FALCON-512' and pdf_hash == expected_hash:
            return True
        return False
    except Exception as e:
        print(f"Error verifying signature: {e}")
        return False

def get_signed_documents_from_ca():
    """
    Lấy danh sách tài liệu đã được CA ký số
    """
    import requests
    try:
        response = requests.get("http://localhost:9092/api/signed-documents")
        if response.status_code == 200:
            return response.json()
        return []
    except requests.exceptions.ConnectionError:
        print("CA server không khả dụng")
        return []