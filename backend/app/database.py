import os
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import time

load_dotenv()

# PostgreSQL ma'lumotlar bazasi uchun URL
DATABASE_URL = os.environ.get(
    "DATABASE_URL",
    "postgresql://toponim:toponim@dpg-cva4e60fnako73funfog-a.oregon-postgres.render.com/toponim_db"
)

# SQLAlchemy engine yaratish
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
            # Test connection
            with engine.connect() as conn:
                conn.execute("SELECT 1")
            return engine
        except Exception as e:
            if attempt == retries - 1:
                raise e
            print(f"Database connection attempt {attempt + 1} failed. Retrying in {delay} seconds...")
            time.sleep(delay)

engine = create_db_engine()

# Connection pool events
@event.listens_for(engine, "connect")
def connect(dbapi_connection, connection_record):
    print("New database connection established")

@event.listens_for(engine, "checkout")
def checkout(dbapi_connection, connection_record, connection_proxy):
    print("Database connection checked out from pool")

@event.listens_for(engine, "checkin")
def checkin(dbapi_connection, connection_record):
    print("Database connection returned to pool")

# SessionLocal klassi yaratish
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base klass yaratish
Base = declarative_base() 