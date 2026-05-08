import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--about"
        aria-labelledby="about-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Our mission</p>
          <h1 id="about-heading" className="page-hero-title">
            About Edura
          </h1>
          <p className="page-hero-lead">
            We help students and lifelong learners find credible, free or
            audit-friendly university courses, without wading through noisy search
            results or broken links.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Curated directory</li>
            <li className="page-hero-badge">Official links</li>
            <li className="page-hero-badge">Independent listings</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="main main--article">
        <article className="prose">
          <h2>What we do</h2>
          <p>
            Edura is a structured directory: each listing includes the
            institution, subject, level, provider, and a direct link to the
            official course page. Filters make it easy to narrow down by subject
            or university.
          </p>
          <h2>How listings are maintained</h2>
          <p>
            Our catalog is updated in one central place so editors can add or
            change listings cleanly. That keeps the directory consistent and
            easy to review.
          </p>
          <h2>Independence and accuracy</h2>
          <p>
            We do not host course content. Access rules, certificates, and
            pricing can change on third party platforms. Always confirm details
            on the provider’s site before you enroll.
          </p>
          <p className="prose-cta">
            <Link className="btn btn-primary" to="/courses">
              International courses
            </Link>
            <Link className="btn btn-secondary" to="/sri-lanka">
              Sri Lankan courses
            </Link>
            <Link className="btn btn-secondary" to="/contact">
              Contact us
            </Link>
          </p>
        </article>
      </main>
    </div>
  );
}
