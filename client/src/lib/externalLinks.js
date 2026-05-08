/**
 * Resolve external hrefs for course and internship CTAs.
 *
 * Goals
 * -----
 * 1. Course "Open course" links must lead to a specific course/programme page.
 *    Faculty home pages, department listings, news articles, and similar hub
 *    pages are filtered out and the CTA renders as "Link unavailable" rather
 *    than dropping the user on an unrelated landing page.
 *
 * 2. Internship "View posting" links must match the source label on the card.
 *    A row labelled "LinkedIn" should open a LinkedIn job search filtered to
 *    the company and role. A row labelled "Indeed" should open the equivalent
 *    Indeed search. Other rows fall back to the employer's own job search,
 *    avoiding generic careers homepages whenever a search-style URL is known.
 */

/* -------------------------------------------------------------------------- */
/*  Internship posting URLs                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Builds a LinkedIn Jobs search URL keyed by role title and company so the
 * destination is at least a filtered, source-matching list rather than the
 * employer's generic careers page.
 */
function buildLinkedInSearchUrl(title, organization, location) {
  const keywords = [title, organization]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");
  const params = new URLSearchParams();
  if (keywords) params.set("keywords", keywords);
  const loc = String(location || "").trim();
  if (loc && !/^(global|varies|remote)$/i.test(loc)) {
    params.set("location", loc);
  }
  const qs = params.toString();
  return `https://www.linkedin.com/jobs/search/${qs ? `?${qs}` : ""}`;
}

/**
 * Builds an Indeed search URL keyed by role title and company.
 */
function buildIndeedSearchUrl(title, organization) {
  const q = [title, organization]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  const qs = params.toString();
  return `https://www.indeed.com/jobs${qs ? `?${qs}` : ""}`;
}

/**
 * True when the supplied href looks like a generic employer careers landing
 * page (host + empty/root path or a one-segment "/careers" / "/jobs" path)
 * rather than a job search or specific posting.
 */
function isGenericCareersHomepage(href) {
  const s = String(href || "").trim();
  if (!s) return true;
  try {
    const u = new URL(s);
    const path = (u.pathname || "/").replace(/\/+$/, "");
    if (path === "" || path === "/") return true;
    if (/^\/(careers|jobs|students|early-careers)$/i.test(path)) return true;
    if (u.search === "" && /^\/(careers|jobs|students)\/?[a-z0-9-]*$/i.test(path)) {
      // No query string and a short shallow path is almost always a hub page
      const segs = path.split("/").filter(Boolean);
      if (segs.length <= 2) return true;
    }
  } catch {
    return true;
  }
  return false;
}

/**
 * CTA for internship cards. The destination is chosen so the link actually
 * matches the labelled source on the card (LinkedIn → LinkedIn search, Indeed
 * → Indeed search, otherwise an employer-specific job search when we have one
 * — falling back to a LinkedIn search rather than a generic homepage).
 *
 * @param {{
 *   title?: string,
 *   organization?: string,
 *   location?: string,
 *   sourceType?: string,
 *   postingUrl?: string,
 *   url?: string,
 * }} i
 * @returns {{ href: string; ctaKind: "linkedin" | "indeed" | "employer" }}
 */
export function resolveInternshipPosting(i) {
  const sourceType = String(i?.sourceType || "").toLowerCase();
  const title = String(i?.title || "");
  const organization = String(i?.organization || "");
  const location = String(i?.location || "");
  const seeded = String(i?.postingUrl || i?.url || "").trim();

  if (sourceType.includes("linkedin")) {
    return {
      href: buildLinkedInSearchUrl(title, organization, location),
      ctaKind: "linkedin",
    };
  }

  if (sourceType.includes("indeed")) {
    return {
      href: buildIndeedSearchUrl(title, organization),
      ctaKind: "indeed",
    };
  }

  if (seeded && !isGenericCareersHomepage(seeded)) {
    return { href: seeded, ctaKind: "employer" };
  }

  return {
    href: buildLinkedInSearchUrl(title, organization, location),
    ctaKind: "linkedin",
  };
}

/* -------------------------------------------------------------------------- */
/*  Course external URLs                                                      */
/* -------------------------------------------------------------------------- */

/** Hostnames where a root path is still considered a usable landing page. */
const ROOT_OK_HOSTS = [
  "coursera.org",
  "edx.org",
  "futurelearn.com",
  "udemy.com",
  "udacity.com",
];

/**
 * Path segments that, anywhere in the URL, indicate a hub/news/category page
 * rather than a single course or programme page.
 */
const LISTING_SEGMENTS_ANYWHERE = new Set([
  "news",
  "events",
  "blog",
  "blogs",
  "image-gallery",
  "image-galleries",
  "iit-news",
  "home",
  "home2",
  "category",
  "categories",
  "faculty",
  "faculties",
]);

/**
 * Listing words that are only treated as a listing when they are the LAST
 * meaningful segment of the path. This lets `/courses/<slug>` keep working
 * while `/courses` (the listing) is filtered out.
 */
