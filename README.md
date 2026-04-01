# LexGuard AI

LexGuard AI is a 36-hour hackathon project focused on legal awareness, safety tooling, and lightweight access to Indian legal information.

## What it includes

- Document scanner with risk detection
- Legal advisor with semantic article matching
- Past case lookup
- Lawyer connect workflow
- Protect Me emergency workflow
- Android WebView companion app

## Local setup

```bash
python -m pip install -r requirements.txt
cd frontend
npm install
cd ..
python app.py
```

Open [http://127.0.0.1:5000](http://127.0.0.1:5000).

If you want the heavier semantic-search stack locally, install the optional ML extras too:

```bash
python -m pip install -r requirements-ml.txt
```

For frontend development with hot reload, run the backend and Vite side by side:

```bash
python app.py
cd frontend
npm run dev
```

Vite will proxy API calls to `http://127.0.0.1:5000`.

For a production-style local run, build the frontend once and let Flask serve the compiled assets:

```bash
cd frontend
npm run build
cd ..
python app.py
```

The app now auto-creates its main database and auto-seeds the case dataset on first start. If you want to force-refresh the landmark cases table, run:

```bash
python seed_cases_db.py
```

## Cloud deployment target

This repo is adjusted for:

- Railway for the Flask web app and built Vite frontend assets
- Supabase Postgres for the primary database
- Railway volume storage for uploaded files and any local fallback data

### Railway

- `Dockerfile` now builds the Vite frontend and bundles it with the Flask app for a single Railway service
- `railway.json` configures Railway deployment behavior, health checks, and watched paths
- `/health` is available for health checks
- The default Railway image intentionally skips the optional SBERT/FAISS packages so deploys stay small and fast
- Set `SESSION_COOKIE_SECURE=1` in hosted environments
- If you attach a Railway volume, mount it somewhere like `/app/data` and set:
  - `LEXGUARD_DATA_DIR=/app/data`
  - `LEXGUARD_UPLOAD_DIR=/app/data/uploads`

Recommended Railway service variables:

- `FLASK_SECRET_KEY`
- `DATABASE_URL`
- `SESSION_COOKIE_SECURE=1`
- `SESSION_COOKIE_SAMESITE=Lax`
- `LEXGUARD_DATA_DIR=/app/data`
- `LEXGUARD_UPLOAD_DIR=/app/data/uploads`
- `RESEND_API_KEY`, `TWILIO_SID`, `TWILIO_AUTH`, `TWILIO_PHONE`, `MY_PHONE` as needed
- For case lookup emails, also set:
  - `RESEND_FROM_EMAIL` to a verified Resend sender such as `LexGuard AI <alerts@your-domain.com>`
  - `RESEND_REPLY_TO` if you want replies routed to a support inbox

### Supabase Postgres

Set `DATABASE_URL` to your Supabase Postgres connection string. The backend will automatically switch from local SQLite to Postgres when that variable is present.

For Railway, the safest default is the Supabase Session pooler string rather than the direct connection string:

- Use the direct connection string if your environment supports IPv6
- Use the Supabase Session pooler for persistent application traffic when you want IPv4 and IPv6 support
- Avoid the Transaction pooler for this Flask service because it is meant for short-lived serverless traffic

### Railway deploy flow

1. Push this repository to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Railway will detect `Dockerfile` and build a single service containing both the Vite frontend and Flask backend.
4. Add the environment variables listed above.
5. Attach a volume if you want persistent uploads or SQLite fallback storage.
6. Deploy and confirm `/health` returns `200`.

### Environment variables

Create a `.env` file from `.env.example` and set:

- `FLASK_SECRET_KEY`
- `DATABASE_URL` for Supabase or any hosted Postgres database
- `LEXGUARD_DATA_DIR` and `LEXGUARD_UPLOAD_DIR` if you want uploads on a mounted volume
- `SESSION_COOKIE_SECURE=1` in production
- `RESEND_API_KEY` for case email notifications
- `RESEND_FROM_EMAIL` for a verified Resend sender address
- `RESEND_REPLY_TO` if case emails should reply to a support inbox
- `TWILIO_SID`, `TWILIO_AUTH`, `TWILIO_PHONE`, `MY_PHONE` for SOS SMS

## Android app

The Android app no longer needs a hardcoded server URL edit.

- Emulator default: `http://10.0.2.2:5000`
- Production build: pass your deployed backend URL with either:
  - `-PlexguardServerUrl=https://your-app.up.railway.app`
  - `LEXGUARD_SERVER_URL=https://your-app.up.railway.app`

Example:

```bash
cd android
./gradlew assembleRelease -PlexguardServerUrl=https://your-app.up.railway.app
```

## Notes

- Semantic legal search is optional in cloud deploys. The default web image falls back to keyword matching unless you install `requirements-ml.txt` in a custom environment.
- The app uses local SQLite automatically when `DATABASE_URL` is not set and falls back to in-memory SQLite if local disk writes are unavailable
- Uploaded files now live in the configured upload directory instead of an assumed repo-local folder
- Flask serves the built SPA automatically when `frontend/dist/index.html` exists; otherwise it falls back to the legacy templates
- In the current local Python environment, `googletrans` and FAISS may log compatibility warnings; the app now degrades gracefully instead of crashing when those optional pieces are unavailable

## Disclaimer

This project is for educational and informational purposes only and does not constitute legal advice.
