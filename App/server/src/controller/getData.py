from mongoengine import connect

from ..models.user_models import User 
import os
from dotenv import load_dotenv
load_dotenv()

connect(
    db=os.getenv("MONGO_DB_NAME"),
    host=os.getenv("MONGO_URI")
)

def get_all_users():
    """
    Lấy tất cả user từ collection Account.
    """
    users = User.objects()
    return [user.to_mongo().to_dict() for user in users]

# if __name__ == "__main__":
#     all_users = get_all_users()
#     for user in all_users:
#         print(user)