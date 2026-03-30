import os
import io
import re as re_module
from pathlib import Path
import requests  # 🔴 REQUIRED: Run 'pip install requests'
import resend
from dotenv import load_dotenv
from flask import Flask, render_template, request, jsonify, session, redirect, url_for, send_file, send_from_directory
from datetime import datetime
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch
from sqlalchemy import insert
from werkzeug.middleware.proxy_fix import ProxyFix
from werkzeug.security import generate_password_hash

try:
    from googletrans import Translator
except Exception as e:
    print(f"[WARNING] googletrans could not be imported: {e}")

    class _FallbackTranslation:
        def __init__(self, text):
            self.text = text

    class Translator:  # type: ignore[override]
        def translate(self, text, dest="en"):
            return _FallbackTranslation(text)

load_dotenv()

# --- IMPORT YOUR MODULES ---
# Ensure these files exist in your 'modules' folder.
# If you don't have them yet, comment them out to run the server.
try:
    from modules.scanner import scan_and_analyze
    from modules.legal_advisor import legal_advice
    from modules.cases import find_cases
    from modules.connect import get_lawyers
    from modules.protect import protect_me
except ImportError as e:
    print(f"[WARNING] Some modules could not be imported: {e}")
    # Dummy functions to prevent crash if modules are missing
    def scan_and_analyze(path): return {"error": "Module missing"}
    def legal_advice(q): return {"answer": "Module missing"}
    def find_cases(q): return []
    def get_lawyers(c, s): return []
    def protect_me(k): return {"response": "Module missing"}

app = Flask(__name__)
app.secret_key = os.getenv("FLASK_SECRET_KEY", "dev-secret-key-change-me")
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)
app.config["SESSION_COOKIE_SECURE"] = os.getenv("SESSION_COOKIE_SECURE", "0") == "1"
app.config["SESSION_COOKIE_SAMESITE"] = os.getenv("SESSION_COOKIE_SAMESITE", "Lax")

# --- AUTH & REVIEWS MODULES ---
try:
    from modules.auth import (
        email_in_use_by_other_user,
        get_user_by_id,
        init_auth_db,
        login_required,
        login_user,
        register_user,
        role_required,
        update_user_profile,
    )
    from modules.reviews import init_reviews_db, submit_for_review, get_pending_reviews, get_approved_reviews, get_user_reviews, approve_review
    init_auth_db()
    init_reviews_db()
except ImportError as e:
    print(f"[WARNING] Auth/Reviews modules could not be imported: {e}")

from modules.database import case_requests_table, engine, get_database_backend, init_database
from modules.storage import UPLOAD_DIR, get_storage_backend, save_uploaded_file
from seed_cases_db import ensure_cases_seeded

init_database()
ensure_cases_seeded()

PROJECT_ROOT = Path(__file__).resolve().parent
FRONTEND_DIST_DIR = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_ASSETS_DIR = FRONTEND_DIST_DIR / "assets"


def frontend_dist_ready():
    return (FRONTEND_DIST_DIR / "index.html").exists()


def serve_frontend_app():
    return send_from_directory(FRONTEND_DIST_DIR, "index.html")


def render_ui_or_spa(template_name, **context):
    if frontend_dist_ready():
        return serve_frontend_app()
    return render_template(template_name, **context)


def serialize_user(user):
    if not user:
        return None

    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
    }


def get_current_session_payload():
    user = None
    user_id = session.get("user_id")

    if user_id:
        try:
            user = serialize_user(get_user_by_id(user_id))
        except Exception:
            user = None

    return {
        "authenticated": bool(user),
        "lang": session.get("lang", "en"),
        "user": user,
    }

# --- DEMO CASE STATUS ENGINE ---
# This is a demo dataset. In production, integrate with authorized judicial APIs.
DEMO_CASES = {
    "1234": {"status": "Pending", "next_hearing": "15-Aug-2026"},
    "5678": {"status": "Disposed", "next_hearing": None},
    "9999": {"status": "Adjourned", "next_hearing": "01-Sep-2026"}
}

print(f"[CASE-LOOKUP] Database ready ({get_database_backend()})")
print(f"[STORAGE] Upload directory ready at {UPLOAD_DIR}")

