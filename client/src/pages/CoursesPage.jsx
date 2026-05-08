import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { fetchJson } from "../api.js";
import CourseCard from "../components/CourseCard.jsx";
import { hasUsableCourseLink } from "../lib/externalLinks.js";

export default function CoursesPage() {
  const location = useLocation();
  const [subjects, setSubjects] = useState([]);
  const [universities, setUniversities] = useState([]);
  const [courses, setCourses] = useState([]);
  const [subject, setSubject] = useState("all");
  const [university, setUniversity] = useState("all");
  const [query, setQuery] = useState(() =>
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("q") ?? ""
      : ""
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = new URLSearchParams(location.search).get("q");
    setQuery(q ?? "");
  }, [location.search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, u] = await Promise.all([
          fetchJson("/api/subjects"),
          fetchJson("/api/universities"),
        ]);
        if (!cancelled) {
          setSubjects(s);
          setUniversities(u);
        }
      } catch (e) {
        if (!cancelled)
          setError("We could not load filters. Please refresh and try again.");
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
    if (query.trim()) params.set("q", query.trim());
    const qs = params.toString();
    const path = `/api/courses${qs ? `?${qs}` : ""}`;

    const t = setTimeout(async () => {
      try {
        const data = await fetchJson(path);
        if (!cancelled) {
          setCourses(data);
          setError(null);
        }
      } catch (e) {
        if (!cancelled)
          setError("We could not load courses. Please refresh and try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, query.trim() ? 250 : 0);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [subject, university, query]);

  const visibleCourses = useMemo(
    () => courses.filter(hasUsableCourseLink),
    [courses]
  );

  const heading = useMemo(() => {
    const parts = [];
    if (subject !== "all") parts.push(subject);
    if (university !== "all") parts.push(university);
    if (parts.length === 0) return "All international courses";
    return parts.join(" · ");
  }, [subject, university]);

  return (
    <div className="page">
      <header
        className="page-hero page-hero--surface page-hero--courses"
        aria-labelledby="courses-hero-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">International catalog</p>
          <h1 id="courses-hero-heading" className="page-hero-title">
            International courses
          </h1>
          <p className="page-hero-lead">
            Explore universities and platforms worldwide. Filter by subject and school,
            then open each card to enroll on the provider’s real course page.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Subject filters</li>
            <li className="page-hero-badge">Global universities</li>
            <li className="page-hero-badge">Official enroll links</li>
          </ul>
          <p className="page-hero-crosslink">
            <Link to="/sri-lanka">Browse Sri Lankan courses</Link>
          </p>
        </div>
      </header>

      <main id="main-content" className="main">
        <section className="filters-panel" aria-label="Search and filters">
          <div className="filters-panel-inner">
            <div className="filter-row">
              <label className="field">
                <span className="field-label">Subject</span>
                <div className="field-control">
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                  >
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
                <span className="field-label">University</span>
                <div className="field-control">
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                  >
                    <option value="all">All universities</option>
                    {universities.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
              <label className="field field-grow">
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
                    aria-label="Search courses"
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
                      {visibleCourses.length === 1 ? "course" : "courses"}
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
            visibleCourses.map((c) => <CourseCard key={c.id} course={c} />)}
        </section>

        {!loading && visibleCourses.length === 0 && !error && (
          <div className="empty-state">
            <p className="empty-title">No matches</p>
            <p className="empty-desc">
              Try clearing filters or using different keywords.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
