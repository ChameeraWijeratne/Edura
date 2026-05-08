import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AIToolLogo from "../components/AIToolLogo.jsx";
import catalog from "../data/aiTools.json";

const ALL = "all";

export default function AIToolsPage() {
  const { categories, tools, meta } = catalog;
  const [filter, setFilter] = useState(ALL);

  /** Category order for filter pills and for “All” (matches `categories` in aiTools.json). */
  const categoryOrderIndex = useMemo(() => {
    const m = new Map();
    categories.forEach((c, i) => m.set(c.id, i));
    return m;
  }, [categories]);

  const byCat = useMemo(() => {
    const m = new Map();
    for (const t of tools) {
      if (!m.has(t.category)) m.set(t.category, []);
      m.get(t.category).push(t);
    }
    for (const [k, arr] of m) {
      m.set(
        k,
        arr.sort((a, b) => a.name.localeCompare(b.name, "en"))
      );
    }
    return m;
  }, [tools]);

  const visible = useMemo(() => {
    if (filter === ALL) {
      const end = categories.length;
      return [...tools].sort((a, b) => {
        const ia = categoryOrderIndex.get(a.category) ?? end;
        const ib = categoryOrderIndex.get(b.category) ?? end;
        if (ia !== ib) return ia - ib;
        return a.name.localeCompare(b.name, "en");
      });
    }
    return byCat.get(filter) || [];
  }, [filter, tools, byCat, categories, categoryOrderIndex]);

  return (
    <div className="page page--ai-tools">
      <header
        className="page-hero page-hero--surface page-hero--ai-tools"
        aria-labelledby="ai-tools-heading"
      >
        <div className="page-hero-inner page-hero-inner--surface">
          <p className="eyebrow">Study stack</p>
          <h1 id="ai-tools-heading" className="page-hero-title">
            AI tools
          </h1>
          <p className="page-hero-lead">
            One directory of vetted public product links. Open a tool to go straight to
            that product’s app or feature page, not a vague marketing home when a precise URL
            exists.
          </p>
          <ul className="page-hero-badges" aria-label="Highlights">
            <li className="page-hero-badge">Direct product URLs</li>
            <li className="page-hero-badge">Category filters</li>
            <li className="page-hero-badge">Periodic review</li>
          </ul>
          {meta?.lastReviewed && (
            <p className="page-hero-meta" aria-label="Catalog last review date">
              Catalog review: {meta.lastReviewed}
            </p>
          )}
        </div>
      </header>

      <main id="main-content" className="main main--article main--ai-tools">
        <section
          className="section section-ai-tools"
          aria-labelledby="ai-tools-filter-heading"
        >
          <div className="section-inner">
            <div className="section-head section-head--row">
              <div>
                <h2 id="ai-tools-filter-heading" className="visually-hidden">
                  Filter by category
                </h2>
                <p className="eyebrow section-eyebrow">Pick a focus</p>
                <p className="section-lead section-lead--tight">
                  Filter the list, then use “Open product page” to leave this site and land on
                  the tool’s public page in a new tab.
                </p>
              </div>
            </div>

            <div className="ai-tools-filters" role="group" aria-label="Category filters">
              <button
                type="button"
                className={`ai-tools-filter${filter === ALL ? " is-active" : ""}`}
                onClick={() => setFilter(ALL)}
                aria-pressed={filter === ALL}
              >
                All ({tools.length})
              </button>
              {categories.map((c) => {
                const count = (byCat.get(c.id) || []).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={`ai-tools-filter${filter === c.id ? " is-active" : ""}`}
                    onClick={() => setFilter(c.id)}
                    aria-pressed={filter === c.id}
                  >
                    {c.label} ({count})
                  </button>
                );
              })}
            </div>

            <ul className="grid grid--ai-tools">
              {visible.map((t) => {
                const cat = categories.find((c) => c.id === t.category);
                return (
                  <li key={t.id}>
                    <article className="card card--ai-tool">
                      <div className="card--ai-tool__top">
                        <AIToolLogo name={t.name} tool={t} />
                        {cat && (
                          <span className="badge badge-category card--ai-tool__badge">
                            {cat.label}
                          </span>
                        )}
                      </div>
                      <h3 className="card-title">{t.name}</h3>
                      <p className="card-uni">{t.vendor}</p>
                      <p className="card-desc">{t.summary}</p>
                      <a
                        className="card-cta"
                        href={t.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Open ${t.name} on ${t.vendor} (new tab)`}
                      >
                        Open product page
                        <span className="card-cta-icon" aria-hidden>
                          ↗
                        </span>
                      </a>
                      <p className="ai-tool-url" title="Destination URL for transparency">
                        <code>{t.url}</code>
                      </p>
                    </article>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="section section-ai-tools-foot" aria-labelledby="ai-tools-cta">
          <div className="section-inner">
            <article className="prose">
              <p id="ai-tools-cta">
                Third-party access terms and pricing can change. Always confirm on the provider
                before you build a workflow on a product.
              </p>
              <p className="prose-cta">
                <Link className="btn btn-secondary" to="/">
                  Back to home
                </Link>
                <Link className="btn btn-primary" to="/courses">
                  International courses
                </Link>
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