# --- EMAIL NOTIFICATION (Resend SDK) ---
# ============================================================
# Set RESEND_API_KEY env var before running:
#   PowerShell: $env:RESEND_API_KEY="re_xxxxxxxxxxxx"
#   CMD:        set RESEND_API_KEY=re_xxxxxxxxxxxx
#   Linux/Mac:  export RESEND_API_KEY=re_xxxxxxxxxxxx
# GLOBAL key — one key for all users. Do NOT generate per user.
# ============================================================
RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
resend.api_key = RESEND_API_KEY

SENDER_EMAIL = "LexGuard AI <onboarding@resend.dev>"

def send_case_email(to_email, case_number, status, next_hearing):
    """Send case status email via Resend SDK. Retries up to 3 times for rate limits."""
    import time

    if not RESEND_API_KEY:
        print("[EMAIL] Resend API key not configured")
        return False

    print(f"[EMAIL] Attempting to send email to: {to_email}")

    email_payload = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": "LexGuard Case Status Update",
        "html": f"""
            <h2>⚖️ Case Status Update</h2>
            <p><strong>Case Number:</strong> {case_number}</p>
            <p><strong>Status:</strong> {status}</p>
            <p><strong>Next Hearing:</strong> {next_hearing or 'Not Scheduled'}</p>
            <br>
            <p style="color: #666;">- LexGuard AI</p>
        """
    }

    max_retries = 3
    for attempt in range(1, max_retries + 1):
        try:
            # Re-set API key on each attempt (guards against SDK state issues)
            resend.api_key = RESEND_API_KEY
            response = resend.Emails.send(email_payload)

            # Extract email ID from response
            email_id = None
            if isinstance(response, dict):
                if response.get("statusCode") or response.get("error"):
                    err_msg = response.get("message") or response.get("error") or str(response)
                    print(f"[EMAIL] Attempt {attempt}/{max_retries} — API error: {err_msg}")
                    if attempt < max_retries:
                        time.sleep(attempt * 2)  # backoff: 2s, 4s
                        continue
                    return False
                email_id = response.get("id")
            elif hasattr(response, "id"):
                email_id = response.id

            if email_id:
                print(f"[EMAIL] ✅ Sent to {to_email} — ID: {email_id}")
                return True
            else:
                print(f"[EMAIL] Attempt {attempt}/{max_retries} — no ID in response: {response}")
                if attempt < max_retries:
                    time.sleep(attempt * 2)
                    continue
                return False

        except Exception as e:
            err_str = str(e).lower()
            print(f"[EMAIL] Attempt {attempt}/{max_retries} — exception: {e}")
            # Retry on rate limit or transient errors
            if attempt < max_retries and ("rate" in err_str or "429" in err_str or "timeout" in err_str or "connection" in err_str):
                time.sleep(attempt * 2)
                continue
            return False

    return False

# 🟢 TWILIO CONFIGURATION
TWILIO_SID = os.getenv("TWILIO_SID", "")
TWILIO_AUTH = os.getenv("TWILIO_AUTH", "")
TWILIO_PHONE = os.getenv("TWILIO_PHONE", "")
MY_PHONE = os.getenv("MY_PHONE", "")


# =========================================================
#  1. UI ROUTES (HTML PAGES)
# =========================================================

@app.route("/")
def home():
    return render_ui_or_spa("dashboard.html")

@app.route("/dashboard")
def dashboard():
    return render_ui_or_spa("dashboard.html")

@app.route("/pricing")
def pricing_page():
    return render_ui_or_spa("dashboard.html")

@app.route("/analytics")
def analytics_page():
    return render_ui_or_spa("dashboard.html")

@app.route("/scanner")
def scanner_page():
    return render_ui_or_spa("scanner.html")

@app.route("/legal-advisor")
def legal_advisor_page():
    return render_ui_or_spa("legal_advisor.html")

@app.route("/cases")
def cases_page():
    return render_ui_or_spa("cases.html")

@app.route("/lawyers")
def lawyers_page():
    return render_ui_or_spa("lawyers.html")

@app.route("/protect")
def protect_page():
    return render_ui_or_spa("protect.html")

