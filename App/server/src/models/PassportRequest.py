from mongoengine import Document, StringField, ListField, DictField, BinaryField

class PassportRequest(Document):
    userInfo = DictField(required=True)
    signature = ListField()
    publicKey = ListField()
    sigAlg = StringField()
    pdfBytes = BinaryField()
