import { useCallback, useEffect, useId, useRef } from "react";
import ContactMessageForm from "./ContactMessageForm.jsx";

function IconChat() {
  return (
    <svg
      className="contact-panel-head-icon"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
    </svg>
  );
}

/**
 * Bottom-right FAB (chat) with anchored card above the button — no scroll lock, no blocking backdrop.
 * @param {{ open: boolean; onOpen: () => void; onClose: () => void }} props
 */
export default function ContactChatPanel({ open, onOpen, onClose }) {
  const titleId = useId();
  const closeRef = useRef(null);

  const onKey = useCallback(
    (e) => {
      if (e.key === "Escape" && open) onClose();
    },
    [open, onClose]
  );

  useEffect(() => {
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onKey]);

  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open]);

  function toggle() {
    if (open) onClose();
    else onOpen();
  }

  return (
    <div className="contact-shelf">
      {open && (
        <div
          id="edura-contact-dialog"
          className="contact-panel contact-panel--anchor"
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
        >
          <div className="contact-panel__accent" aria-hidden />
          <div className="contact-panel__head">
            <div className="contact-panel__head-main">
              <span className="contact-panel__avatar" aria-hidden>
                <IconChat />
              </span>
              <div>
                <h2 id={titleId} className="contact-panel__title">
                  Contact us
                </h2>
                <p className="contact-panel__sub">We read every message and reply when we can.</p>
              </div>
            </div>
            <button
              type="button"
              className="contact-panel__close"
              ref={closeRef}
              onClick={onClose}
              aria-label="Close contact panel"
            >
              <span aria-hidden>×</span>
            </button>
          </div>
          <div className="contact-panel__body">
            <ContactMessageForm
              idPrefix="contact-panel"
              formClassName="contact-form contact-form--panel contact-form--floating"
              submitLabel="Send"
              submitClassName="btn btn-primary contact-submit"
              textareaRows={5}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        className="contact-fab"
        onClick={toggle}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? "Close contact chat" : "Open contact chat"}
        title={open ? "Close chat" : "Contact us"}
      >
        {open ? (
          <span className="contact-fab__icon" aria-hidden>
            ×
          </span>
        ) : (
          <span className="contact-fab__icon-graphic" aria-hidden>
            <IconChat />
          </span>
        )}
      </button>
    </div>
  );
}