@app.route("/case-lookup")
def case_lookup_page():
    if frontend_dist_ready():
        return serve_frontend_app()
    return send_from_directory(app.static_folder, "case_lookup.html")

@app.route("/assets/<path:filename>")
def frontend_assets(filename):
    if FRONTEND_ASSETS_DIR.exists():
        return send_from_directory(FRONTEND_ASSETS_DIR, filename)
    return jsonify({"success": False, "error": "Frontend assets not built."}), 404


# =========================================================
#  2. CORE API ROUTES (FUNCTIONALITY)
# =========================================================

@app.route("/api/session")
def api_session():
    return jsonify(get_current_session_payload())

@app.route("/api/scan", methods=["POST"])
def api_scan():
    if "file" not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"})

    file = request.files["file"]
    file_path, stored_name = save_uploaded_file(file, prefix="scan")

    try:
        result = scan_and_analyze(str(file_path))
        result["stored_file"] = stored_name
        return jsonify(result)
    except Exception as exc:
        return jsonify({"success": False, "error": str(exc)})

@app.route("/api/legal", methods=["POST"])
def api_legal():
    """Legal advice endpoint — translates output if session lang != en."""
    data = request.get_json() or {}
    result = legal_advice(data.get("question", ""))

    # Translate text fields if non-English language selected
    lang = session.get("lang", "en")
    if lang != "en" and result.get("matched"):
        result["title"] = translate_text(result.get("title", ""), lang)
        # Translate answer (HTML) — strip tags, translate, rebuild
        if result.get("answer"):
            result["answer"] = translate_text(result["answer"], lang)
        if result.get("what_next"):
            result["what_next"] = [translate_text(item, lang) for item in result["what_next"]]
        if result.get("disclaimer"):
            result["disclaimer"] = translate_text(result["disclaimer"], lang)

    return jsonify(result)

@app.route("/api/cases", methods=["POST"])
def api_cases():
    data = request.get_json() or {}
    query = data.get("query", "")
    year = data.get("year", "Any")
    court = data.get("court", "Any")
    return jsonify(find_cases(query, year, court))

@app.route("/api/lawyers", methods=["POST"])
def api_lawyers():
    data = request.get_json() or {}
    return jsonify(get_lawyers(data.get("city", ""), data.get("specialization", "")))

@app.route("/api/protect", methods=["POST"])
def api_protect():
    data = request.get_json() or {}
    return jsonify(protect_me(data.get("keyword", "")))

@app.route("/save-audio", methods=["POST"])
def save_audio():
    if "audio" not in request.files:
        return jsonify({"status": "error", "message": "No audio file"})

    audio = request.files["audio"]
    _, filename = save_uploaded_file(audio, prefix="evidence")
    return jsonify({"status": "saved", "filename": filename})


# =========================================================
#  3. SOS API (THE FIX)
# =========================================================

@app.route('/api/send-sos', methods=['POST'])
def send_sos():
    """
    Sends an SOS SMS using Direct HTTP Request (Imitates Curl).
    This bypasses library issues.
    """
    # 1. Get Coordinates from Frontend
    data = request.json
    lat = data.get('lat', '0')
    lng = data.get('lng', '0')
    
    # 🔴 FIX: Correct Google Maps URL format
    maps_url = f"https://maps.google.com/?q={lat},{lng}"
    
    message_body = f"LEXGUARD EMERGENCY!\nI feel unsafe.\nTracking Location: {maps_url}"

    if not all([TWILIO_SID, TWILIO_AUTH, TWILIO_PHONE, MY_PHONE]):
        return jsonify({
            "status": "error",
            "message": "Twilio is not configured. Set TWILIO_SID, TWILIO_AUTH, TWILIO_PHONE, and MY_PHONE."
        }), 500

    # 3. Construct the API URL
    url = f"https://api.twilio.com/2010-04-01/Accounts/{TWILIO_SID}/Messages.json"
    
    # 4. Define Payload (Same as your Curl command)
    payload = {
        "To": MY_PHONE,
        "From": TWILIO_PHONE,
        "Body": message_body
    }

    try:
        print(f"[SOS] Sending SOS Request to {MY_PHONE}...")
        
        # 5. Send Request
        response = requests.post(
            url, 
            data=payload, 
            auth=(TWILIO_SID, TWILIO_AUTH) # Basic Auth using SID/Token
        )
        
        # 6. Handle Response
        if response.status_code == 201: # HTTP 201 = Created (Success)
            print(f"[OK] SMS Sent! SID: {response.json().get('sid')}")
            return jsonify({"status": "success", "response": response.json()})
        else:
            print(f"[ERROR] Twilio Refused: {response.text}")
            return jsonify({"status": "error", "message": response.text}), 500

    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")
        return jsonify({"status": "error", "message": str(e)}), 500


