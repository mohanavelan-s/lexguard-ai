"""
FAISS Index Builder — Legal Articles
=====================================
Loads legal_articles.json, generates Sentence-BERT embeddings,
builds a FAISS IndexFlatL2 index, and saves to disk.

This script runs ONCE (or when the knowledge base is updated).
The Flask app loads the pre-built index at startup.

Usage:
    python modules/build_index.py

Output:
    modules/data/legal_faiss.index    — FAISS binary index
    modules/data/legal_metadata.json  — Index position → article metadata mapping

Architecture:
    ┌───────────────┐     ┌──────────────┐     ┌────────────────┐
    │ legal_articles│ --> │  SBERT       │ --> │ FAISS Index    │
    │    .json      │     │  Encoder     │     │ (IndexFlatL2)  │
    └───────────────┘     └──────────────┘     └────────────────┘
         14 articles      384-dim vectors       14 vectors stored
"""

import json
import os
import sys
import time
import numpy as np

# ── Configuration ──
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(SCRIPT_DIR, "data")
ARTICLES_PATH = os.path.join(DATA_DIR, "legal_articles.json")
INDEX_PATH = os.path.join(DATA_DIR, "legal_faiss.index")
METADATA_PATH = os.path.join(DATA_DIR, "legal_metadata.json")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"


def main():
    print("=" * 60)
    print("  FAISS Index Builder — LexGuard AI Legal Articles")
    print("=" * 60)

    # ── Step 1: Load articles ──
    print(f"\n[1/4] Loading articles from: {ARTICLES_PATH}")
    if not os.path.exists(ARTICLES_PATH):
        print(f"[ERROR] File not found: {ARTICLES_PATH}")
        sys.exit(1)

    with open(ARTICLES_PATH, "r", encoding="utf-8") as f:
        articles = json.load(f)

    print(f"       Loaded {len(articles)} articles")
    for art in articles:
        print(f"       • {art['article']}: {art['title']} ({len(art['text'].split())} words)")

    # ── Step 2: Load SBERT model ──
    print(f"\n[2/4] Loading SBERT model: {MODEL_NAME}")
    t0 = time.time()

    try:
        from sentence_transformers import SentenceTransformer
    except ImportError:
        print("[ERROR] sentence-transformers not installed.")
        print("        Run: pip install sentence-transformers")
        sys.exit(1)

    model = SentenceTransformer(MODEL_NAME)
    print(f"       Model loaded in {time.time() - t0:.1f}s")
    print(f"       Embedding dimension: {model.get_sentence_embedding_dimension()}")

    # ── Step 3: Generate embeddings ──
    print(f"\n[3/4] Generating embeddings for {len(articles)} articles...")
    t0 = time.time()

    # Combine article + title + category for richer embeddings
    texts = []
    for art in articles:
        # Enrich the text with title and category for better semantic matching
        enriched = f"{art['title']}. {art['category']}. {art['text']}"
        texts.append(enriched)

    embeddings = model.encode(texts, convert_to_numpy=True, show_progress_bar=True)
    print(f"       Generated {embeddings.shape[0]} embeddings of dim {embeddings.shape[1]} in {time.time() - t0:.1f}s")

    # Normalize for consistent distance comparison
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings_normalized = embeddings / norms

    # ── Step 4: Build and save FAISS index ──
    print(f"\n[4/4] Building FAISS index...")

    try:
        import faiss
    except ImportError:
        print("[ERROR] faiss-cpu not installed.")
        print("        Run: pip install faiss-cpu")
        sys.exit(1)

    dimension = embeddings_normalized.shape[1]  # 384 for MiniLM-L6-v2
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings_normalized.astype(np.float32))

    print(f"       Index contains {index.ntotal} vectors of dimension {dimension}")

    # Save index
    os.makedirs(DATA_DIR, exist_ok=True)
    faiss.write_index(index, INDEX_PATH)
    print(f"       Saved index to: {INDEX_PATH}")

    # Save metadata (maps index position → article info)
    metadata = []
    for i, art in enumerate(articles):
        metadata.append({
            "index": i,
            "article": art["article"],
            "title": art["title"],
            "category": art["category"],
            "text": art["text"]
        })

    with open(METADATA_PATH, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2, ensure_ascii=False)
    print(f"       Saved metadata to: {METADATA_PATH}")

    # ── Verification ──
    print("\n" + "=" * 60)
    print("  Verification — Test Queries")
    print("=" * 60)

    test_queries = [
        "What are my rights if I am arrested?",
        "Can my landlord evict me without notice?",
        "right to education for children",
        "freedom of speech limitations",
        "what is quantum physics",  # Should NOT match
    ]

    for query in test_queries:
        query_emb = model.encode([query], convert_to_numpy=True)
        query_norm = query_emb / np.linalg.norm(query_emb, axis=1, keepdims=True)
        distances, indices = index.search(query_norm.astype(np.float32), k=3)

        print(f"\n  Query: \"{query}\"")
        for j in range(3):
            idx = indices[0][j]
            dist = distances[0][j]
            art = metadata[idx]
            confidence = "MATCH" if dist < 1.0 else "WEAK" if dist < 1.5 else "NO MATCH"
            print(f"    [{confidence}] dist={dist:.4f} -> {art['article']}: {art['title']}")

    print("\n" + "=" * 60)
    print("  BUILD COMPLETE")
    print("=" * 60)


if __name__ == "__main__":
    main()
