import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import NeuralNetworkBackground from "./NeuralNetworkBackground.jsx";
import ThemeToggle from "./ThemeToggle.jsx";
import ContactChatPanel from "./ContactChatPanel.jsx";
import SiteFooter from "./SiteFooter.jsx";

function navClass({ isActive }) {
  return `nav-link${isActive ? " nav-link--active" : ""}`;
}

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  function handleHeaderSearch(e) {
    e.preventDefault();
    const q = String(new FormData(e.currentTarget).get("q") || "").trim();
    setMenuOpen(false);
    navigate(q ? `/courses?q=${encodeURIComponent(q)}` : "/courses");
  }

  function openContact() {
    setMenuOpen(false);
    setContactOpen(true);
  }

  return (
    <div className="layout">
      <NeuralNetworkBackground />
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <header className="shell-header">
        <div className="shell-header-inner">
          <Link
            to="/"
            className="brand-wordmark-link shell-header-brand"
            onClick={() => setMenuOpen(false)}
            aria-label="Edura LK home"
          >
            <span className="brand-wordmark">
              Edura
              <sup className="brand-wordmark-sup">LK</sup>
            </span>
          </Link>

          <form
            className="header-search"
            role="search"
            onSubmit={handleHeaderSearch}
            aria-label="Search courses"
          >
            <label htmlFor="header-search-input" className="visually-hidden">
              Search courses
            </label>
            <input
              id="header-search-input"
              name="q"
              type="search"
              className="header-search-input"
              placeholder="What do you want to learn?"
              autoComplete="off"
              enterKeyHint="search"
            />
            <button type="submit" className="header-search-submit" aria-label="Search">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.25"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3.5-3.5" />
              </svg>
            </button>
          </form>

          <nav
            id="primary-nav"
            className={`primary-nav${menuOpen ? " is-open" : ""}`}
            aria-label="Primary"
          >
            <ul className="primary-nav-list">
              <li>
                <NavLink to="/" end className={navClass} onClick={() => setMenuOpen(false)}>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/courses"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  International
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/sri-lanka"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Sri Lanka
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/internships"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  Internships
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/ai-tools"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  AI tools
                </NavLink>
              </li>
              <li>
                <NavLink
                  to="/about"
                  className={navClass}
                  onClick={() => setMenuOpen(false)}
                >
                  About us
                </NavLink>
              </li>
              <li className="primary-nav__end">
                <div className="primary-nav-inline-tools">
                  <ThemeToggle />
                </div>
              </li>
            </ul>
          </nav>

          <div className="header-trail">
            <button
              type="button"
              className="nav-menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="primary-nav"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => setMenuOpen((o) => !o)}
            >
              <span className="nav-menu-bar" aria-hidden />
              <span className="nav-menu-bar" aria-hidden />
              <span className="nav-menu-bar" aria-hidden />
            </button>
          </div>
        </div>
      </header>

      <div className="layout-fill">
        <div className="page-outlet" key={location.pathname}>
          <Outlet />
        </div>
      </div>

      <ContactChatPanel
        open={contactOpen}
        onOpen={openContact}
        onClose={() => setContactOpen(false)}
      />

      <SiteFooter />
    </div>
  );
}
