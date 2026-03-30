"""
Legal Advisor Module — Semantic Retrieval (SBERT + FAISS)
=========================================================

UPGRADED from keyword-based matching to semantic similarity search.

Architecture:
    ┌─────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
    │ User Query  │ --> │  SBERT       │ --> │ FAISS Search │ --> │ Structured   │
    │ (text)      │     │  Encoder     │     │ (top-3 L2)   │     │ Response     │
    └─────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
                        384-dim vector         distance < θ          Same JSON
                        ~80ms encode           ~1ms search            contract

Key Design Decisions:
    1. Model loaded ONCE at module import (singleton pattern)
    2. FAISS index loaded ONCE at module import
    3. Distance threshold (1.0) controls match/no-match boundary
    4. Response JSON contract is IDENTICAL to the keyword-based version
    5. LEGAL_KB is PRESERVED as the authoritative response data source
    6. Semantic search determines WHICH topic matches, then LEGAL_KB provides the response

Dependencies:
    pip install sentence-transformers faiss-cpu numpy
"""

import os
import re
import json
import time
import logging
import numpy as np

logger = logging.getLogger(__name__)

# =========================================================
#  CONFIGURATION
# =========================================================

MODULE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(MODULE_DIR, "data")
INDEX_PATH = os.path.join(DATA_DIR, "legal_faiss.index")
METADATA_PATH = os.path.join(DATA_DIR, "legal_metadata.json")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

# Distance threshold for match confidence (L2 distance on normalized vectors)
# Lower = stricter matching. Tuned empirically:
#   Legal queries:     0.40 - 1.33  (should match)
#   Non-legal queries: 1.70+        (should reject)
#   Threshold at 1.4 gives 0.37 margin above legal, 0.30 below noise
MATCH_THRESHOLD = 1.4


# =========================================================
#  LEGAL KNOWLEDGE BASE (Preserved — used for response formatting)
#  The SBERT+FAISS search determines the CATEGORY, then we map
#  back to LEGAL_KB for structured response data.
# =========================================================

LEGAL_KB = {
    "rent": {
        "title": "Rental Agreement & Tenant Rights",
        "keywords": ["rent", "tenant", "landlord", "eviction", "lease"],
        "points": [
            "Tenants have the right to peaceful possession of the property.",
            "Landlords cannot evict tenants without due legal process.",
            "Security deposit must be returned after valid deductions.",
            "Eviction must follow proper notice as per agreement or law."
        ],
        "laws": [
            {"name": "Transfer of Property Act, 1882", "section": "Section 105", "description": "Defines lease of immovable property."},
            {"name": "Constitution of India", "section": "Article 300A", "description": "Protects against unlawful deprivation of property."}
        ],
        "what_next": [
            "Review your rental agreement terms.",
            "Request written notice from landlord.",
            "Challenge illegal eviction in civil court."
        ]
    },

    "employment": {
        "title": "Employment Rights & Labor Laws",
        "keywords": ["job", "employment", "salary", "fired", "termination", "labor"],
        "points": [
            "Employees are entitled to minimum wages.",
            "Termination must follow due process.",
            "Unlawful dismissal can be legally challenged.",
            "Equality in public employment is guaranteed."
        ],
        "laws": [
            {"name": "Industrial Disputes Act, 1947", "section": "Section 25F", "description": "Requires notice before termination."},
            {"name": "Constitution of India", "section": "Article 16", "description": "Equality in public employment."}
        ],
        "what_next": [
            "Review employment contract.",
            "Approach labor commissioner.",
            "File complaint before labor court."
        ]
    },

    "defamation": {
        "title": "Defamation & Reputation Rights",
        "keywords": [
            "defame", "defamation", "slander",
            "false accusation", "false allegations",
            "false rumor", "false rumors",
            "rumor", "rumors",
            "spread rumor", "spread rumors",
            "reputation", "character assassination",
            "online defamation"
        ],
        "points": [
            "Defamation involves false statements harming reputation.",
            "Can be civil or criminal.",
            "Freedom of speech has reasonable restrictions.",
            "Truth is a valid defense."
        ],
        "laws": [
            {"name": "Indian Penal Code, 1860", "section": "Section 499", "description": "Defines defamation."},
            {"name": "Constitution of India", "section": "Article 19", "description": "Freedom of speech restrictions."}
        ],
        "what_next": [
            "Send legal notice demanding retraction.",
            "File civil suit for damages.",
            "File criminal complaint if necessary."
        ]
    },

    "police": {
        "title": "Rights During Arrest & Police Action",
        "keywords": ["police", "arrest", "custody", "detained", "fir"],
        "points": [
            "Right to be informed of grounds of arrest.",
            "Right to consult a lawyer.",
            "Must be produced before magistrate within 24 hours.",
            "No forced confession allowed."
        ],
        "laws": [
            {"name": "Constitution of India", "section": "Article 20", "description": "Protection in criminal cases."},
            {"name": "Constitution of India", "section": "Article 21", "description": "Right to life and liberty."},
            {"name": "Constitution of India", "section": "Article 22", "description": "Protection against arrest."}
        ],
        "what_next": [
            "Demand legal representation.",
            "Ensure production before magistrate.",
            "Challenge illegal detention in court."
        ]
    }
}


