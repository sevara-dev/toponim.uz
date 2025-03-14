from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List

import crud
import models
import schemas
import auth
from database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Toponim.uz API")

# CORS sozlamalari
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Ma'lumotlar bazasi sessiyasini olish
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Autentifikatsiya endpointi
@app.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Noto'g'ri login yoki parol",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth.create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# Viloyatlar uchun endpointlar
@app.post("/regions/", response_model=schemas.Region)
def create_region(
    region: schemas.RegionCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    return crud.create_region(db=db, region=region)

@app.get("/regions/", response_model=List[schemas.Region])
def read_regions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    regions = crud.get_regions(db, skip=skip, limit=limit)
    return regions

@app.get("/regions/{region_id}", response_model=schemas.Region)
def read_region(region_id: int, db: Session = Depends(get_db)):
    region = crud.get_region(db, region_id=region_id)
    if region is None:
        raise HTTPException(status_code=404, detail="Viloyat topilmadi")
    return region

@app.put("/regions/{region_id}", response_model=schemas.Region)
def update_region(
    region_id: int,
    region: schemas.RegionCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    updated_region = crud.update_region(db=db, region_id=region_id, region=region)
    if updated_region is None:
        raise HTTPException(status_code=404, detail="Viloyat topilmadi")
    return updated_region

@app.delete("/regions/{region_id}")
def delete_region(
    region_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    success = crud.delete_region(db=db, region_id=region_id)
    if not success:
        raise HTTPException(status_code=404, detail="Viloyat topilmadi")
    return {"message": "Viloyat muvaffaqiyatli o'chirildi"}

# Tumanlar uchun endpointlar
@app.post("/districts/", response_model=schemas.District)
def create_district(
    district: schemas.DistrictCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    return crud.create_district(db=db, district=district)

@app.get("/districts/", response_model=List[schemas.District])
def read_districts(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    districts = crud.get_districts(db, skip=skip, limit=limit)
    return districts

@app.get("/districts/{district_id}", response_model=schemas.District)
def read_district(district_id: int, db: Session = Depends(get_db)):
    district = crud.get_district(db, district_id=district_id)
    if district is None:
        raise HTTPException(status_code=404, detail="Tuman topilmadi")
    return district

@app.get("/regions/{region_id}/districts/", response_model=List[schemas.District])
def read_region_districts(region_id: int, db: Session = Depends(get_db)):
    districts = crud.get_region_districts(db, region_id=region_id)
    return districts

@app.put("/districts/{district_id}", response_model=schemas.District)
def update_district(
    district_id: int,
    district: schemas.DistrictCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    updated_district = crud.update_district(db=db, district_id=district_id, district=district)
    if updated_district is None:
        raise HTTPException(status_code=404, detail="Tuman topilmadi")
    return updated_district

@app.delete("/districts/{district_id}")
def delete_district(
    district_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    success = crud.delete_district(db=db, district_id=district_id)
    if not success:
        raise HTTPException(status_code=404, detail="Tuman topilmadi")
    return {"message": "Tuman muvaffaqiyatli o'chirildi"}

# Toponimlar uchun endpointlar
@app.post("/toponims/", response_model=schemas.Toponim)
def create_toponim(
    toponim: schemas.ToponimCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    return crud.create_toponim(db=db, toponim=toponim)

@app.get("/toponims/", response_model=List[schemas.Toponim])
def read_toponims(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    toponims = crud.get_toponims(db, skip=skip, limit=limit)
    return toponims

@app.get("/toponims/{toponim_id}", response_model=schemas.Toponim)
def read_toponim(toponim_id: int, db: Session = Depends(get_db)):
    toponim = crud.get_toponim(db, toponim_id=toponim_id)
    if toponim is None:
        raise HTTPException(status_code=404, detail="Toponim topilmadi")
    return toponim

@app.get("/districts/{district_id}/toponims/", response_model=List[schemas.Toponim])
def read_district_toponims(district_id: int, db: Session = Depends(get_db)):
    toponims = crud.get_district_toponims(db, district_id=district_id)
    return toponims

@app.put("/toponims/{toponim_id}", response_model=schemas.Toponim)
def update_toponim(
    toponim_id: int,
    toponim: schemas.ToponimCreate,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    updated_toponim = crud.update_toponim(db=db, toponim_id=toponim_id, toponim=toponim)
    if updated_toponim is None:
        raise HTTPException(status_code=404, detail="Toponim topilmadi")
    return updated_toponim

@app.delete("/toponims/{toponim_id}")
def delete_toponim(
    toponim_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    success = crud.delete_toponim(db=db, toponim_id=toponim_id)
    if not success:
        raise HTTPException(status_code=404, detail="Toponim topilmadi")
    return {"message": "Toponim muvaffaqiyatli o'chirildi"}

# Xabarlar uchun endpointlar
@app.post("/messages/", response_model=schemas.Message)
def create_message(message: schemas.MessageCreate, db: Session = Depends(get_db)):
    return crud.create_message(db=db, message=message)

@app.get("/messages/", response_model=List[schemas.Message])
def read_messages(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    messages = crud.get_messages(db, skip=skip, limit=limit)
    return messages

@app.delete("/messages/{message_id}")
def delete_message(
    message_id: int,
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
):
    success = crud.delete_message(db=db, message_id=message_id)
    if not success:
        raise HTTPException(status_code=404, detail="Xabar topilmadi")
    return {"message": "Xabar muvaffaqiyatli o'chirildi"}

# Qidiruv endpointi
@app.get("/api/search")
def search_toponims(
    q: str = None,
    region: str = None,
    db: Session = Depends(get_db)
):
    query = db.query(models.Toponim)
    
    if q:
        search_filter = or_(
            models.Toponim.name.ilike(f"%{q}%"),
            models.Toponim.type.ilike(f"%{q}%"),
            models.Toponim.meaning.ilike(f"%{q}%")
        )
        query = query.filter(search_filter)
    
    if region:
        query = query.join(models.District).join(models.Region).filter(
            models.Region.name.ilike(f"%{region}%")
        )
    
    results = query.all()
    
    return [
        {
            "id": toponim.id,
            "name": toponim.name,
            "type": toponim.type,
            "district": toponim.district.name,
            "region": toponim.district.region.name,
            "latitude": toponim.latitude,
            "longitude": toponim.longitude,
            "meaning": toponim.meaning,
            "established": toponim.established,
            "previous_name": toponim.previous_name
        }
        for toponim in results
    ] 