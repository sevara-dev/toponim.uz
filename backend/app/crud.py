from sqlalchemy.orm import Session
import models
import schemas
import auth
from datetime import datetime

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_region(db: Session, region_id: int):
    return db.query(models.Region).filter(models.Region.id == region_id).first()

def get_regions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Region).offset(skip).limit(limit).all()

def create_region(db: Session, region: schemas.RegionCreate):
    db_region = models.Region(
        name=region.name,
        description=region.description
    )
    db.add(db_region)
    db.commit()
    db.refresh(db_region)
    return db_region

def update_region(db: Session, region_id: int, region: schemas.RegionCreate):
    db_region = get_region(db, region_id)
    if db_region:
        db_region.name = region.name
        db_region.description = region.description
        db_region.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_region)
    return db_region

def delete_region(db: Session, region_id: int):
    db_region = get_region(db, region_id)
    if db_region:
        db.delete(db_region)
        db.commit()
        return True
    return False

def get_district(db: Session, district_id: int):
    return db.query(models.District).filter(models.District.id == district_id).first()

def get_districts(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.District).offset(skip).limit(limit).all()

def get_districts_by_region(db: Session, region_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.District).filter(models.District.region_id == region_id).offset(skip).limit(limit).all()

def create_district(db: Session, district: schemas.DistrictCreate):
    db_district = models.District(
        name=district.name,
        region_id=district.region_id,
        description=district.description
    )
    db.add(db_district)
    db.commit()
    db.refresh(db_district)
    return db_district

def update_district(db: Session, district_id: int, district: schemas.DistrictCreate):
    db_district = get_district(db, district_id)
    if db_district:
        db_district.name = district.name
        db_district.region_id = district.region_id
        db_district.description = district.description
        db_district.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_district)
    return db_district

def delete_district(db: Session, district_id: int):
    db_district = get_district(db, district_id)
    if db_district:
        db.delete(db_district)
        db.commit()
        return True
    return False

def get_toponim(db: Session, toponim_id: int):
    return db.query(models.Toponim).filter(models.Toponim.id == toponim_id).first()

def get_toponims(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Toponim).offset(skip).limit(limit).all()

def get_toponims_by_district(db: Session, district_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Toponim).filter(models.Toponim.district_id == district_id).offset(skip).limit(limit).all()

def get_district_toponims(db: Session, district_id: int):
    return db.query(models.Toponim).filter(models.Toponim.district_id == district_id).all()

def create_toponim(db: Session, toponim: schemas.ToponimCreate):
    db_toponim = models.Toponim(
        name=toponim.name,
        type=toponim.type,
        district_id=toponim.district_id,
        latitude=toponim.latitude,
        longitude=toponim.longitude,
        established=toponim.established,
        previous_name=toponim.previous_name,
        meaning=toponim.meaning
    )
    db.add(db_toponim)
    db.commit()
    db.refresh(db_toponim)
    return db_toponim

def update_toponim(db: Session, toponim_id: int, toponim: schemas.ToponimCreate):
    db_toponim = get_toponim(db, toponim_id)
    
    if not db_toponim:
        return None
    
    db_toponim.name = toponim.name
    db_toponim.type = toponim.type
    db_toponim.latitude = toponim.latitude
    db_toponim.longitude = toponim.longitude
    db_toponim.established = toponim.established
    db_toponim.previous_name = toponim.previous_name
    db_toponim.meaning = toponim.meaning
    
    db.commit()
    db.refresh(db_toponim)
    return db_toponim

def delete_toponim(db: Session, toponim_id: int):
    db_toponim = get_toponim(db, toponim_id)
    if not db_toponim:
        return False
    
    db.delete(db_toponim)
    db.commit()
    return True

def get_messages(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Message).offset(skip).limit(limit).all()

def create_message(db: Session, message: schemas.MessageCreate):
    db_message = models.Message(
        name=message.name,
        email=message.email,
        subject=message.subject,
        message=message.message
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def mark_message_as_read(db: Session, message_id: int):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if message:
        message.is_read = True
        db.commit()
        db.refresh(message)
    return message

def delete_message(db: Session, message_id: int):
    message = db.query(models.Message).filter(models.Message.id == message_id).first()
    if message:
        db.delete(message)
        db.commit()
        return True
    return False 