# =========================================================
#  CATEGORY MAPPING: Article categories → LEGAL_KB keys
#  Maps FAISS search results back to the structured KB
# =========================================================

CATEGORY_TO_KB = {
    "Right to Equality": "employment",       # Art 14-18
    "Right to Freedom": "defamation",        # Art 19-20
    "Personal Liberty": "police",            # Art 21-22
    "Right Against Exploitation": "employment",  # Art 23-24
    "Constitutional Remedies": "police",     # Art 32
    "Directive Principles": "police",        # Art 39A
    "Property Rights": "rent",               # Art 300A
    "Employment Law": "employment",          # Industrial Disputes Act
    "Defamation Law": "defamation",          # IPC Section 499
    "Criminal Law": "police",               # CrPC Section 41
}


# =========================================================
#  MODEL & INDEX LOADING (Singleton — loaded once at import)
# =========================================================

_sbert_model = None
_faiss_index = None
_metadata = None
_model_load_error = None


def _load_model_and_index():
    """Load SBERT model and FAISS index. Called once at module import."""
    global _sbert_model, _faiss_index, _metadata, _model_load_error

    try:
        t0 = time.time()

        # Load SBERT model
        from sentence_transformers import SentenceTransformer
        _sbert_model = SentenceTransformer(MODEL_NAME)
        logger.info(f"[LEGAL-ADVISOR] SBERT model loaded in {time.time() - t0:.1f}s")

        # Load FAISS index
        import faiss
        if os.path.exists(INDEX_PATH):
            _faiss_index = faiss.read_index(INDEX_PATH)
            logger.info(f"[LEGAL-ADVISOR] FAISS index loaded: {_faiss_index.ntotal} vectors")
        else:
            logger.warning(f"[LEGAL-ADVISOR] FAISS index not found at {INDEX_PATH}")
            logger.warning(f"[LEGAL-ADVISOR] Run: python modules/build_index.py")

        # Load metadata
        if os.path.exists(METADATA_PATH):
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
            logger.info(f"[LEGAL-ADVISOR] Metadata loaded: {len(_metadata)} entries")
        else:
            logger.warning(f"[LEGAL-ADVISOR] Metadata not found at {METADATA_PATH}")

    except ImportError as e:
        _model_load_error = str(e)
        logger.error(f"[LEGAL-ADVISOR] Failed to load ML dependencies: {e}")
        logger.error("[LEGAL-ADVISOR] Run: pip install sentence-transformers faiss-cpu")
    except Exception as e:
        _model_load_error = str(e)
        logger.error(f"[LEGAL-ADVISOR] Failed to initialize: {e}")


# Trigger loading at module import
print("[LEGAL-ADVISOR] Initializing Sentence-BERT + FAISS semantic engine...")
_load_model_and_index()
if _model_load_error:
    print(f"[LEGAL-ADVISOR] [WARNING] ML engine failed: {_model_load_error}")
    print("[LEGAL-ADVISOR] Falling back to keyword matching.")
else:
    print("[LEGAL-ADVISOR] [OK] Semantic engine ready.")


# =========================================================
#  SEMANTIC SEARCH
# =========================================================

def _semantic_search(query: str, top_k: int = 3):
    """
    Encode query with SBERT, search FAISS index, return top-k matches.

    Returns:
        list of (metadata_entry, distance) tuples, sorted by distance (ascending)
        Empty list if search fails.
    """
    if _sbert_model is None or _faiss_index is None or _metadata is None:
        return []

    try:
        # Encode query
        query_embedding = _sbert_model.encode([query], convert_to_numpy=True)

        # Normalize (same as index vectors)
        norm = np.linalg.norm(query_embedding, axis=1, keepdims=True)
        query_normalized = query_embedding / norm

        # FAISS search
        distances, indices = _faiss_index.search(
            query_normalized.astype(np.float32), top_k
        )

        results = []
        for i in range(top_k):
            idx = indices[0][i]
            dist = distances[0][i]
            if 0 <= idx < len(_metadata):
                results.append((_metadata[idx], float(dist)))

        return results

    except Exception as e:
        logger.error(f"[LEGAL-ADVISOR] Semantic search failed: {e}")
        return []


