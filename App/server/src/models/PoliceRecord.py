from mongoengine import Document, StringField, DateTimeField

class PoliceRecord(Document):
    userId = StringField()
    userName = StringField()
    recordCode = StringField()
    submitDate = DateTimeField()
    status = StringField()
    approveDate = DateTimeField(null=True)