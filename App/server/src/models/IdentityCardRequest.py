from mongoengine import Document, StringField, BinaryField, DictField

class IdentityCardRequest(Document):
    userInfo = DictField()
    signature = StringField()
    publicKey = StringField()
    sigAlg = StringField()
    pdfBytes = BinaryField()