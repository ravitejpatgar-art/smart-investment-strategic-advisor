from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Setup DB URL (handle Postgres postgres:// -> postgresql:// Render compatibility)
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def ensure_sqlite_columns():
    """Ensure SQLite schema has newly added columns if created with an older version."""
    if db_url.startswith("sqlite"):
        try:
            with engine.connect() as conn:
                # Check financial_profiles
                res = conn.exec_driver_sql("PRAGMA table_info(financial_profiles);").fetchall()
                col_names = [r[1] for r in res]
                if col_names and "existing_investments" not in col_names:
                    conn.exec_driver_sql("ALTER TABLE financial_profiles ADD COLUMN existing_investments FLOAT DEFAULT 0.0;")
                
                # Check expenses
                res_exp = conn.exec_driver_sql("PRAGMA table_info(expenses);").fetchall()
                col_names_exp = [r[1] for r in res_exp]
                if col_names_exp and "updated_at" not in col_names_exp:
                    conn.exec_driver_sql("ALTER TABLE expenses ADD COLUMN updated_at DATETIME;")

                # Check goals
                res_goals = conn.exec_driver_sql("PRAGMA table_info(goals);").fetchall()
                col_names_goals = [r[1] for r in res_goals]
                if col_names_goals and "updated_at" not in col_names_goals:
                    conn.exec_driver_sql("ALTER TABLE goals ADD COLUMN updated_at DATETIME;")

                # Check portfolio_holdings
                res_port = conn.exec_driver_sql("PRAGMA table_info(portfolio_holdings);").fetchall()
                col_names_port = [r[1] for r in res_port]
                if col_names_port and "updated_at" not in col_names_port:
                    conn.exec_driver_sql("ALTER TABLE portfolio_holdings ADD COLUMN updated_at DATETIME;")
        except Exception:
            pass

ensure_sqlite_columns()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
