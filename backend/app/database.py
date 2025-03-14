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

engine = create_engine(
    DATABASE_URL,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 60
    }
)

# SessionLocal klassi yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klass yaratish
Base = declarative_base() 