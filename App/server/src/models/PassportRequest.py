from mongoengine import Document, StringField, BinaryField, DictField

class PassportRequest(Document):
    userInfo = DictField()
    signature = StringField() 
    publicKey = StringField() 
    sigAlg = StringField()
    pdfBytes = BinaryField()
