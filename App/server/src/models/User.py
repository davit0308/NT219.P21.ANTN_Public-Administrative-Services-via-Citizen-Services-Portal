# src/models/User.py

from mongoengine import Document, StringField, BooleanField, IntField

class User(Document):
    meta = {'collection': 'Account'}  # Tên collection trong MongoDB
    username = StringField(required=True, unique=True)
    name = StringField(required=True)
    password = StringField(required=True)
    admin = BooleanField(default=False)

    @staticmethod
    def get(username):
        return User.objects(username=username).first()
