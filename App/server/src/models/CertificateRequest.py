import mongoengine as db
from datetime import datetime

class CertificateRequest(db.Document):
    """Model for Certificate Signing Requests (CSR)"""
    record_code = db.StringField(required=True, unique=True)
    csr_data = db.BinaryField(required=True)  # CSR content
    created_date = db.DateTimeField(default=datetime.utcnow)
    status = db.StringField(default="unsigned", choices=["unsigned", "sent_for_verification", "signed"])
    officer_id = db.StringField(required=True)
    ca_signature_date = db.DateTimeField()
    certificate_data = db.BinaryField()  # CRT content after signing
    
    meta = {
        'collection': 'certificate_requests'
    }