# =========================================================
#  4. AUTH ROUTES (NEW — does NOT modify existing routes)
# =========================================================

@app.route("/login", methods=["GET", "POST"])
def login_page():
    if request.method == "GET":
        return render_ui_or_spa("login.html")

    if request.method == "POST":
        result = login_user(request.form.get("email"), request.form.get("password"))
        if result["success"]:
            user = result["user"]
            session["user_id"] = user["id"]
            session["role"] = user["role"]
            session["name"] = user["name"]
            if user["role"] == "lawyer":
                return redirect(url_for("lawyer_dashboard"))
            return redirect(url_for("user_dashboard"))
        return render_template("login.html", error=result["message"])

@app.route("/register", methods=["GET", "POST"])
def register_page():
    if request.method == "GET":
        return render_ui_or_spa("register.html")

    if request.method == "POST":
        result = register_user(
            request.form.get("name"),
            request.form.get("email"),
            request.form.get("password"),
            request.form.get("role", "user")
        )
        if result["success"]:
            return render_template("register.html", success="Account created! You can now login.")
        return render_template("register.html", error=result["message"])

@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("home"))

@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json() or {}
    result = login_user(data.get("email"), data.get("password"))

    if not result["success"]:
        return jsonify({"success": False, "error": result["message"]}), 401

    user = result["user"]
    session["user_id"] = user["id"]
    session["role"] = user["role"]
    session["name"] = user["name"]
    return jsonify({"success": True, "user": serialize_user(user)})

@app.route("/api/register", methods=["POST"])
def api_register():
    data = request.get_json() or {}
    result = register_user(
        data.get("name"),
        data.get("email"),
        data.get("password"),
        data.get("role", "user"),
    )

    status_code = 200 if result["success"] else 400
    payload = {"success": result["success"], "message": result["message"]}
    if not result["success"]:
        payload["error"] = result["message"]
    return jsonify(payload), status_code

@app.route("/api/logout", methods=["POST"])
def api_logout():
    session.clear()
    return jsonify({"success": True})


# =========================================================
#  5. DASHBOARD ROUTES (NEW — role-protected)
# =========================================================

@app.route("/lawyer-dashboard")
def lawyer_dashboard():
    if frontend_dist_ready():
        return serve_frontend_app()
    if not session.get("user_id"):
        return redirect(url_for("login_page"))
    if session.get("role") != "lawyer":
        return jsonify({"success": False, "error": "Access denied. Requires role: lawyer"}), 403
    pending = get_pending_reviews()
    approved = get_approved_reviews()
    return render_template("lawyer_dashboard.html", pending=pending, approved=approved)

@app.route("/user-dashboard")
def user_dashboard():
    if frontend_dist_ready():
        return serve_frontend_app()
    if not session.get("user_id"):
        return redirect(url_for("login_page"))
    if session.get("role") != "user":
        return jsonify({"success": False, "error": "Access denied. Requires role: user"}), 403
    reviews = get_user_reviews(session["user_id"])
    return render_template("user_dashboard.html", reviews=reviews)

@app.route("/api/user-reviews")
@login_required
def api_user_reviews():
    return jsonify({"success": True, "reviews": get_user_reviews(session["user_id"])})

@app.route("/api/review-queue")
@role_required("lawyer")
def api_review_queue():
    return jsonify(
        {
            "success": True,
            "pending": get_pending_reviews(),
            "approved": get_approved_reviews(),
        }
    )


# =========================================================
#  6. REVIEW WORKFLOW ROUTES (NEW — does NOT touch /api/legal)
# =========================================================

