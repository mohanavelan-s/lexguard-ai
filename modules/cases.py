from sqlalchemy import or_, select

from modules.database import cases_table, engine
from seed_cases_db import ensure_cases_seeded

def find_cases(query, year=None, court=None):
    try:
        ensure_cases_seeded()
        search_term = f"%{(query or '').strip()}%"

        statement = select(
            cases_table.c.case_name,
            cases_table.c.year,
            cases_table.c.court,
            cases_table.c.judges,
            cases_table.c.narrative,
            cases_table.c.judgement,
            cases_table.c.key_people,
        ).where(
            or_(
                cases_table.c.case_name.ilike(search_term),
                cases_table.c.narrative.ilike(search_term),
                cases_table.c.key_people.ilike(search_term),
                cases_table.c.judgement.ilike(search_term),
            )
        )

        if year and year != "Any":
            statement = statement.where(cases_table.c.year == year)

        if court and court != "Any":
            statement = statement.where(cases_table.c.court == court)

        with engine.connect() as conn:
            rows = conn.execute(statement).all()

        if not rows:
            return {"success": True, "cases": []}

        cases = []
        for row in rows:
            cases.append({
                "title": row[0],
                "year": row[1],
                "court": row[2],
                "judges": row[3],
                "summary": row[4],
                "outcome": row[5],
                "key_people": row[6],
            })

        return {"success": True, "cases": cases}

    except Exception as exc:
        return {"success": False, "error": str(exc), "cases": []}
