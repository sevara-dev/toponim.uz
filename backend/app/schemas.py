from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str | None = None

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool

    class Config:
        from_attributes = True

class RegionBase(BaseModel):
    name: str
    description: Optional[str] = None

class RegionCreate(RegionBase):
    pass

class Region(RegionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DistrictBase(BaseModel):
    name: str
    region_id: int
    description: Optional[str] = None

class DistrictCreate(DistrictBase):
    pass

class District(DistrictBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ToponimBase(BaseModel):
    name: str
    type: str
    district_id: int
    latitude: float
    longitude: float
    established: Optional[str] = None
    previous_name: Optional[str] = None
    meaning: Optional[str] = None

class ToponimCreate(ToponimBase):
    pass

class Toponim(ToponimBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MessageBase(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str

class MessageCreate(MessageBase):
    pass

class Message(MessageBase):
    id: int
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True 