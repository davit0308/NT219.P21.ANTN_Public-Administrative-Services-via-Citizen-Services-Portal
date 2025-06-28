from pyhanko.sign import signers
from pyhanko.pdf_utils.reader import PdfFileReader
import tempfile
import io

def sign_pdf_with_cert(pdf_bytes, cert_pem, key_pem):
    # Ghi PDF ra file tạm
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as pdf_file, \
         tempfile.NamedTemporaryFile(delete=False, suffix=".pem") as key_file, \
         tempfile.NamedTemporaryFile(delete=False, suffix=".pem") as cert_file:

        pdf_file.write(pdf_bytes)
        pdf_file.flush()
        key_file.write(key_pem)
        key_file.flush()
        cert_file.write(cert_pem)
        cert_file.flush()

        signer = signers.SimpleSigner.load(
            key_file=key_file.name,
            cert_file=cert_file.name,
            key_passphrase=None
        )

        meta = signers.PdfSignatureMetadata(field_name="Signature1")
        output = io.BytesIO()
        # Mở lại file PDF tạm, tạo PdfFileReader rồi truyền vào sign_pdf
        with open(pdf_file.name, "rb") as pdf_in:
            pdf_reader = PdfFileReader(pdf_in)
            signers.sign_pdf(
                pdf_reader,
                signature_meta=meta,
                signer=signer,
                output=output
            )
        return output.getvalue()