# =========================================================
#  KEYWORD-BASED FALLBACK (Preserved for graceful degradation)
# =========================================================

SYNONYM_MAP = {
    "renting": "rent", "rental": "rent", "tenancy": "tenant",
    "renter": "tenant", "lessee": "tenant", "lessor": "landlord",
    "kicked out": "eviction", "thrown out": "eviction", "vacate": "eviction",
    "deposit": "rent", "paying guest": "tenant", "pg": "tenant",
    "work": "job", "working": "job", "employer": "employment",
    "employee": "employment", "wages": "salary", "pay": "salary",
    "sacked": "fired", "dismissed": "fired", "laid off": "fired",
    "retrenchment": "termination", "notice period": "termination",
    "workplace": "employment", "office": "employment",
    "defaming": "defame", "slandered": "slander", "libel": "defamation",
    "character assassination": "defamation", "false statement": "false accusation",
    "trolling": "defamation", "spreading lies": "false accusation",
    "fake news": "false accusation", "honour": "reputation", "honor": "reputation",
    "cop": "police", "cops": "police", "constable": "police",
    "arrested": "arrest", "arresting": "arrest", "jail": "custody",
    "lockup": "custody", "detained": "detained", "detain": "detained",
    "complaint": "fir", "first information report": "fir",
}


def _keyword_fallback(question: str):
    """Original keyword matching — used when SBERT/FAISS unavailable."""
    question_lower = question.lower().strip()
    expanded = question_lower
    for synonym, canonical in SYNONYM_MAP.items():
        if synonym in question_lower:
            expanded += " " + canonical

    for key, data in LEGAL_KB.items():
        for word in data["keywords"]:
            if word in expanded:
                return data, word
    return None, None


# =========================================================
#  MAIN API FUNCTION (Same signature, same JSON contract)
# =========================================================

