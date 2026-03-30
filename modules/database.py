import os
import sqlite3
from pathlib import Path

from sqlalchemy import Column, DateTime, ForeignKey, Integer, MetaData, String, Table, Text, create_engine, func


PROJECT_ROOT = Path(__file__).resolve().parent.parent


def _get_data_dir():
    configured_dir = os.getenv("LEXGUARD_DATA_DIR")
    data_dir = Path(configured_dir) if configured_dir else PROJECT_ROOT / "data"
    data_dir.mkdir(parents=True, exist_ok=True)
    return data_dir


DATA_DIR = _get_data_dir()
DEFAULT_SQLITE_PATH = DATA_DIR / "lexguard.db"
MEMORY_SQLITE_URL = "sqlite+pysqlite:///:memory:"


def _default_sqlite_url():
    if os.getenv("LEXGUARD_FORCE_DISK_SQLITE", "0") == "1":
        return f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"

    probe = None
    try:
        probe = sqlite3.connect(DEFAULT_SQLITE_PATH)
        probe.execute("CREATE TABLE IF NOT EXISTS __lexguard_probe (id INTEGER PRIMARY KEY)")
        probe.execute("DROP TABLE __lexguard_probe")
        probe.commit()
        return f"sqlite:///{DEFAULT_SQLITE_PATH.as_posix()}"
    except sqlite3.Error:
        return MEMORY_SQLITE_URL
    finally:
        if probe is not None:
            probe.close()


def normalize_database_url(database_url):
    if not database_url:
        return _default_sqlite_url()
    if database_url.startswith("postgres://"):
        database_url = "postgresql://" + database_url[len("postgres://"):]
    if database_url.startswith("postgresql://"):
        return "postgresql+psycopg://" + database_url[len("postgresql://"):]
    return database_url


DATABASE_URL = normalize_database_url(os.getenv("DATABASE_URL", "").strip())
IS_SQLITE = DATABASE_URL.startswith("sqlite")

engine = create_engine(
    DATABASE_URL,
    future=True,
    pool_pre_ping=not IS_SQLITE,
    connect_args={"check_same_thread": False} if IS_SQLITE else {},
)

metadata = MetaData()

users_table = Table(
    "users",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("name", String(255), nullable=False),
    Column("email", String(255), nullable=False, unique=True),
    Column("password_hash", Text, nullable=False),
    Column("role", String(50), nullable=False, server_default="user"),
)

advice_reviews_table = Table(
    "advice_reviews",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id"), nullable=False),
    Column("question", Text, nullable=False),
    Column("ai_response", Text, nullable=False),
    Column("status", String(50), nullable=False, server_default="pending"),
    Column("lawyer_notes", Text, nullable=False, server_default=""),
    Column("final_response", Text, nullable=False, server_default=""),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)

case_requests_table = Table(
    "case_requests",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("case_number", String(100), nullable=False),
    Column("year", String(20)),
    Column("court_type", String(255)),
    Column("status", String(100), nullable=False),
    Column("next_hearing", String(100)),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)

cases_table = Table(
    "cases",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("case_name", Text, nullable=False),
    Column("year", String(20)),
    Column("court", String(255)),
    Column("judges", Text),
    Column("judgement", Text),
    Column("narrative", Text),
    Column("key_people", Text),
)


def init_database():
    metadata.create_all(engine)


def get_database_backend():
    return "sqlite" if IS_SQLITE else "postgres"
