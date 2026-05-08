import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api.js";
import SriLankaCourseCard from "../components/SriLankaCourseCard.jsx";
import { hasUsableCourseLink } from "../lib/externalLinks.js";

export default function SriLankaCoursesPage() {
  const [subjects, setSubjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState("all");
  const [university, setUniversity] = useState("all");
  const [category, setCategory] = useState("all");
  const [pricing, setPricing] = useState("all");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, u, cats] = await Promise.all([
          fetchJson("/api/sri-lanka/subjects"),
          fetchJson("/api/sri-lanka/universities"),
          fetchJson("/api/sri-lanka/categories"),
        ]);
        if (!cancelled) {
          setSubjects(s);
          setUniversities(u);
          setCategories(cats);
        }
      } catch {
        if (!cancelled) {
          setError("We could not load filters. Please refresh and try again.");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params = new URLSearchParams();
    if (subject !== "all") params.set("subject", subject);
    if (university !== "all") params.set("university", university);
    if (category !== "all") params.set("category", category);
    if (pricing !== "all") params.set("pricing", pricing);
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    const path = `/api/sri-lanka/courses${qs ? `?${qs}` : ""}`;

    const t = setTimeout(async () => {
      try {
        const data = await fetchJson(path);
        if (!cancelled) {
          setCourses(data);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setError("We could not load courses. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [subject, university, category, pricing, query]);

  const visibleCourses = useMemo(
    () => courses.filter(hasUsableCourseLink),
    [courses]
  );

  const heading = useMemo(() => {
    const parts = [];
    if (category !== "all") parts.push(category);
    if (subject !== "all") parts.push(subject);
    if (university !== "all") parts.push(university);
    if (pricing === "free") parts.push("Free");
    if (pricing === "paid") parts.push("Paid");
    if (parts.length === 0) return "All programmes";
    return parts.join(" · ");
  }, [category, subject, university, pricing]);

  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--sri-lanka"
        aria-labelledby="sl-courses-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Sri Lanka</p>
          <h1 id="sl-courses-heading" className="page-hero-title">
            Sri Lankan courses
          </h1>
          <p className="page-hero-lead">
            Free and paid pathways from O/L onward. Filter by stage, subject,
            institution, and cost. Links open official or provider pages; always
            confirm fees and recognition before you enroll.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Stages & pathways</li>
            <li className="page-hero-badge">Fee filters</li>
            <li className="page-hero-badge">Institution labels</li>
          </ul>
          <p className="page-hero-crosslink">
            <Link to="/courses">Browse international courses</Link>
          </p>
        </div>
      </header>

      <main id="main-content" className="main">
        <section className="filters-panel" aria-label="Search and filters">
          <div className="filters-panel-inner">
            <div className="filter-row filter-row--sl">
              <label className="field">
                <span className="field-label">Stage</span>
                <div className="field-control">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    aria-label="Course stage or level category"
                  >
                    <option value="all">All stages</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field">
                <span className="field-label">Subject</span>
                <div className="field-control">
                  <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                    <option value="all">All subjects</option>
                    {subjects.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field">
                <span className="field-label">University / provider</span>
                <div className="field-control">
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="all">All institutions</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field">
                <span className="field-label">Cost</span>
                <div className="field-control">
                  <select value={pricing} onChange={(e) => setPricing(e.target.value)}>
                    <option value="all">Free &amp; paid</option>
                    <option value="free">Free only</option>
                    <option value="paid">Paid only</option>
                  </select>
                </div>
              </label>
              <label className="field field-grow field-grow--sl-search">
                <span className="field-label">Search</span>
                <div className="field-control field-control-search">
                  <span className="search-icon" aria-hidden>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                      <path
                        d="M16.5 16.5 21 21"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  <input
                    type="search"
                    placeholder="Search title, school, or description…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoComplete="off"
                    aria-label="Search Sri Lanka courses"
                  />
                </div>
              </label>
            </div>
            <div className="filter-toolbar-footer">
              <p className="filter-summary" aria-live="polite">
                {loading ? (
                  <span className="filter-summary-loading">Loading results…</span>
                ) : (
                  <>
                    <strong>{visibleCourses.length}</strong>
                    <span className="filter-summary-muted">
                      {" "}
                      {visibleCourses.length === 1 ? "programme" : "programmes"}
                    </span>
                    <span className="filter-summary-dot" aria-hidden>
                      ·
                    </span>
                    <span className="filter-summary-muted">{heading}</span>
                  </>
                )}
              </p>
            </div>
          </div>
        </section>

        {error && (
          <div className="banner banner-error" role="alert">
            {error}
          </div>
        )}

        <section className="grid" aria-live="polite">
          {!loading &&
            visibleCourses.map((c) => (
              <SriLankaCourseCard key={c.id} course={c} />
            ))}
        </section>

        {!loading && visibleCourses.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-title">No matches</p>
            <p className="empty-desc">
              Try clearing filters or different keywords. You can also browse{" "}
              <Link to="/courses">international courses</Link>.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
