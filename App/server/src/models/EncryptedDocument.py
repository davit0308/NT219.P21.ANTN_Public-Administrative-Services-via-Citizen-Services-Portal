# models/EncryptedDocument.py
from mongoengine import Document, DictField, BinaryField, StringField

class EncryptedDocument(Document):
    userInfo = DictField()
    encryptedPdf = BinaryField()
    encryptedContent = BinaryField()  # Alias for backward compatibility
    recordCode = StringField()  # Add recordCode field
    iv = BinaryField()
    encryptedAESKey = BinaryField()