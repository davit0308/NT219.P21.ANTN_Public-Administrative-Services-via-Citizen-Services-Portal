# models/EncryptedDocument.py
from mongoengine import Document, BinaryField, DictField, StringField

class EncryptedDocument(Document):
    userInfo = DictField()
    encryptedPdf = BinaryField()
    iv = BinaryField()
    encryptedAESKey = BinaryField()
    recordCode = StringField()
    signedPdf = BinaryField()  