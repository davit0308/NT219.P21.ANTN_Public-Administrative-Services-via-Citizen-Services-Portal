import base64
from io import BytesIO
import os

def attach_certificate_to_pdf(pdf_data, certificate_pem, record_code):
    """
    Attach certificate to PDF using iText (placeholder for now)
    In a real implementation, you would use iText Python wrapper or similar library
    """
    try:
        # For now, we'll just combine the PDF data with the certificate
        # In a real implementation, you would use a proper PDF library like PyPDF2 or iText
        
        # Create a simple "signed" PDF by appending certificate info
        signed_pdf_data = pdf_data
        
        # Add certificate as metadata (simplified approach)
        cert_info = f"\n%% Digital Certificate for {record_code}\n{certificate_pem.decode('utf-8')}\n%%EOF\n"
        cert_bytes = cert_info.encode('utf-8')
        
        # Combine PDF data with certificate
        signed_pdf_data = pdf_data + cert_bytes
        
        return signed_pdf_data
        
    except Exception as e:
        raise Exception(f"Failed to attach certificate to PDF: {str(e)}")

def extract_certificate_from_pdf(pdf_data):
    """
    Extract certificate from a signed PDF
    """
    try:
        # Look for certificate markers in the PDF
        pdf_string = pdf_data.decode('utf-8', errors='ignore')
        
        cert_start = pdf_string.find('-----BEGIN CERTIFICATE-----')
        cert_end = pdf_string.find('-----END CERTIFICATE-----')
        
        if cert_start != -1 and cert_end != -1:
            cert_pem = pdf_string[cert_start:cert_end + len('-----END CERTIFICATE-----')]
            return cert_pem.encode('utf-8')
        
        return None
        
    except Exception as e:
        return None
