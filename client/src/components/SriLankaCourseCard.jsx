import { resolveCourseExternalHref } from "../lib/externalLinks.js";

export default function SriLankaCourseCard({ course }) {
  const isFree = course.pricing === "free";
  const href = resolveCourseExternalHref(course);

  return (
    <article className="card">
      <div className="card-top">
        <span className="badge badge-subject">{course.subject}</span>
        <span className="badge badge-category">{course.category}</span>
        <span className="badge badge-level">{course.level}</span>
        <span
          className={`badge ${isFree ? "badge-pricing-free" : "badge-pricing-paid"}`}
        >
          {isFree ? "Free" : "Paid"}
        </span>
      </div>
      <h3 className="card-title">{course.title}</h3>
      <p className="card-uni">{course.university}</p>
      <p className="card-desc" title={course.description}>
        {course.description}
      </p>
      <dl className="card-meta">
        <div>
          <dt>Provider</dt>
          <dd>{course.provider}</dd>
        </div>
        <div>
          <dt>Duration</dt>
          <dd>{course.duration}</dd>
        </div>
      </dl>
      <p className="card-free">{course.freeNote}</p>
      {href ? (
        <a
          className="card-cta"
          href={href}
          target="_blank"
          rel="noopener noreferrer"
        >
          Open details
          <span className="card-cta-icon" aria-hidden>
            ↗
          </span>
        </a>
      ) : (
        <span className="card-cta card-cta--unavailable" aria-disabled="true">
          Link unavailable
        </span>
      )}
    </article>
  );
}
