import { useState } from "react";
import { fetchJson } from "../api.js";

/**
 * @param {{
 *  idPrefix: string;
 *  formClassName?: string;
 *  onSuccess?: () => void;
 *  submitLabel?: string;
 *  submitClassName?: string;
 *  textareaRows?: number;
 * }} props
 */
export default function ContactMessageForm({
  idPrefix,
  formClassName = "contact-form",
  onSuccess,
  submitLabel = "Send message",
  submitClassName = "btn btn-primary btn-lg contact-submit",
  textareaRows = 6,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fid = (s) => `${idPrefix}-${s}`;

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    setSubmitting(true);
    try {
      const res = await fetchJson("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
      });
      setStatus({ type: "success", text: res.message || "Message sent." });
      setName("");
      setEmail("");
      setMessage("");
      onSuccess?.();
    } catch (err) {
      setStatus({
        type: "error",
        text: err.message || "Something went wrong. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={formClassName} onSubmit={handleSubmit} noValidate>
      <label className="contact-field" htmlFor={fid("name")}>
        <span className="contact-label">Name</span>
        <input
          id={fid("name")}
          type="text"
          name="name"
          autoComplete="name"
          required
          maxLength={120}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </label>
      <label className="contact-field" htmlFor={fid("email")}>
        <span className="contact-label">Email</span>
        <input
          id={fid("email")}
          type="email"
          name="email"
          autoComplete="email"
          required
          maxLength={254}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </label>
      <label className="contact-field" htmlFor={fid("message")}>
        <span className="contact-label">Message</span>
        <textarea
          id={fid("message")}
          name="message"
          required
          rows={textareaRows}
          minLength={10}
          maxLength={8000}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="How can we help?"
        />
      </label>

      {status?.type === "success" && (
        <div className="banner banner-success" role="status">
          {status.text}
        </div>
      )}
      {status?.type === "error" && (
        <div className="banner banner-error" role="alert">
          {status.text}
        </div>
      )}

      <button
        type="submit"
        className={submitClassName}
        disabled={submitting}
      >
        {submitting ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}
