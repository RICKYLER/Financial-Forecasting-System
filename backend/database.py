import os
import re
import sqlite3
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "")
LOCAL_DB_PATH = "local_forecast.db"
POSTGRES_ONLINE = True

def get_postgres_conn():
    """Create a psycopg2 connection to Neon PostgreSQL."""
    return psycopg2.connect(DATABASE_URL, connect_timeout=5)

def get_sqlite_conn():
    """Create a sqlite3 connection to local fallback database."""
    conn = sqlite3.connect(LOCAL_DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def translate_placeholders(query_str: str, driver: str) -> str:
    """Translate Postgres placeholder format ($1, $2) to driver-specific placeholders."""
    if driver == "postgres":
        # Replace $1, $2 with %s for psycopg2
        return re.sub(r'\$\d+', '%s', query_str)
    else:
        # Replace $1, $2 with ? for sqlite3
        return re.sub(r'\$\d+', '?', query_str)

def init_tables():
    """Create schema tables if they do not exist in both Neon and SQLite databases."""
    global POSTGRES_ONLINE
    create_users = """
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        fullname VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(100) NOT NULL
    );
    """
    create_sales = """
    CREATE TABLE IF NOT EXISTS sales (
        id SERIAL PRIMARY KEY,
        date VARCHAR(20) UNIQUE NOT NULL,
        sales INTEGER NOT NULL,
        revenue DOUBLE PRECISION NOT NULL,
        expenses DOUBLE PRECISION NOT NULL,
        profit DOUBLE PRECISION NOT NULL
    );
    """
    create_forecasts = """
    CREATE TABLE IF NOT EXISTS forecasts (
        id SERIAL PRIMARY KEY,
        month VARCHAR(20) UNIQUE NOT NULL,
        predicted_sales DOUBLE PRECISION NOT NULL,
        predicted_revenue DOUBLE PRECISION NOT NULL,
        predicted_expenses DOUBLE PRECISION NOT NULL
    );
    """
    create_reports = """
    CREATE TABLE IF NOT EXISTS reports (
        id SERIAL PRIMARY KEY,
        report_name VARCHAR(255) NOT NULL,
        generated_at VARCHAR(100) NOT NULL
    );
    """
    
    # 1. Try initializing Neon PostgreSQL first
    if DATABASE_URL and not DATABASE_URL.startswith("mock"):
        try:
            conn = get_postgres_conn()
            cursor = conn.cursor()
            cursor.execute(create_users)
            cursor.execute(create_sales)
            cursor.execute(create_forecasts)
            cursor.execute(create_reports)
            
            # Seed default users if empty
            cursor.execute("SELECT COUNT(*) FROM users")
            if cursor.fetchone()[0] == 0:
                from auth import get_password_hash
                cursor.execute(
                    "INSERT INTO users (fullname, email, password, role) VALUES (%s, %s, %s, %s)",
                    ("Sophia Rodriguez", "sophia@business.com", get_password_hash("password123"), "Business Owner")
                )
                cursor.execute(
                    "INSERT INTO users (fullname, email, password, role) VALUES (%s, %s, %s, %s)",
                    ("David Chen", "david@analyst.com", get_password_hash("password123"), "Financial Analyst")
                )
                cursor.execute(
                    "INSERT INTO users (fullname, email, password, role) VALUES (%s, %s, %s, %s)",
                    ("Admin User", "admin@forecast.com", get_password_hash("password123"), "Admin")
                )
                
            # Seed default sales if empty
            cursor.execute("SELECT COUNT(*) FROM sales")
            if cursor.fetchone()[0] == 0:
                initial_data = [
                    ("2025-01", 100, 50000.0, 33000.0, 17000.0),
                    ("2025-02", 110, 55000.0, 35000.0, 20000.0),
                    ("2025-03", 115, 57500.0, 36200.0, 21300.0),
                    ("2025-04", 125, 62500.0, 38000.0, 24500.0),
                    ("2025-05", 140, 70000.0, 41200.0, 28800.0),
                    ("2025-06", 145, 72500.0, 42000.0, 30500.0),
                    ("2025-07", 130, 65000.0, 39500.0, 25500.0),
                    ("2025-08", 128, 64000.0, 39000.0, 25000.0),
                    ("2025-09", 138, 69000.0, 41000.0, 28000.0),
                    ("2025-10", 148, 74000.0, 43200.0, 30800.0),
                    ("2025-11", 155, 77500.0, 45000.0, 32500.0),
                    ("2025-12", 175, 87500.0, 49500.0, 38000.0),
                ]
                for row in initial_data:
                    cursor.execute(
                        "INSERT INTO sales (date, sales, revenue, expenses, profit) VALUES (%s, %s, %s, %s, %s) ON CONFLICT DO NOTHING",
                        row
                    )
            
            conn.commit()
            cursor.close()
            conn.close()
            print("Neon PostgreSQL initialized successfully.")
        except Exception as e:
            print(f"Neon initialization failed: {e}. Falling back to SQLite schema creation.")
            POSTGRES_ONLINE = False

    # 2. Always initialize local SQLite fallback DB for local run safety
    try:
        conn = get_sqlite_conn()
        cursor = conn.cursor()
        
        # SQLite table creations (converting types to sqlite supported types)
        sqlite_users = create_users.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sqlite_sales = create_sales.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sqlite_forecasts = create_forecasts.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        sqlite_reports = create_reports.replace("SERIAL PRIMARY KEY", "INTEGER PRIMARY KEY AUTOINCREMENT")
        
        cursor.execute(sqlite_users)
        cursor.execute(sqlite_sales)
        cursor.execute(sqlite_forecasts)
        cursor.execute(sqlite_reports)
        
        # Seed users in SQLite
        cursor.execute("SELECT COUNT(*) FROM users")
        if cursor.fetchone()[0] == 0:
            from auth import get_password_hash
            cursor.execute(
                "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
                ("Sophia Rodriguez", "sophia@business.com", get_password_hash("password123"), "Business Owner")
            )
            cursor.execute(
                "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
                ("David Chen", "david@analyst.com", get_password_hash("password123"), "Financial Analyst")
            )
            cursor.execute(
                "INSERT INTO users (fullname, email, password, role) VALUES (?, ?, ?, ?)",
                ("Admin User", "admin@forecast.com", get_password_hash("password123"), "Admin")
            )
            
        # Seed sales in SQLite
        cursor.execute("SELECT COUNT(*) FROM sales")
        if cursor.fetchone()[0] == 0:
            initial_data = [
                ("2025-01", 100, 50000.0, 33000.0, 17000.0),
                ("2025-02", 110, 55000.0, 35000.0, 20000.0),
                ("2025-03", 115, 57500.0, 36200.0, 21300.0),
                ("2025-04", 125, 62500.0, 38000.0, 24500.0),
                ("2025-05", 140, 70000.0, 41200.0, 28800.0),
                ("2025-06", 145, 72500.0, 42000.0, 30500.0),
                ("2025-07", 130, 65000.0, 39500.0, 25500.0),
                ("2025-08", 128, 64000.0, 39000.0, 25000.0),
                ("2025-09", 138, 69000.0, 41000.0, 28000.0),
                ("2025-10", 148, 74000.0, 43200.0, 30800.0),
                ("2025-11", 155, 77500.0, 45000.0, 32500.0),
                ("2025-12", 175, 87500.0, 49500.0, 38000.0),
            ]
            cursor.executemany(
                "INSERT OR IGNORE INTO sales (date, sales, revenue, expenses, profit) VALUES (?, ?, ?, ?, ?)",
                initial_data
            )
            
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"SQLite fallback initialization failed: {e}")

