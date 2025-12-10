import pytest
from security import verify_password, get_password_hash, create_access_token, decode_access_token
from datetime import timedelta

def test_password_hashing():
    password = "secret"
    hashed = get_password_hash(password)
    assert verify_password(password, hashed)
    assert not verify_password("wrong", hashed)

def test_jwt_token_creation_and_decoding():
    data = {"sub": "testuser", "role": "customer"}
    token = create_access_token(data=data)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "testuser"
    assert decoded["role"] == "customer"

def test_jwt_expiry():
    data = {"sub": "testuser", "role": "customer"}
    # Create a token that expires immediately (negative delta)
    token = create_access_token(data=data, expires_delta=timedelta(seconds=-1))
    decoded = decode_access_token(token)
    # Depending on implementation, decode might raise error or return None or return expired token
    # Our implementation uses python-jose which raises ExpiredSignatureError, caught and returns None
    assert decoded is None
