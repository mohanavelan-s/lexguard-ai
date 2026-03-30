"""
Auth Module — Session-based authentication & role-based access control.
Uses SQLite for user storage. Passwords hashed with werkzeug.

Tables: users (id, name, email, password_hash, role)
"""
from functools import wraps

from flask import jsonify, redirect, request, session, url_for
from sqlalchemy import and_, insert, select, update
from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from modules.database import engine, get_database_backend, init_database, users_table


# =========================================================
#  DATABASE INIT
# =========================================================

def init_auth_db():
    init_database()
    print(f"[AUTH] Database initialized ({get_database_backend()})")


def _normalize_user(row):
    return dict(row) if row else None


def get_user_by_id(user_id):
    with engine.connect() as conn:
        row = conn.execute(
            select(
                users_table.c.id,
                users_table.c.name,
                users_table.c.email,
                users_table.c.role,
                users_table.c.password_hash,
            ).where(users_table.c.id == user_id)
        ).mappings().first()
    return _normalize_user(row)


def find_user_by_email(email):
    normalized_email = (email or "").strip().lower()
    with engine.connect() as conn:
        row = conn.execute(
            select(
                users_table.c.id,
                users_table.c.name,
                users_table.c.email,
                users_table.c.role,
                users_table.c.password_hash,
            ).where(users_table.c.email == normalized_email)
        ).mappings().first()
    return _normalize_user(row)


def email_in_use_by_other_user(email, user_id):
    normalized_email = (email or "").strip().lower()
    with engine.connect() as conn:
        row = conn.execute(
            select(users_table.c.id).where(
                and_(users_table.c.email == normalized_email, users_table.c.id != user_id)
            )
        ).first()
    return row is not None


def update_user_profile(user_id, name, email, password_hash=None):
    values = {"name": name.strip(), "email": email.strip().lower()}
    if password_hash:
        values["password_hash"] = password_hash

    with engine.begin() as conn:
        conn.execute(update(users_table).where(users_table.c.id == user_id).values(**values))

    return get_user_by_id(user_id)


# =========================================================
#  USER OPERATIONS
# =========================================================

def register_user(name, email, password, role="user"):
    if not name or not email or not password:
        return {"success": False, "message": "All fields are required."}

    if role not in ("user", "lawyer"):
        return {"success": False, "message": "Invalid role. Must be 'user' or 'lawyer'."}

    try:
        with engine.begin() as conn:
            conn.execute(
                insert(users_table).values(
                    name=name.strip(),
                    email=email.strip().lower(),
                    password_hash=generate_password_hash(password),
                    role=role,
                )
            )
        return {"success": True, "message": "Registration successful."}
    except IntegrityError:
        return {"success": False, "message": "Email already registered."}
    except Exception as exc:
        return {"success": False, "message": str(exc)}


def login_user(email, password):
    if not email or not password:
        return {"success": False, "message": "Email and password are required."}

    user = find_user_by_email(email)

    if user and check_password_hash(user["password_hash"], password):
        return {
            "success": True,
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "role": user["role"]
            }
        }
    return {"success": False, "message": "Invalid email or password."}


# =========================================================
#  ROLE-BASED ACCESS DECORATOR
# =========================================================

def role_required(role):
    """
    Decorator to restrict routes by role.
    Usage: @role_required("lawyer")
    """
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if "user_id" not in session:
                if request.path.startswith("/api/"):
                    return jsonify({"success": False, "error": "Authentication required."}), 401
                return redirect(url_for("login_page"))
            if session.get("role") != role:
                return jsonify({"success": False, "error": "Access denied. Requires role: " + role}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator


def login_required(f):
    """Decorator to require any authenticated user."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if "user_id" not in session:
            if request.path.startswith("/api/"):
                return jsonify({"success": False, "error": "Authentication required."}), 401
            return redirect(url_for("login_page"))
        return f(*args, **kwargs)
    return decorated_function
