from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "sqlite:///./students.db"

# Tạo engine kết nối (check_same_thread=False cần thiết cho SQLite trong FastAPI)
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Tạo session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Class Base để các model kế thừa
Base = declarative_base()

# Dependency cung cấp session cho các API
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()