const LISTING_LAST_SEGMENTS = new Set([
  "departments",
  "department",
  "academics",
  "academic-programs",
  "academic-programmes",
  "courses",
  "courses-si",
  "undergraduate-courses",
  "undergraduate",
  "postgraduate",
  "degree-programmes",
  "featured-courses",
  "certificate-programmes",
  "diploma-programmes",
  "advanced-diploma-programmes",
  "executive-diplomas",
  "about",
  "about-us",
  "about-us-2",
]);

/** Last-segment prefixes — `department-of-x`, `faculty-of-y`, `board-of-z`, etc. */
const LISTING_LAST_PREFIXES = [
  "department-",
  "departments-",
  "faculty-",
  "faculties-",
  "board-",
];

/**
 * Hard-coded host + EXACT path combinations that are listings rather than a
 * specific programme page. These are matched on exact path equality so that
 * deeper paths like `/course/<slug>` are not affected by `/course` being on
 * this list. Empty/root paths are already covered by the generic root check
 * above, so they are not repeated here.
 */
const UNSPECIFIC_COURSE_EXACT = [
  { h: "uom.lk", p: "/foa" },
  { h: "iit.ac.lk", p: "/course" },
  { h: "www.iit.ac.lk", p: "/course" },
];

/**
 * Substring fallbacks for known unspecific URLs that the segment rules above
 * do not cover (typically news posts whose slug looks like a course title).
 */
const UNSPECIFIC_COURSE_SUBSTRINGS = [
  "nibm.lk/information-technology",
  "nibm.lk/programme/advanced-diploma-programmes",
  "nibm.lk/programme/certificate-programmes",
  "nibm.lk/programme/diploma-programmes",
  "nibm.lk/programme/degree-programmes",
  "nsbm.ac.lk/nsbm-inaugurates",
  "fgs.cmb.ac.lk/executive-diplomas",
  "ou.ac.lk/faculty-research-",
  "ou.ac.lk/faculty-quality-",
  "ou.ac.lk/faculty-of-",
  "sliit.lk/category/blog",
  "sliit.lk/blog/",
  "med.cmb.ac.lk/news/",
  "arts.cmb.ac.lk/index.php/category",
  "arts.cmb.ac.lk/index.php/multi-cultural",
  "arts.cmb.ac.lk/student-counsellors",
  "arts.cmb.ac.lk/faculty-board",
  "law.cmb.ac.lk/the-faculty-of-",
  "law.cmb.ac.lk/research-committee",
  "law.cmb.ac.lk/certificate-courses",
];

/**
 * Listings and faculty homepages that are not a specific course or programme page.
 * @param {string} href
 * @returns {boolean}
 */
export function isUnspecificCoursePageUrl(href) {
  const s = String(href || "").trim();
  if (!s) return true;

  let u;
  try {
    u = new URL(s);
  } catch {
    return true;
  }

  const host = u.hostname.toLowerCase();
  const path = (u.pathname || "/").replace(/\/+$/, "");
  const segments = path.split("/").filter(Boolean);
  const lower = s.toLowerCase();

  if (path === "" || path === "/") {
    if (!ROOT_OK_HOSTS.some((d) => host === d || host.endsWith(`.${d}`))) {
      return true;
    }
  }

  for (const { h, p } of UNSPECIFIC_COURSE_EXACT) {
    if (host === h && path === p) return true;
  }

  if (segments.length > 0) {
    if (segments.some((seg) => LISTING_SEGMENTS_ANYWHERE.has(seg))) {
      return true;
    }

    const last = segments[segments.length - 1];
    if (LISTING_LAST_SEGMENTS.has(last)) return true;
    if (LISTING_LAST_PREFIXES.some((pref) => last.startsWith(pref))) return true;
  }

  for (const frag of UNSPECIFIC_COURSE_SUBSTRINGS) {
    if (lower.includes(frag)) return true;
  }

  return false;
}

/**
 * @param {{ courseUrl?: string, url?: string }} course
 * @returns {string}
 */
export function resolveCourseExternalHref(course) {
  const href = String(course?.courseUrl || course?.url || "").trim();
  if (!href) return "";
  if (isUnspecificCoursePageUrl(href)) return "";
  return href;
}

/* -------------------------------------------------------------------------- */
/*  Availability helpers (used to hide cards whose CTA is unavailable)        */
/* -------------------------------------------------------------------------- */

/**
 * @param {{ courseUrl?: string, url?: string }} course
 * @returns {boolean}
 */
export function hasUsableCourseLink(course) {
  return resolveCourseExternalHref(course) !== "";
}

/**
 * Internship listings always resolve to a usable LinkedIn/Indeed/employer
 * search URL because the helper falls back to a LinkedIn search when no
 * specific posting is known. The CTA is therefore unavailable only when both
 * the title and organization are missing — without those we cannot build a
 * meaningful search.
 * @param {{ title?: string, organization?: string }} i
 * @returns {boolean}
 */
export function hasUsableInternshipLink(i) {
  const title = String(i?.title || "").trim();
  const organization = String(i?.organization || "").trim();
  if (!title && !organization) return false;
  const { href } = resolveInternshipPosting(i);
  return Boolean(href);
}
