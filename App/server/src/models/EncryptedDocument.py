# models/EncryptedDocument.py
from mongoengine import Document, DictField, BinaryField

class EncryptedDocument(Document):
    userInfo = DictField()
    encryptedPdf = BinaryField()
    iv = BinaryField()
    encryptedAESKey = BinaryField()