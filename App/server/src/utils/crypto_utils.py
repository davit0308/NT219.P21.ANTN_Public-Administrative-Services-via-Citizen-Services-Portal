import os
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta
import base64

def generate_csr_from_pdf(pdf_data, record_code, officer_id):
    """
    Generate a Certificate Signing Request (CSR) for a PDF document
    """
    try:
        # Generate a private key
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
        )
        
        # Create subject for the certificate
        subject = x509.Name([
            x509.NameAttribute(NameOID.COUNTRY_NAME, "VN"),
            x509.NameAttribute(NameOID.STATE_OR_PROVINCE_NAME, "Ho Chi Minh City"),
            x509.NameAttribute(NameOID.LOCALITY_NAME, "Ho Chi Minh City"),
            x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Public Administrative Services"),
            x509.NameAttribute(NameOID.ORGANIZATIONAL_UNIT_NAME, "Document Verification"),
            x509.NameAttribute(NameOID.COMMON_NAME, f"Document-{record_code}"),
        ])
        
        # Create CSR
        csr = x509.CertificateSigningRequestBuilder().subject_name(
            subject
        ).add_extension(
            x509.SubjectAlternativeName([
                x509.RFC822Name(f"officer.{officer_id}@gov.vn"),
            ]),
            critical=False,
        ).sign(private_key, hashes.SHA256())
        
        # Serialize CSR to PEM format
        csr_pem = csr.public_bytes(serialization.Encoding.PEM)
        
        # Save private key for later use
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )
        
        # Store private key in a secure location (in production, use proper key management)
        os.makedirs(f"./private_keys", exist_ok=True)
        with open(f"./private_keys/{record_code}.pem", "wb") as f:
            f.write(private_key_pem)
        
        return csr_pem
        
    except Exception as e:
        raise Exception(f"Failed to generate CSR: {str(e)}")

def sign_csr_with_ca(csr_pem, ca_private_key_path="./ca_private_key.pem", ca_cert_path="./ca_certificate.pem"):
    """
    Sign a CSR with CA private key to generate certificate
    """
    try:
        # Load CSR
        csr = x509.load_pem_x509_csr(csr_pem)
        
        # Load CA private key
        if not os.path.exists(ca_private_key_path):
            # Generate CA key and self-signed certificate if not exists
            ca_private_key, ca_cert = generate_ca_certificate()
            # Save CA private key
            with open(ca_private_key_path, "wb") as f:
                f.write(ca_private_key.private_bytes(
                    encoding=serialization.Encoding.PEM,
                    format=serialization.PrivateFormat.PKCS8,
                    encryption_algorithm=serialization.NoEncryption()
                ))
            # Save CA certificate
            with open(ca_cert_path, "wb") as f:
                f.write(ca_cert.public_bytes(serialization.Encoding.PEM))
        else:
            with open(ca_private_key_path, "rb") as f:
                ca_private_key = serialization.load_pem_private_key(f.read(), password=None)
        
        # Create certificate from CSR
        certificate = x509.CertificateBuilder().subject_name(
            csr.subject
        ).issuer_name(
            x509.Name([
                x509.NameAttribute(NameOID.COUNTRY_NAME, "VN"),
                x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Government CA"),
                x509.NameAttribute(NameOID.COMMON_NAME, "Government Root CA"),
            ])
        ).public_key(
            csr.public_key()
        ).serial_number(
            x509.random_serial_number()
        ).not_valid_before(
            datetime.utcnow()
        ).not_valid_after(
            datetime.utcnow() + timedelta(days=365)
        ).add_extension(
            x509.SubjectAlternativeName(csr.extensions[0].value),
            critical=False,
        ).sign(ca_private_key, hashes.SHA256())
        
        # Serialize certificate to PEM format
        cert_pem = certificate.public_bytes(serialization.Encoding.PEM)
        
        return cert_pem
        
    except Exception as e:
        raise Exception(f"Failed to sign CSR: {str(e)}")

def generate_ca_certificate():
    """
    Generate CA private key and self-signed certificate
    """
    # Generate CA private key
    ca_private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=4096,
    )
    
    # Create CA certificate
    ca_subject = x509.Name([
        x509.NameAttribute(NameOID.COUNTRY_NAME, "VN"),
        x509.NameAttribute(NameOID.ORGANIZATION_NAME, "Government CA"),
        x509.NameAttribute(NameOID.COMMON_NAME, "Government Root CA"),
    ])
    
    ca_cert = x509.CertificateBuilder().subject_name(
        ca_subject
    ).issuer_name(
        ca_subject  # Self-signed
    ).public_key(
        ca_private_key.public_key()
    ).serial_number(
        x509.random_serial_number()
    ).not_valid_before(
        datetime.utcnow()
    ).not_valid_after(
        datetime.utcnow() + timedelta(days=3650)  # 10 years
    ).add_extension(
        x509.BasicConstraints(ca=True, path_length=None),
        critical=True,
    ).sign(ca_private_key, hashes.SHA256())
    
    return ca_private_key, ca_cert