def legal_advice(question):
    """
    Match a user question to legal information using semantic retrieval.

    Falls back to keyword matching if SBERT/FAISS is unavailable.

    Returns the SAME API contract as before:
        success, matched, title, answer, law_reference, what_next, disclaimer, keyword
    """

    # ── Handle empty input ──
    if not question or not question.strip():
        return {
            "success": True,
            "matched": False,
            "message": "Please enter a question to get legal information.",
            "available_topics": ", ".join(sorted(set(d["title"] for d in LEGAL_KB.values()))),
            "disclaimer": "For specific legal advice, please consult a licensed lawyer."
        }

    # ── Try semantic search first ──
    if _sbert_model is not None and _faiss_index is not None:
        t0 = time.time()
        results = _semantic_search(question.strip(), top_k=3)
        search_time = time.time() - t0

        if results:
            best_match, best_distance = results[0]

            logger.info(
                f"[LEGAL-ADVISOR] Semantic search: query='{question[:50]}...' "
                f"best_match='{best_match['article']}' dist={best_distance:.4f} "
                f"time={search_time*1000:.0f}ms"
            )

            # ── Check confidence threshold ──
            if best_distance <= MATCH_THRESHOLD:
                # Map article category → LEGAL_KB key
                category = best_match.get("category", "")
                kb_key = CATEGORY_TO_KB.get(category)
                kb_entry = LEGAL_KB.get(kb_key) if kb_key else None

                if kb_entry:
                    # ── BUILD RESPONSE FROM LEGAL_KB (preserves original format) ──
                    answer_html = "<ul class='legal-points'>"
                    for point in kb_entry['points']:
                        point_html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', point)
                        answer_html += f"<li>{point_html}</li>"
                    answer_html += "</ul>"

                    # Append the matched constitutional article text
                    answer_html += f"<div class='article-reference' style='margin-top:12px; padding:12px; background:rgba(74,144,226,0.08); border-left:3px solid #4a90d9; border-radius:4px;'>"
                    answer_html += f"<strong>{best_match['article']}: {best_match['title']}</strong><br>"
                    answer_html += f"<p style='margin-top:6px; font-size:0.9em; color:#e2e8f0;'>{best_match['text']}</p>"
                    answer_html += "</div>"

                    # Build law references (combine KB laws + matched article)
                    law_refs = list(kb_entry['laws'])
                    law_refs.append({
                        "name": "Constitution of India",
                        "section": best_match["article"],
                        "description": best_match["title"]
                    })
                    # Deduplicate by section
                    seen_sections = set()
                    unique_laws = []
                    for law in law_refs:
                        if law["section"] not in seen_sections:
                            seen_sections.add(law["section"])
                            unique_laws.append(law)

                    return {
                        "success": True,
                        "matched": True,
                        "title": kb_entry['title'],
                        "answer": answer_html,
                        "law_reference": unique_laws,
                        "what_next": kb_entry.get('what_next', []),
                        "disclaimer": "DISCLAIMER: This information is for educational purposes only and does not constitute legal advice. Consult a licensed lawyer for your specific situation.",
                        "keyword": f"semantic:{best_match['article']} (dist={best_distance:.3f})",
                        "search_method": "sbert_faiss",
                        "confidence": round(1.0 - (best_distance / MATCH_THRESHOLD), 3),
                        "top_matches": [
                            {
                                "article": r[0]["article"],
                                "title": r[0]["title"],
                                "distance": round(r[1], 4)
                            }
                            for r in results[:3]
                        ]
                    }
                else:
                    # Category matched but no KB mapping — return article directly
                    answer_html = f"<div class='article-reference' style='padding:12px; background:rgba(74,144,226,0.08); border-left:3px solid #4a90d9; border-radius:4px;'>"
                    answer_html += f"<strong>{best_match['article']}: {best_match['title']}</strong><br>"
                    answer_html += f"<p style='margin-top:6px;'>{best_match['text']}</p>"
                    answer_html += "</div>"

                    return {
                        "success": True,
                        "matched": True,
                        "title": best_match["title"],
                        "answer": answer_html,
                        "law_reference": [{
                            "name": "Constitution of India",
                            "section": best_match["article"],
                            "description": best_match["title"]
                        }],
                        "what_next": [
                            "Consult a qualified lawyer for specific advice.",
                            "File a petition under Article 32 if fundamental rights are violated.",
                            "Approach the nearest Legal Services Authority for free legal aid."
                        ],
                        "disclaimer": "DISCLAIMER: This information is for educational purposes only and does not constitute legal advice. Consult a licensed lawyer for your specific situation.",
                        "keyword": f"semantic:{best_match['article']} (dist={best_distance:.3f})",
                        "search_method": "sbert_faiss",
                        "confidence": round(1.0 - (best_distance / MATCH_THRESHOLD), 3)
                    }

            else:
                # Below confidence threshold — no reliable match
                logger.info(
                    f"[LEGAL-ADVISOR] Below threshold: dist={best_distance:.4f} > {MATCH_THRESHOLD}"
                )
                available_topics = ", ".join(sorted(set(d['title'] for d in LEGAL_KB.values())))
                return {
                    "success": True,
                    "matched": False,
                    "message": "The topic you're asking about is not sufficiently covered in our knowledge base.",
                    "available_topics": available_topics,
                    "disclaimer": "For specific legal advice, please consult a licensed lawyer.",
                    "search_method": "sbert_faiss",
                    "nearest_distance": round(best_distance, 4)
                }

    # ── Fallback to keyword matching if SBERT/FAISS unavailable ──
    logger.info("[LEGAL-ADVISOR] Using keyword fallback (SBERT unavailable)")
    matched_topic, matched_keyword = _keyword_fallback(question)

    if matched_topic:
        answer_html = "<ul class='legal-points'>"
        for point in matched_topic['points']:
            point_html = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', point)
            answer_html += f"<li>{point_html}</li>"
        answer_html += "</ul>"

        return {
            "success": True,
            "matched": True,
            "title": matched_topic['title'],
            "answer": answer_html,
            "law_reference": matched_topic['laws'],
            "what_next": matched_topic.get('what_next', []),
            "disclaimer": "DISCLAIMER: This information is for educational purposes only and does not constitute legal advice. Consult a licensed lawyer for your specific situation.",
            "keyword": matched_keyword,
            "search_method": "keyword_fallback"
        }
    else:
        available_topics = ", ".join(sorted(set(d['title'] for d in LEGAL_KB.values())))
        return {
            "success": True,
            "matched": False,
            "message": "The topic you're asking about is not currently in our knowledge base.",
            "available_topics": available_topics,
            "disclaimer": "For specific legal advice, please consult a licensed lawyer.",
            "search_method": "keyword_fallback"
        }
