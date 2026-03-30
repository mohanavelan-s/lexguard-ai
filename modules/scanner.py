import pdfplumber
import re


def extract_text_from_pdf(file_path):
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            text += page.extract_text() or ""
    return text


def split_into_clauses(text):
    pattern = r'\n\s*(?:\d+(\.\d+)*)\s+'
    parts = re.split(pattern, text)

    clauses = []
    buffer = ""

    for part in parts:
        if not part:
            continue

        if re.match(r'^\d+(\.\d+)*', part.strip()):
            if buffer:
                clauses.append(buffer.strip())
            buffer = "Clause " + part.strip()
        else:
            buffer += " " + part.strip()

    if buffer:
        clauses.append(buffer.strip())

    return clauses


def detect_risk(clause):
    text = clause.lower()

    if "terminate" in text and "notice" not in text:
        return "HIGH", "Termination without notice"

    if "non-compete" in text or "competitor" in text:
        return "HIGH", "Non-compete restriction"

    if "indemnify" in text or "indemnification" in text:
        return "MEDIUM", "Indemnification liability"

    if "arbitration" in text:
        return "MEDIUM", "Mandatory arbitration"

    return "LOW", "Standard contractual clause"


def get_impact(risk):
    if risk == "HIGH":
        return "May seriously affect your job security or rights."
    if risk == "MEDIUM":
        return "May create legal or financial issues later."
    return "No major legal impact detected."


def suggest_solution(risk):
    if risk == "HIGH":
        return "Negotiate safer terms or add employee protections."
    if risk == "MEDIUM":
        return "Seek clarification or limit the scope."
    return "No immediate action required."


def scan_and_analyze(file_path):
    full_text = extract_text_from_pdf(file_path)
    clauses = split_into_clauses(full_text)

    analyzed = []

    for i, clause in enumerate(clauses[:8]):
        risk, title = detect_risk(clause)

        analyzed.append({
            "id": i + 1,
            "risk": risk,
            "risk_title": title,
            "impact": get_impact(risk),
            "suggestion": suggest_solution(risk),
            "full_text": clause[:500]
        })

    heatmap = {
        "high": sum(1 for c in analyzed if c["risk"] == "HIGH"),
        "medium": sum(1 for c in analyzed if c["risk"] == "MEDIUM"),
        "low": sum(1 for c in analyzed if c["risk"] == "LOW")
    }

    return {
        "success": True,
        "clauses": analyzed,
        "heatmap": heatmap
    }
