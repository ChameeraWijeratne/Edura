import { resolveInternshipPosting } from "../lib/externalLinks.js";

function sourceBadgeClass(sourceType) {
  const t = String(sourceType || "").toLowerCase();
  if (t.includes("linkedin")) return "intern-post__chip intern-post__chip--linkedin";
  if (t.includes("indeed")) return "intern-post__chip intern-post__chip--indeed";
  if (t.includes("university") || t.includes("portal"))
    return "intern-post__chip intern-post__chip--uni";
  if (t.includes("company") || t.includes("website"))
    return "intern-post__chip intern-post__chip--web";
  return "intern-post__chip intern-post__chip--other";
}

function IconBriefcase() {
  return (
    <svg
      className="intern-post__avatar-icon"
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M10 2h4a2 2 0 012 2v2h3a2 2 0 012 2v11a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h3V4a2 2 0 012-2zm0 2v2h4V4h-4zM5 8v11h14V8H5z" />
    </svg>
  );
}

function IconPin({ className }) {
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 21s7-4.35 7-11a7 7 0 10-14 0c0 6.65 7 11 7 11z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" fill="currentColor" />
    </svg>
  );
}

export default function InternshipCard({ internship: i }) {
  const { href, ctaKind } = resolveInternshipPosting(i);

  return (
    <article className="intern-post">
      <div className="intern-post__accent" aria-hidden />
      <div className="intern-post__glow" aria-hidden />
      <header className="intern-post__header">
        <div className="intern-post__brand">
          <span
            className="intern-post__avatar"
            role="img"
            aria-hidden
          >
            <IconBriefcase />
          </span>
          <div className="intern-post__brand-text">
            <h3 className="intern-post__title">{i.title}</h3>
            <p className="intern-post__org">{i.organization}</p>
          </div>
        </div>
      </header>

      <div className="intern-post__chips">
        {i.workMode ? (
          <span className="intern-post__chip intern-post__chip--mode">{i.workMode}</span>
        ) : null}
        {i.location ? (
          <span className="intern-post__chip intern-post__chip--place">
            <IconPin className="intern-post__chip-icon" />
            {i.location}
          </span>
        ) : null}
        {i.sourceType ? (
          <span className={sourceBadgeClass(i.sourceType)} title={i.sourceNote || undefined}>
            {i.sourceType}
          </span>
        ) : null}
      </div>

      <p className="intern-post__desc">{i.description}</p>

      {i.sourceNote ? (
        <div className="intern-post__insight">
          <p className="intern-post__insight-label">Source note</p>
          <p className="intern-post__insight-text">{i.sourceNote}</p>
        </div>
      ) : null}

      <div className="intern-post__metrics">
        {i.duration ? (
          <div className="intern-post__metric">
            <span className="intern-post__metric-k">Timeline</span>
            <span className="intern-post__metric-v">{i.duration}</span>
          </div>
        ) : null}
        {i.postedAt ? (
          <div className="intern-post__metric">
            <span className="intern-post__metric-k">Listed</span>
            <time
              className="intern-post__metric-v"
              dateTime={i.postedAt}
            >
              {new Date(i.postedAt + "T12:00:00").toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}
            </time>
          </div>
        ) : null}
      </div>

      {href ? (
        <div className="intern-post__cta-wrap">
          <a
            className="intern-post__cta"
            href={href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>View posting</span>
            <span className="intern-post__cta-arrow" aria-hidden>
              ↗
            </span>
          </a>
          <p className="intern-post__cta-hint">
            {ctaKind === "linkedin"
              ? "Opens a LinkedIn Jobs search for this title and company in a new tab. Pick the live posting that matches and apply on the official employer or ATS page."
              : ctaKind === "indeed"
              ? "Opens an Indeed search for this title and company in a new tab. Use it to find postings, then apply on the official employer or ATS page."
              : "Opens the employer’s job or internship search in a new tab. Always confirm deadlines on the official posting before you apply."}
          </p>
        </div>
      ) : (
        <div className="intern-post__cta-wrap">
          <span className="intern-post__cta intern-post__cta--disabled" aria-disabled="true">
            Link unavailable
          </span>
        </div>
      )}
    </article>
  );
}
