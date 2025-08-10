import bcrypt
from flask import jsonify

def hash_password(password):
    encoded_password = password.encode('utf-8')
    hash_password = bcrypt.hashpw(encoded_password, bcrypt.gensalt())
    return hash_password

def check_password(password, hash_password):
    if bcrypt.checkpw(password.encode('utf-8'), hash_password):
        return True
    else:
        return False
    
def check_list(data):
    if any(value is None or value == "" for value in data ):
        return False
    else : 
        return True