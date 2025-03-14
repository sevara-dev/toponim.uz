import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv

load_dotenv()

# PostgreSQL ma'lumotlar bazasi uchun URL
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql://toponim:toponim@dpg-cva4e60fnako73funfog-a.oregon-postgres.render.com/toponim_db"
)

# SQLAlchemy engine yaratish
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SSL sertifikatini tekshirmasdan ulanish
connect_args = {
    "sslmode": "require",
    "connect_timeout": 30,
    "keepalives": 1,
    "keepalives_idle": 30,
    "keepalives_interval": 10,
    "keepalives_count": 5
}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10
)

# SessionLocal klassi yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klass yaratish
Base = declarative_base() 