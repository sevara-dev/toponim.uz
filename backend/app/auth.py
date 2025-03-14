from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from . import crud, schemas

# JWT sozlamalari
SECRET_KEY = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"  # Xavfsiz kalit
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Admin foydalanuvchisi ma'lumotlari
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"  # Admin paroli
ADMIN_EMAIL = "admin@toponim.uz"

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(db: Session, username: str, password: str):
    # Admin foydalanuvchisini tekshirish
    if username == ADMIN_USERNAME and password == ADMIN_PASSWORD:
        return {
            "username": ADMIN_USERNAME,
            "email": ADMIN_EMAIL,
            "is_active": True,
            "is_admin": True
        }
    
    # Oddiy foydalanuvchilarni tekshirish
    user = crud.get_user_by_username(db, username)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str, db: Session):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Noto'g'ri autentifikatsiya",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = schemas.TokenData(username=username)
    except JWTError:
        raise credentials_exception
    
    # Admin foydalanuvchisini tekshirish
    if username == ADMIN_USERNAME:
        return {
            "username": ADMIN_USERNAME,
            "email": ADMIN_EMAIL,
            "is_active": True,
            "is_admin": True
        }
    
    user = crud.get_user_by_username(db, username=token_data.username)
    if user is None:
        raise credentials_exception
    return user