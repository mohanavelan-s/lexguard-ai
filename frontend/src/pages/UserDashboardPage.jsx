import { useEffect, useState } from "react";

import SectionHero from "../components/SectionHero";
import { apiRequest } from "../lib/api";

function formatDate(value) {
  if (!value) {
    return "Just now";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default function UserDashboardPage({ session }) {
  const [question, setQuestion] = useState("");
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadReviews = async () => {
    setLoading(true);

    try {
      const payload = await apiRequest("/api/user-reviews");
      setReviews(payload.reviews || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = await apiRequest("/api/review-advice", {
        method: "POST",
        body: { question }
      });
      setQuestion("");
      setSuccess(payload.message || "Submitted for lawyer review.");
      await loadReviews();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="User dashboard"
        title={`Track reviewed legal answers, ${session.user?.name || "user"}.`}
        description="This reviewer flow now works as a real app experience instead of full-page form refreshes, which makes it much easier to host and evolve."
      />

      <section className="two-column-grid">
        <form className="section-card" onSubmit={handleSubmit}>
          <div className="section-heading">
            <h2>Submit a question</h2>
            <span className="micro-note">Your question will be answered by AI first and then queued for legal review.</span>
          </div>
          <textarea
            className="textarea-field large"
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Explain your situation, what happened, and what answer you need."
            rows={8}
            value={question}
          />
          <div className="button-row">
            <button className="primary-button" disabled={submitting || !question.trim()} type="submit">
              {submitting ? "Submitting..." : "Submit for review"}
            </button>
          </div>
          {success ? <div className="status-banner status-success">{success}</div> : null}
          {error ? <div className="status-banner status-error">{error}</div> : null}
        </form>

        <section className="section-card">
          <div className="section-heading">
            <h2>Your queue</h2>
            <span className="micro-note">{loading ? "Refreshing..." : `${reviews.length} submissions on record.`}</span>
          </div>

          {!reviews.length && !loading ? (
            <div className="empty-card">No submitted queries yet. Use the form to add your first one.</div>
          ) : (
            <div className="stack-list dense">
              {reviews.map((review) => (
                <article className="review-card" key={review.id}>
                  <div className="section-heading compact">
                    <h3>{review.question}</h3>
                    <span className={`badge badge-${review.status === "approved" ? "approved" : "pending"}`}>
                      {review.status}
                    </span>
                  </div>
                  <p className="micro-note">{formatDate(review.created_at)}</p>
                  {review.status === "approved" ? (
                    <>
                      <div className="html-content" dangerouslySetInnerHTML={{ __html: review.final_response }} />
                      {review.lawyer_notes ? (
                        <div className="detail-block">
                          <span className="detail-label">Lawyer notes</span>
                          <p>{review.lawyer_notes}</p>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="status-banner status-info">Your question is waiting for lawyer approval.</div>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
