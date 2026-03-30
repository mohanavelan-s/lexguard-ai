"""
Reviews Module — AI + Lawyer review workflow.
Stores AI-generated advice for lawyer review before delivering to users.

Tables: advice_reviews (id, user_id, question, ai_response, status, lawyer_notes, final_response, created_at)
"""
from sqlalchemy import insert, select, update

from modules.database import advice_reviews_table, engine, get_database_backend, init_database, users_table


# =========================================================
#  DATABASE INIT
# =========================================================

def init_reviews_db():
    init_database()
    print(f"[REVIEWS] Database initialized ({get_database_backend()})")


# =========================================================
#  REVIEW OPERATIONS
# =========================================================

def submit_for_review(user_id, question, ai_response):
    try:
        with engine.begin() as conn:
            result = conn.execute(
                insert(advice_reviews_table).values(
                    user_id=user_id,
                    question=question,
                    ai_response=ai_response,
                    status="pending",
                )
            )
        review_id = result.inserted_primary_key[0]
        return {"success": True, "review_id": review_id, "message": "Your query is being reviewed by a legal professional."}
    except Exception as exc:
        return {"success": False, "message": str(exc)}


def get_pending_reviews():
    with engine.connect() as conn:
        rows = conn.execute(
            select(
                advice_reviews_table,
                users_table.c.name.label("user_name"),
                users_table.c.email.label("user_email"),
            )
            .join(users_table, advice_reviews_table.c.user_id == users_table.c.id)
            .where(advice_reviews_table.c.status == "pending")
            .order_by(advice_reviews_table.c.created_at.desc())
        ).mappings().all()
    return [dict(row) for row in rows]


def get_approved_reviews():
    with engine.connect() as conn:
        rows = conn.execute(
            select(
                advice_reviews_table,
                users_table.c.name.label("user_name"),
            )
            .join(users_table, advice_reviews_table.c.user_id == users_table.c.id)
            .where(advice_reviews_table.c.status == "approved")
            .order_by(advice_reviews_table.c.created_at.desc())
        ).mappings().all()
    return [dict(row) for row in rows]


def get_user_reviews(user_id):
    with engine.connect() as conn:
        rows = conn.execute(
            select(advice_reviews_table)
            .where(advice_reviews_table.c.user_id == user_id)
            .order_by(advice_reviews_table.c.created_at.desc())
        ).mappings().all()
    return [dict(row) for row in rows]


def get_review_by_id(review_id):
    with engine.connect() as conn:
        row = conn.execute(
            select(advice_reviews_table).where(advice_reviews_table.c.id == review_id)
        ).mappings().first()
    return dict(row) if row else None


def approve_review(review_id, final_response, lawyer_notes=""):
    try:
        with engine.begin() as conn:
            conn.execute(
                update(advice_reviews_table)
                .where(advice_reviews_table.c.id == review_id)
                .values(status="approved", final_response=final_response, lawyer_notes=lawyer_notes)
            )
        return {"success": True, "message": "Review approved successfully."}
    except Exception as exc:
        return {"success": False, "message": str(exc)}