@app.route("/api/review-advice", methods=["POST"])
@login_required
def review_advice():
    """User submits a question. AI generates response, stored for lawyer review."""
    if request.is_json:
        data = request.get_json() or {}
        question = (data.get("question") or "").strip()
    else:
        question = (request.form.get("question") or "").strip()

    if not question:
        if request.is_json:
            return jsonify({"success": False, "error": "Question is required."}), 400
        return redirect(url_for("user_dashboard"))
    # Get AI response (reuses existing legal_advice function)
    ai_result = legal_advice(question)
    ai_response = ai_result.get("answer", "No AI response generated.")
    # Store for lawyer review
    result = submit_for_review(session["user_id"], question, ai_response)
    if request.is_json:
        status_code = 200 if result.get("success") else 400
        payload = {"success": result.get("success", False), "message": result.get("message", "")}
        if result.get("review_id"):
            payload["review_id"] = result["review_id"]
        if not result.get("success"):
            payload["error"] = result.get("message", "Review submission failed.")
        return jsonify(payload), status_code
    return redirect(url_for("user_dashboard"))

@app.route("/api/approve-advice", methods=["POST"])
@role_required("lawyer")
def approve_advice():
    """Lawyer approves or edits AI-generated advice."""
    if request.is_json:
        data = request.get_json() or {}
        review_id = data.get("review_id")
        final_response = data.get("final_response", "")
        lawyer_notes = data.get("lawyer_notes", "")
    else:
        review_id = request.form.get("review_id")
        final_response = request.form.get("final_response", "")
        lawyer_notes = request.form.get("lawyer_notes", "")
    if review_id:
        result = approve_review(int(review_id), final_response, lawyer_notes)
        if request.is_json:
            status_code = 200 if result.get("success") else 400
            payload = {"success": result.get("success", False), "message": result.get("message", "")}
            if not result.get("success"):
                payload["error"] = result.get("message", "Approval failed.")
            return jsonify(payload), status_code
    elif request.is_json:
        return jsonify({"success": False, "error": "Review ID is required."}), 400
    if request.is_json:
        return jsonify({"success": True, "message": "Review approved successfully."})
    return redirect(url_for("lawyer_dashboard"))


# =========================================================
#  7. DEMO CASE LOOKUP ENGINE (NEW — does NOT modify existing routes)
# =========================================================

@app.route("/submit-case", methods=["POST"])
def submit_case():
    """
    Demo case status lookup.
    - Checks case_number against DEMO_CASES dataset
    - Saves record in case_requests table
    - Sends email notification to logged-in user
    - Returns JSON with status info
    """
    # Require login
    if not session.get("user_id"):
        return jsonify({"success": False, "error": "Please login to use case lookup."}), 401

    data = request.get_json() or {}
    case_number = (data.get("case_number") or "").strip()
    year = (data.get("year") or "").strip()
    court_type = (data.get("court_type") or "").strip()

    if not case_number:
        return jsonify({"success": False, "error": "Case number is required."}), 400

    # Determine status from demo dataset
    if case_number in DEMO_CASES:
        status = DEMO_CASES[case_number]["status"]
        next_hearing = DEMO_CASES[case_number]["next_hearing"]
    else:
        status = "Under Review"
        next_hearing = "To Be Announced"

    # Save to database
    try:
        with engine.begin() as conn:
            conn.execute(
                insert(case_requests_table).values(
                    user_id=session["user_id"],
                    case_number=case_number,
                    year=year,
                    court_type=court_type,
                    status=status,
                    next_hearing=next_hearing,
                )
            )
    except Exception as exc:
        print(f"[CASE-LOOKUP ERROR] DB save failed: {exc}")

    # Send email notification to logged-in user
    email_sent = False
    try:
        user = get_user_by_id(session["user_id"])
        if user:
            email_sent = send_case_email(user["email"], case_number, status, next_hearing)
    except Exception as exc:
        print(f"[CASE-LOOKUP ERROR] Email lookup failed: {exc}")

    return jsonify({
        "success": True,
        "status": status,
        "next_hearing": next_hearing or "Not Scheduled",
        "email_sent": email_sent
    })


# =========================================================
#  8. SETTINGS / PROFILE MANAGEMENT (NEW — does NOT modify existing routes)
# =========================================================

