import { Link } from "react-router-dom";

const STORIES = [
  {
    title: "From audit-only to interview-ready projects",
    excerpt:
      "A learner stacked CS fundamentals and small build projects from trusted schools, enough to talk confidently in junior dev interviews within a few months.",
    tag: "Career path",
    to: "/courses",
    linkLabel: "Browse international courses",
  },
  {
    title: "AI helpers with direct product links",
    excerpt:
      "A curated list of well-known tools with one tap out to each vendor’s public app or product page, so you land where you can actually try the product.",
    tag: "Stack",
    to: "/ai-tools",
    linkLabel: "Open the AI tool list",
  },
  {
    title: "Study groups that actually share one link list",
    excerpt:
      "Clubs and friend groups use Edura so nobody forwards sketchy PDFs. Everyone opens the same official course pages.",
    tag: "Campus life",
    to: "/courses",
    linkLabel: "Browse international courses",
  },
  {
    title: "Degree plus open courses, without the tab overload",
    excerpt:
      "Students pair formal programs with free university MOOCs to patch weak topics, using filters instead of fifty open browser tabs.",
    tag: "Study smarter",
    to: "/courses",
    linkLabel: "Browse international courses",
  },
];

export default function BestStoriesSection() {
  return (
    <section className="section section-stories" aria-labelledby="stories-heading">
      <div className="section-inner">
        <div className="section-head">
          <p className="eyebrow section-eyebrow">Ideas for your semester</p>
          <h2 id="stories-heading" className="section-title">
            How peers use Edura
          </h2>
          <p className="section-lead">
            Quick scenarios from learners who wanted credible courses, less noise, and a
            simple way to plan what to take next.
          </p>
        </div>
        <ul className="stories-grid">
          {STORIES.map((s) => (
            <li key={s.title} className="story-card">
              <span className="story-tag">{s.tag}</span>
              <h3 className="story-title">{s.title}</h3>
              <p className="story-excerpt">{s.excerpt}</p>
              <Link className="story-link" to={s.to}>
                {s.linkLabel}
                <span aria-hidden> →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
