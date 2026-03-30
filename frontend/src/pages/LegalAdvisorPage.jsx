import { useState } from "react";
import { Link } from "react-router-dom";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

export default function LegalAdvisorPage({ session }) {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = await apiRequest("/api/legal", {
        method: "POST",
        body: { question }
      });
      setResult(payload);
    } catch (requestError) {
      setError(requestError.message);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setListening(true);
      setError("");
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      setQuestion(transcript);
      setListening(false);
    };

    recognition.onerror = () => {
      setListening(false);
      setError("Voice capture failed. Try typing your question instead.");
    };

    recognition.onend = () => {
      setListening(false);
    };

    recognition.start();
  };

  const handleExport = async () => {
    if (!result?.matched) {
      return;
    }

    try {
      const blob = await apiRequest("/export-pdf", {
        method: "POST",
        body: result,
        responseType: "blob"
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "lexguard-legal-advice.pdf";
      document.body.appendChild(anchor);
      anchor.click();
      document.body.removeChild(anchor);
      URL.revokeObjectURL(url);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Legal advisor"
        title="Ask a legal question in plain language."
        description="The advisor still runs on the Flask backend, but the experience now lives in the Vite frontend so it can scale as a real web product."
        actions={
          <>
            <button className="primary-button" onClick={handleVoiceInput} type="button">
              {listening ? "Listening..." : "Use voice input"}
            </button>
            {session.authenticated && session.user?.role === "user" ? (
              <Link className="ghost-link" to="/user-dashboard">
                Submit a query for lawyer review
              </Link>
            ) : null}
          </>
        }
      />

      <section className="two-column-grid">
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Question</h2>
            <span className="micro-note">Try rent, arrest, defamation, employment, or privacy scenarios.</span>
          </div>
          <label className="field-label" htmlFor="legal-question">
            Describe your situation
          </label>
          <textarea
            className="textarea-field large"
            id="legal-question"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Example: My landlord is asking me to vacate with no written notice. What are my rights?"
            rows={9}
            value={question}
          />
          <div className="button-row">
            <button className="primary-button" disabled={loading || !question.trim()} type="submit">
              {loading ? "Analyzing..." : "Get legal guidance"}
            </button>
            <button
              className="ghost-button"
              onClick={() => {
                setQuestion("");
                setResult(null);
                setError("");
              }}
              type="button"
            >
              Reset
            </button>
          </div>
          {error ? <div className="status-banner status-error">{error}</div> : null}
        </form>

        <section className="section-card">
          <div className="section-heading">
            <h2>Response</h2>
            <span className="micro-note">Structured result from the semantic legal engine.</span>
          </div>

          {!result ? (
            <div className="empty-card">
              Ask a question and the right-side panel will populate with laws, next steps, and export controls.
            </div>
          ) : !result.matched ? (
            <div className="stack-list">
              <div className="status-banner status-info">{result.message}</div>
              {result.available_topics ? <p className="muted-text">Available topics: {result.available_topics}</p> : null}
              {result.disclaimer ? <p className="micro-note">{result.disclaimer}</p> : null}
            </div>
          ) : (
            <div className="stack-list">
              <div className="result-card">
                <div className="section-heading compact">
                  <h3>{result.title}</h3>
                  <button className="secondary-button" onClick={handleExport} type="button">
                    Export PDF
                  </button>
                </div>
                <div className="html-content" dangerouslySetInnerHTML={{ __html: result.answer }} />
              </div>

              {result.law_reference?.length ? (
                <div className="result-card">
                  <h3>Relevant laws</h3>
                  <div className="stack-list dense">
                    {result.law_reference.map((law) => (
                      <div className="law-item" key={`${law.name}-${law.section}`}>
                        <strong>{law.name}</strong>
                        <span>{law.section}</span>
                        <p>{law.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {result.what_next?.length ? (
                <div className="result-card">
                  <h3>What to do next</h3>
                  <ol className="ordered-list">
                    {result.what_next.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              <div className="metrics-strip">
                {result.keyword ? <span className="metric-chip">Match: {result.keyword}</span> : null}
                {result.search_method ? <span className="metric-chip">Engine: {result.search_method}</span> : null}
                {typeof result.confidence === "number" ? (
                  <span className="metric-chip">Confidence: {Math.round(result.confidence * 100)}%</span>
                ) : null}
              </div>

              {result.disclaimer ? <p className="micro-note">{result.disclaimer}</p> : null}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
