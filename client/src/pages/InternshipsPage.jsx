import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchJson } from "../api.js";
import InternshipCard from "../components/InternshipCard.jsx";
import { hasUsableInternshipLink } from "../lib/externalLinks.js";
import {
  INTERNSHIP_LINKEDIN_HREF,
  INTERNSHIP_WHATSAPP_HREF,
} from "../config/internshipOutreach.js";
/** Bundled copy of server/data/internships.json — used if the API is unavailable */
import internshipCatalog from "@internships/catalog";

const PAGE_SIZE = 10;

function IconWhatsApp({ className }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function IconLinkedIn({ className }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function filterInternshipsLocal(list, sourceFilter, q) {
  let out = list;
  if (sourceFilter !== "all") {
    out = out.filter((i) => i.sourceType === sourceFilter);
  }
  const needle = q.trim().toLowerCase();
  if (needle) {
    out = out.filter((i) => {
      const blob = [
        i.title,
        i.organization,
        i.location,
        i.description,
        i.sourceType,
        i.sourceNote,
        i.workMode,
        i.postingUrl,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return blob.includes(needle);
    });
  }
  out.sort(compareInternshipsForListing);
  return out;
}

/** LinkedIn-sourced rows first, then others; within each group by date then title. */
function compareInternshipsForListing(a, b) {
  const linkedInFirst = (i) =>
    /linkedin/i.test(String(i.sourceType || "")) ? 0 : 1;
  const la = linkedInFirst(a);
  const lb = linkedInFirst(b);
  if (la !== lb) return la - lb;
  const da = String(a.postedAt || "");
  const db = String(b.postedAt || "");
  if (da && db) {
    const byDate = db.localeCompare(da);
    if (byDate !== 0) return byDate;
  }
  return String(a.title || "").localeCompare(String(b.title || ""));
}

export default function InternshipsPage() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [fromFallback, setFromFallback] = useState(false);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [sourceOptions, setSourceOptions] = useState([]);

  useEffect(() => {
    const prev = document.title;
    document.title = "Internships | Edura";
    return () => {
      document.title = prev;
    };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 400);
    return () => clearTimeout(t);
  }, [query]);

  const prevFiltersRef = useRef({ q: debouncedQuery, source: sourceFilter });

  useEffect(() => {
    let cancelled = false;
    fetchJson("/api/internships/sources")
      .then((data) => {
        if (!cancelled && Array.isArray(data)) setSourceOptions(data);
      })
      .catch(() => {
        if (!cancelled) {
          const types = [
            ...new Set(
              internshipCatalog.map((i) => i.sourceType).filter(Boolean)
            ),
          ].sort((a, b) => a.localeCompare(b));
          setSourceOptions(types);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(null);

    const filtersChanged =
      prevFiltersRef.current.q !== debouncedQuery ||
      prevFiltersRef.current.source !== sourceFilter;
    prevFiltersRef.current = { q: debouncedQuery, source: sourceFilter };

    const pageToFetch = filtersChanged ? 1 : page;
    if (filtersChanged && page !== 1) {
      setPage(1);
    }

    const params = new URLSearchParams();
    params.set("page", String(pageToFetch));
    params.set("limit", String(PAGE_SIZE));
    if (debouncedQuery.trim()) params.set("q", debouncedQuery.trim());
    if (sourceFilter !== "all") params.set("source", sourceFilter);

    const applyFallback = () => {
      const list = Array.isArray(internshipCatalog) ? internshipCatalog : [];
      const filtered = filterInternshipsLocal(list, sourceFilter, debouncedQuery);
      const tp = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE) || 1);
      const safePage = Math.min(pageToFetch, tp);
      const offset = (safePage - 1) * PAGE_SIZE;
      const slice = filtered.slice(offset, offset + PAGE_SIZE);
      if (!cancelled) {
        setItems(slice);
        setTotal(filtered.length);
        setTotalPages(tp);
        if (safePage !== page) setPage(safePage);
        setFromFallback(true);
        setLoadError(null);
      }
    };

    fetchJson(`/api/internships?${params.toString()}`)
      .then((data) => {
        if (cancelled) return;
        if (data && Array.isArray(data.items)) {
          setItems(data.items);
          setTotal(typeof data.total === "number" ? data.total : data.items.length);
          setTotalPages(
            typeof data.totalPages === "number" ? data.totalPages : 1
          );
          setFromFallback(false);
        } else if (Array.isArray(data)) {
          setItems(data);
          setTotal(data.length);
          setTotalPages(1);
          setFromFallback(false);
        } else {
          applyFallback();
        }
      })
      .catch(() => {
        applyFallback();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page, debouncedQuery, sourceFilter]);

  const visibleItems = useMemo(
    () => items.filter(hasUsableInternshipLink),
    [items]
  );

  const rangeLabel = useMemo(() => {
    if (total === 0) return "0 results";
    const start = (page - 1) * PAGE_SIZE + 1;
    const end = Math.min(page * PAGE_SIZE, total);
    return `Showing ${start} to ${end} of ${total}`;
  }, [total, page]);

  return (
    <div className="page page--internships">
      <header
        className="page-hero page-hero--surface page-hero--internships"
        aria-labelledby="intern-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Employers & program leads</p>
          <h1 id="intern-heading" className="page-hero-title">
            Internships on Edura
          </h1>
          <p className="page-hero-lead">
            Browse curated openings from LinkedIn, employer career pages, university
            portals, and other public sources, then apply on the official site.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Source labels</li>
            <li className="page-hero-badge">Official apply links</li>
            <li className="page-hero-badge">Free employer listings</li>
          </ul>
        </div>
      </header>

      <main id="main-content" className="main main--internships">
        <section className="intern-list-section" aria-labelledby="intern-browse-heading">
          <div className="intern-list-head">
            <h2 id="intern-browse-heading" className="intern-list-title">
              Current openings
            </h2>
            <p className="intern-list-intro">
              Each card links out to the full public posting (employer careers page,
              LinkedIn job view, Indeed, or another official listing). When we have a
              direct job URL it is used first. Deadlines and eligibility change often, so
              always confirm details on that page before you apply.
            </p>
            {fromFallback && (
              <p className="intern-fallback-banner" role="status">
                Showing saved listings because the server API was unavailable. From the project
                root run <code className="inline-code">npm run dev</code> (client and API)
                or start the API with <code className="inline-code">npm start</code> in
                the <code className="inline-code">server</code> folder, then refresh for
                live paginated data.
              </p>
            )}
          </div>

          <div className="intern-toolbar">
            <label className="intern-field intern-field--search">
              <span className="intern-field-label">Search</span>
              <div className="field-control field-control-search">
                <span className="search-icon" aria-hidden>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M21 21l-4.35-4.35M11 18a7 7 0 100-14 7 7 0 000 14z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Role, company, location, source"
                  autoComplete="off"
                  className="intern-search-input"
                  aria-label="Filter internships by keyword"
                />
              </div>
            </label>
            <label className="intern-field intern-field--source">
              <span className="intern-field-label">Source type</span>
              <div className="field-control">
                <select
                  value={sourceFilter}
                  onChange={(e) => {
                    setSourceFilter(e.target.value);
                    setPage(1);
                  }}
                  aria-label="Filter by where the listing was referenced from"
                >
                  <option value="all">All sources</option>
                  {sourceOptions.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </label>
          </div>

          <p className="intern-range-line" aria-live="polite">
            {!loading && !loadError ? rangeLabel : "\u00a0"}
          </p>

          {loading && (
            <p className="intern-list-status" role="status">
              Loading openings
            </p>
          )}
          {!loading && loadError && (
            <p className="intern-list-status intern-list-status--error" role="alert">
              {loadError}
            </p>
          )}
          {!loading && !loadError && visibleItems.length === 0 && (
            <p className="intern-list-status">
              No internships match your filters. Try clearing the search or choose
              another source.
            </p>
          )}
          {!loading && !loadError && visibleItems.length > 0 && (
            <section className="grid intern-grid" aria-live="polite">
              {visibleItems.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </section>
          )}

          {!loading && !loadError && total > 0 && (
            <nav
              className="intern-pagination"
              aria-label="Internship results pages"
            >
              <button
                type="button"
                className="btn btn-secondary intern-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </button>
              <span className="intern-page-indicator">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                className="btn btn-secondary intern-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </button>
            </nav>
          )}
        </section>

        <section className="intern-panel" aria-labelledby="intern-contact-heading">
          <div className="intern-panel-head">
            <h2 id="intern-contact-heading" className="intern-panel-title">
              Publish your internship for free
            </h2>
            <p className="intern-panel-lead">
              Want your role listed here? Message us on WhatsApp or LinkedIn with your
              details. We review every submission before it goes live.
            </p>
          </div>

          <div className="intern-cta-grid">
            <a
              href={INTERNSHIP_WHATSAPP_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="intern-channel intern-channel--whatsapp"
            >
              <span className="intern-channel-icon-wrap" aria-hidden>
                <IconWhatsApp className="intern-channel-icon" />
              </span>
              <span className="intern-channel-body">
                <span className="intern-channel-label">WhatsApp</span>
                <span className="intern-channel-desc">
                  Send a structured message. We reply during business hours.
                </span>
              </span>
              <span className="intern-channel-action">
                Open WhatsApp
                <span className="intern-channel-chevron" aria-hidden>
                  →
                </span>
              </span>
            </a>

            <a
              href={INTERNSHIP_LINKEDIN_HREF}
              target="_blank"
              rel="noopener noreferrer"
              className="intern-channel intern-channel--linkedin"
            >
              <span className="intern-channel-icon-wrap" aria-hidden>
                <IconLinkedIn className="intern-channel-icon" />
              </span>
              <span className="intern-channel-body">
                <span className="intern-channel-label">LinkedIn</span>
                <span className="intern-channel-desc">
                  Connect or message our team through our LinkedIn presence.
                </span>
              </span>
              <span className="intern-channel-action">
                Open LinkedIn
                <span className="intern-channel-chevron" aria-hidden>
                  →
                </span>
              </span>
            </a>
          </div>
        </section>

        <section className="intern-steps-section" aria-labelledby="intern-steps-heading">
          <h2 id="intern-steps-heading" className="intern-steps-heading">
            How publishing works
          </h2>
          <ol className="intern-steps">
            <li className="intern-step">
              <span className="intern-step-num" aria-hidden>
                1
              </span>
              <div className="intern-step-text">
                <h3 className="intern-step-title">Send details</h3>
                <p>
                  Share organization, role, location, duration, and how candidates
                  should apply using WhatsApp or LinkedIn.
                </p>
              </div>
            </li>
            <li className="intern-step">
              <span className="intern-step-num" aria-hidden>
                2
              </span>
              <div className="intern-step-text">
                <h3 className="intern-step-title">Quick review</h3>
                <p>
                  We check that the opportunity is clear, legitimate, and suitable
                  for our audience, usually within a few business days.
                </p>
              </div>
            </li>
            <li className="intern-step">
              <span className="intern-step-num" aria-hidden>
                3
              </span>
              <div className="intern-step-text">
                <h3 className="intern-step-title">Go live</h3>
                <p>
                  Once approved, we publish your opportunity here with source context
                  and a link to your official application or careers page.
                </p>
              </div>
            </li>
          </ol>
        </section>

        <section className="intern-checklist-wrap" aria-labelledby="intern-check-heading">
          <div className="intern-checklist">
            <h2 id="intern-check-heading" className="intern-checklist-title">
              Include in your first message
            </h2>
            <ul className="intern-checklist-list">
              <li>Legal organization name and website</li>
              <li>Internship title and team or department</li>
              <li>Location policy (on site city, hybrid, or remote)</li>
              <li>Duration, compensation or academic credit if applicable</li>
              <li>
                Link to the full job posting (LinkedIn job view, careers site requisition,
                or official apply URL), not only the company homepage
              </li>
            </ul>
          </div>
        </section>

        <section className="intern-alt-contact" aria-label="Alternative contact">
          <p>
            Prefer email? Use our{" "}
            <Link to="/contact" className="intern-alt-link">
              contact form
            </Link>{" "}
            and mention <strong>Internship listing</strong> in the subject line.
          </p>
        </section>
      </main>
    </div>
  );
}