@app.route("/settings", methods=["GET", "POST"])
def settings():
    """
    Profile management page.
    - GET: show current user details
    - POST: update username, email, and optionally password
    """
    if request.method == "GET" and frontend_dist_ready():
        return serve_frontend_app()

    # Require login
    if not session.get("user_id"):
        return redirect(url_for("login_page"))

    if request.method == "GET":
        user = get_user_by_id(session["user_id"])
        if not user:
            return redirect(url_for("login_page"))
        return render_template("settings.html", user=user)

    # --- POST: Update profile ---
    name = (request.form.get("name") or "").strip()
    email = (request.form.get("email") or "").strip().lower()
    new_password = (request.form.get("new_password") or "").strip()
    confirm_password = (request.form.get("confirm_password") or "").strip()

    # Validation
    if not name or not email:
        return _render_settings_with_error("Username and email are required.")

    # Password confirmation check
    if new_password and new_password != confirm_password:
        return _render_settings_with_error("Passwords do not match.")

    # Email uniqueness check (exclude current user)
    if email_in_use_by_other_user(email, session["user_id"]):
        return _render_settings_with_error("This email is already in use by another account.")

    # Update user details
    try:
        password_hash = generate_password_hash(new_password) if new_password else None
        user = update_user_profile(session["user_id"], name, email, password_hash=password_hash)

        # Update session if username changed
        session["name"] = name

        return render_template("settings.html", user=user, success="Profile updated successfully!")

    except Exception as exc:
        return _render_settings_with_error(f"Update failed: {str(exc)}")


def _render_settings_with_error(error_msg):
    """Helper to re-render settings page with error and current user data."""
    user = get_user_by_id(session["user_id"])
    return render_template("settings.html", user=user, error=error_msg)

@app.route("/api/settings", methods=["GET", "PUT"])
@login_required
def api_settings():
    if request.method == "GET":
        user = get_user_by_id(session["user_id"])
        return jsonify({"success": True, "user": serialize_user(user)})

    data = request.get_json() or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    new_password = (data.get("new_password") or "").strip()
    confirm_password = (data.get("confirm_password") or "").strip()

    if not name or not email:
        return jsonify({"success": False, "error": "Username and email are required."}), 400

    if new_password and new_password != confirm_password:
        return jsonify({"success": False, "error": "Passwords do not match."}), 400

    if email_in_use_by_other_user(email, session["user_id"]):
        return jsonify({"success": False, "error": "This email is already in use by another account."}), 400

    try:
        password_hash = generate_password_hash(new_password) if new_password else None
        user = update_user_profile(session["user_id"], name, email, password_hash=password_hash)
        session["name"] = name
        return jsonify(
            {
                "success": True,
                "message": "Profile updated successfully!",
                "user": serialize_user(user),
            }
        )
    except Exception as exc:
        return jsonify({"success": False, "error": f"Update failed: {str(exc)}"}), 500


# =========================================================
#  9. MULTI-LANGUAGE SUPPORT (NEW — does NOT modify existing routes)
# =========================================================

# Translation utility
translator = Translator()

def translate_text(text, target_lang):
    """Translate text to target language. Returns original on failure."""
    if target_lang == "en":
        return text
    try:
        translated = translator.translate(text, dest=target_lang)
        return translated.text
    except:
        return text


@app.route("/set-language", methods=["POST"])
def set_language():
    """Store selected language in session."""
    data = request.get_json() or {}
    lang = data.get("lang", "en")
    if lang in ("en", "hi", "ta"):
        session["lang"] = lang
    return jsonify({"success": True, "lang": session.get("lang", "en")})


@app.route("/get-lang")
def get_lang():
    """Return current session language for JS."""
    return jsonify({"lang": session.get("lang", "en")})


@app.route("/translate-batch", methods=["POST"])
def translate_batch():
    """Translate an array of text strings to the session language."""
    data = request.get_json() or {}
    texts = data.get("texts", [])
    lang = session.get("lang", "en")

    if lang == "en" or not texts:
        return jsonify({"translations": texts})

    translated = []
    for text in texts:
        if text and text.strip():
            translated.append(translate_text(text, lang))
        else:
            translated.append(text)

    return jsonify({"translations": translated})


