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

export default function LawyerDashboardPage({ session }) {
  const [pending, setPending] = useState([]);
  const [approved, setApproved] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadQueue = async () => {
    setLoading(true);

    try {
      const payload = await apiRequest("/api/review-queue");
      setPending(payload.pending || []);
      setApproved(payload.approved || []);
      setError("");
    } catch (requestError) {
      setError(requestError.message);
      setPending([]);
      setApproved([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueue();
  }, []);

  const handleChange = (reviewId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [reviewId]: {
        final_response: current[reviewId]?.final_response ?? "",
        lawyer_notes: current[reviewId]?.lawyer_notes ?? "",
        [field]: value
      }
    }));
  };

  const handleApprove = async (review) => {
    try {
      const draft = drafts[review.id] || {};
      const payload = {
        review_id: review.id,
        final_response: draft.final_response || review.ai_response,
        lawyer_notes: draft.lawyer_notes || ""
      };
      await apiRequest("/api/approve-advice", {
        method: "POST",
        body: payload
      });
      setSuccess("Review approved and published.");
      await loadQueue();
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <div className="page-stack">
      <SectionHero
        eyebrow="Lawyer dashboard"
        title={`Review AI answers with final human sign-off, ${session.user?.name || "counsel"}.`}
        description="This page now behaves like a reviewer console instead of a server-rendered form board, which is a much better fit for cloud deployment."
      />

      {success ? <div className="status-banner status-success">{success}</div> : null}
      {error ? <div className="status-banner status-error">{error}</div> : null}

      <section className="section-card">
        <div className="section-heading">
          <h2>Pending reviews</h2>
          <span className="micro-note">{loading ? "Refreshing..." : `${pending.length} items waiting.`}</span>
        </div>

        {!pending.length && !loading ? (
          <div className="empty-card">No pending reviews right now.</div>
        ) : (
          <div className="stack-list dense">
            {pending.map((review) => {
              const draft = drafts[review.id] || {};
              return (
                <article className="review-card" key={review.id}>
                  <div className="section-heading compact">
                    <h3>{review.user_name}</h3>
                    <span className="badge badge-pending">Pending</span>
                  </div>
                  <p className="micro-note">
                    {review.user_email} • {formatDate(review.created_at)}
                  </p>
                  <div className="detail-block">
                    <span className="detail-label">Question</span>
                    <p>{review.question}</p>
                  </div>
                  <div className="detail-block">
                    <span className="detail-label">AI response</span>
                    <div className="html-content" dangerouslySetInnerHTML={{ __html: review.ai_response }} />
                  </div>
                  <label className="field-block">
                    <span>Final response</span>
                    <textarea
                      className="textarea-field"
                      onChange={(event) => handleChange(review.id, "final_response", event.target.value)}
                      rows={6}
                      value={draft.final_response ?? review.ai_response}
                    />
                  </label>
                  <label className="field-block">
                    <span>Lawyer notes</span>
                    <textarea
                      className="textarea-field"
                      onChange={(event) => handleChange(review.id, "lawyer_notes", event.target.value)}
                      rows={3}
                      value={draft.lawyer_notes ?? ""}
                    />
                  </label>
                  <button className="primary-button" onClick={() => handleApprove(review)} type="button">
                    Approve advice
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="section-card">
        <div className="section-heading">
          <h2>Approved reviews</h2>
          <span className="micro-note">{approved.length} published answers.</span>
        </div>

        {!approved.length ? (
          <div className="empty-card">No approved reviews yet.</div>
        ) : (
          <div className="stack-list dense">
            {approved.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="section-heading compact">
                  <h3>{review.user_name}</h3>
                  <span className="badge badge-approved">Approved</span>
                </div>
                <p className="micro-note">{formatDate(review.created_at)}</p>
                <div className="detail-block">
                  <span className="detail-label">Question</span>
                  <p>{review.question}</p>
                </div>
                <div className="html-content" dangerouslySetInnerHTML={{ __html: review.final_response }} />
                {review.lawyer_notes ? (
                  <div className="detail-block">
                    <span className="detail-label">Notes</span>
                    <p>{review.lawyer_notes}</p>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
