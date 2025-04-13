import os
import time
import logging
from dotenv import load_dotenv
from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# .env fayldan o'zgaruvchilarni yuklash
load_dotenv()

# PostgreSQL ma'lumotlar bazasi uchun URL
DATABASE_URL = os.getenv("DATABASE_URL", "").strip()

if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable is not set or invalid")

# Agar eski formatda bo‘lsa, to‘g‘rilaymiz
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# SSL va boshqa ulanish parametrlari
connect_args = {
    "sslmode": "require",
    "connect_timeout": 30,
    "keepalives": 1,
    "keepalives_idle": 30,
    "keepalives_interval": 10,
    "keepalives_count": 5
}

# Engine yaratish
def create_db_engine(retries=5, delay=5):
    for attempt in range(retries):
        try:
            engine = create_engine(
                DATABASE_URL,
                connect_args=connect_args,
                pool_pre_ping=True,
                pool_recycle=300,
                pool_size=5,
                max_overflow=10,
                echo=True
            )
            # Ulanishni tekshirish
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info("Database connection established successfully.")
            return engine
        except Exception as e:
            if attempt == retries - 1:
                logger.error("Failed to connect to the database.", exc_info=True)
                raise e
            print(f"Database connection attempt {attempt + 1} failed. Retrying in {delay} seconds...")
            time.sleep(delay)

engine = create_db_engine()

# Ulanish havzasi (pool) uchun hodisalar
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    print("New database connection established")

@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    print("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def checkin(dbapi_connection, connection_record):
    print("Database connection returned to pool")

# Session yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Bazaviy model klassi
Base = declarative_base()