# =========================================================
#  10. PDF EXPORT (NEW — does NOT modify existing routes)
# =========================================================

@app.route("/export-pdf", methods=["POST"])
def export_pdf():
    """
    Generate and return a PDF of legal advice.
    Expects JSON: { title, answer, what_next, disclaimer }
    """
    data = request.get_json() or {}
    title = data.get("title", "Legal Advice")
    answer = data.get("answer", "")
    what_next = data.get("what_next", [])
    disclaimer = data.get("disclaimer", "")
    law_reference = data.get("law_reference", [])

    # Create PDF in memory
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            topMargin=0.75*inch, bottomMargin=0.75*inch,
                            leftMargin=0.75*inch, rightMargin=0.75*inch)

    styles = getSampleStyleSheet()
    title_style = ParagraphStyle('CustomTitle', parent=styles['Title'],
                                  fontSize=18, spaceAfter=12, textColor=colors.HexColor('#1a365d'))
    heading_style = ParagraphStyle('CustomHeading', parent=styles['Heading2'],
                                    fontSize=14, spaceAfter=8, textColor=colors.HexColor('#2d3748'))
    body_style = ParagraphStyle('CustomBody', parent=styles['Normal'],
                                 fontSize=11, spaceAfter=6, leading=16)
    disclaimer_style = ParagraphStyle('Disclaimer', parent=styles['Normal'],
                                       fontSize=9, textColor=colors.grey, spaceAfter=6,
                                       leading=13, borderColor=colors.grey,
                                       borderWidth=0.5, borderPadding=8)

    elements = []

    # Header
    elements.append(Paragraph("LexGuard AI — Legal Advisor Report", title_style))
    elements.append(Spacer(1, 8))

    # Topic title
    elements.append(Paragraph(f"Topic: {title}", heading_style))
    elements.append(Spacer(1, 6))

    # Key Information
    elements.append(Paragraph("Key Information:", heading_style))
    # Strip HTML tags for PDF
    clean_answer = re_module.sub(r'<[^>]+>', '', answer)
    for line in clean_answer.split('\n'):
        line = line.strip()
        if line:
            elements.append(Paragraph(f"• {line}", body_style))
    elements.append(Spacer(1, 8))

    # Law References
    if law_reference:
        elements.append(Paragraph("Relevant Laws / Acts:", heading_style))
        for law in law_reference:
            name = law.get('name', '')
            section = law.get('section', '')
            desc = law.get('description', '')
            elements.append(Paragraph(f"<b>{name}</b> — {section}", body_style))
            elements.append(Paragraph(f"   {desc}", body_style))
        elements.append(Spacer(1, 8))

    # What Next
    if what_next:
        elements.append(Paragraph("What Can You Do Next?", heading_style))
        for idx, item in enumerate(what_next, 1):
            elements.append(Paragraph(f"{idx}. {item}", body_style))
        elements.append(Spacer(1, 8))

    # Disclaimer
    if disclaimer:
        elements.append(Spacer(1, 12))
        elements.append(Paragraph(disclaimer, disclaimer_style))

    # Footer
    elements.append(Spacer(1, 20))
    elements.append(Paragraph(f"Generated by LexGuard AI on {datetime.now().strftime('%d-%b-%Y %H:%M')}",
                               ParagraphStyle('Footer', parent=styles['Normal'],
                                              fontSize=8, textColor=colors.grey)))

    doc.build(elements)
    buffer.seek(0)

    return send_file(buffer, as_attachment=True,
                     download_name=f"LexGuard_Advice_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf",
                     mimetype='application/pdf')


@app.route("/health")
def health():
    return jsonify(
        {
            "status": "ok",
            "database": get_database_backend(),
            "storage": get_storage_backend(),
        }
    )


if __name__ == "__main__":
    host = os.getenv("FLASK_HOST", "0.0.0.0")
    port = int(os.getenv("PORT", os.getenv("FLASK_PORT", "5000")))
    print(f"LexGuard AI is running on http://{host}:{port}")
    app.run(host=host, port=port, debug=os.getenv("FLASK_DEBUG", "0") == "1")
