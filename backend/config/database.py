from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config.settings import settings
from contextlib import contextmanager
from sqlalchemy.orm import Session


engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def atomic_transaction(db: Session):
    try:
        yield
        db.commit()
    except Exception as e:
        db.rollback()
        raise e