def execute_postgres_query(query_str: str, params: list = None, fetch_all: bool = True):
    """Execute raw SQL statement against Neon PostgreSQL direct endpoint."""
    processed_query = translate_placeholders(query_str, "postgres")
    
    conn = get_postgres_conn()
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        cursor.execute(processed_query, params or [])
        
        # Check if the query selects data
        if processed_query.strip().lower().startswith("select"):
            if fetch_all:
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
            else:
                row = cursor.fetchone()
                return dict(row) if row else None
        else:
            conn.commit()
            return {"rows_affected": cursor.rowcount}
    finally:
        cursor.close()
        conn.close()

def execute_sqlite_query(query_str: str, params: list = None, fetch_all: bool = True):
    """Execute raw SQL statement inside local fallback SQLite DB."""
    processed_query = translate_placeholders(query_str, "sqlite")
    
    conn = get_sqlite_conn()
    cursor = conn.cursor()
    
    try:
        cursor.execute(processed_query, params or [])
        
        if processed_query.strip().lower().startswith("select"):
            if fetch_all:
                rows = cursor.fetchall()
                return [dict(row) for row in rows]
            else:
                row = cursor.fetchone()
                return dict(row) if row else None
        else:
            conn.commit()
            return {"rows_affected": cursor.rowcount}
    except Exception as e:
        print(f"SQLite query failed: {e}")
        raise e
    finally:
        conn.close()

def execute_query(query_str: str, params: list = None, fetch_all: bool = True):
    """Execute queries trying Neon PostgreSQL first, failing back to local SQLite on errors."""
    global POSTGRES_ONLINE
    if not DATABASE_URL or DATABASE_URL.startswith("mock") or not POSTGRES_ONLINE:
        return execute_sqlite_query(query_str, params, fetch_all)
        
    try:
        return execute_postgres_query(query_str, params, fetch_all)
    except Exception as e:
        print(f"PostgreSQL query failed: {e}. Falling back to SQLite.")
        POSTGRES_ONLINE = False
        return execute_sqlite_query(query_str, params, fetch_all)
