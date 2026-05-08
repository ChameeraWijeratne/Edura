/**
 * Build international courses from Coursera public course sitemap + live page JSON-LD.
 * Merges with existing courses.json entries by URL (existing wins on duplicate — run with --prefer-generated to override).
 *
 * Usage: node scripts/build-international-coursera.mjs [--limit 1000] [--offset 0] [--prefer-generated]
 */
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import {
  extractCourseFromHtml,
  institutionDomainFromCourse,
  slugFromCourseraLearnUrl,
  subjectFromSchema,
} from "./lib/courseraCourseHtml.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const coursesPath = join(dataDir, "courses.json");

const UA = "Mozilla/5.0 (compatible; EduraCatalogBot/1.0; +https://example.local)";

function arg(name, def) {
  const i = process.argv.indexOf(name);
  if (i === -1) return def;
  return process.argv[i + 1] ?? def;
}

const LIMIT = Math.max(1, parseInt(String(arg("--limit", "1000")), 10) || 1000);
const OFFSET = Math.max(0, parseInt(String(arg("--offset", "0")), 10) || 0);
const PREFER_GENERATED = process.argv.includes("--prefer-generated");

async function fetchText(url) {
  const r = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/xml,text/xml,*/*" },
    redirect: "follow",
  });
  if (!r.ok) throw new Error(`${url} -> ${r.status}`);
  return r.text();
}

function parseSitemapLocs(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].trim());
}

async function loadCourseraLearnUrls() {
  const xml = await fetchText("https://www.coursera.org/sitemap~www~courses.xml");
  const locs = parseSitemapLocs(xml);
  return locs.filter((u) => {
    if (!u.includes("/learn/")) return false;
    try {
      const slug = slugFromCourseraLearnUrl(u);
      if (!slug) return false;
      if (slug.startsWith("-")) return false;
      const loc = slug.toLowerCase();
      if (/-(zhtw|zhcn|ptbr|kokr|jajp|dede|eses|frfr|itit|ar|vi|th|id|tr|pl|uk|ru|hi|bn|ta|te|mr|gu|kn|ml|pa)(-\d+)?$/i.test(loc))
        return false;
      return true;
    } catch {
      return false;
    }
  });
}

function safeId(slug) {
  const s = slug.replace(/[^a-z0-9-]/gi, "-").replace(/-+/g, "-").toLowerCase();
  return `coursera-${s.slice(0, 120)}`;
}

function ogTitleFromHtml(html) {
  const m = html.match(/property="og:title"\s+content="([^"]*)"/i);
  return m ? m[1].trim().replace(/\s*\|\s*Coursera\s*$/i, "") : null;
}

async function courseFromCourseraUrl(url) {
  const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "text/html" }, redirect: "follow" });
  if (!r.ok) return null;
  const html = await r.text();
  const schema = extractCourseFromHtml(html);
  const slug = slugFromCourseraLearnUrl(url);
  if (!schema) {
    const og = ogTitleFromHtml(html);
    if (!og) return null;
    return {
      id: safeId(slug || "x"),
      title: og,
      university: "Coursera partner",
      subject: "General",
      description: `Coursera course page: ${og}. Open the link for the latest syllabus and enrollment options.`,
      provider: "Coursera",
      url,
      level: "Varies",
      duration: "Self-paced",
      freeNote: "See Coursera for current pricing and audit options.",
      _institutionDomain: null,
    };
  }
  const providerName =
    typeof schema.provider?.name === "string" ? schema.provider.name : "Coursera partner";
  const title = (typeof schema.name === "string" ? schema.name : slug).trim();
  const description =
    typeof schema.description === "string"
      ? schema.description.replace(/\s+/g, " ").trim().slice(0, 480)
      : `Online course on Coursera: ${title}`;
  const level =
    typeof schema.educationalLevel === "string" ? schema.educationalLevel : "Varies";
  const subject = subjectFromSchema(schema);
  const freeNote =
    schema.offers?.category === "Partially Free" || /free/i.test(String(schema.description || ""))
      ? "Often free to audit; certificate may be paid."
      : "See Coursera for current pricing and audit options.";

  return {
    id: safeId(slug || "x"),
    title: title || slug,
    university: providerName,
    subject,
    description,
    provider: "Coursera",
    url,
    level,
    duration: "Self-paced",
    freeNote,
    _institutionDomain: institutionDomainFromCourse(schema),
  };
}

async function runPool(items, concurrency, fn) {
  const out = [];
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      const res = await fn(items[idx], idx);
      if (res) out.push(res);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()));
  return out;
}

function mergeByUrl(existing, generated) {
  const map = new Map();
  if (!PREFER_GENERATED) {
    for (const c of existing) {
      const u = String(c.url || "").trim();
      if (u) map.set(u, { ...c });
    }
    for (const c of generated) {
      const u = String(c.url || "").trim();
      if (!u) continue;
      if (!map.has(u)) map.set(u, stripInternal(c));
    }
  } else {
    for (const c of generated) {
      const u = String(c.url || "").trim();
      if (u) map.set(u, stripInternal(c));
    }
    for (const c of existing) {
      const u = String(c.url || "").trim();
      if (u && !map.has(u)) map.set(u, { ...c });
    }
  }
  return [...map.values()];
}

function stripInternal(c) {
  const { _institutionDomain: _, ...rest } = c;
  return rest;
}

async function main() {
  console.error("Fetching Coursera sitemap…");
  const urls = await loadCourseraLearnUrls();
  const slice = urls.slice(OFFSET, OFFSET + LIMIT);
  console.error(`Candidates ${slice.length} (offset ${OFFSET}, limit ${LIMIT})`);

  let done = 0;
  const generated = await runPool(slice, 8, async (url) => {
    try {
      const c = await courseFromCourseraUrl(url);
      done++;
      if (done % 50 === 0) console.error(`Parsed ${done}/${slice.length}`);
      return c;
    } catch (e) {
      console.error("skip", url, e.message);
      return null;
    }
  });

  const domains = new Map();
  for (const c of generated) {
    const d = c._institutionDomain;
    const name = c.university;
    if (d && name) domains.set(d, name);
  }

  let existing = [];
  if (existsSync(coursesPath)) {
    try {
      existing = JSON.parse(readFileSync(coursesPath, "utf-8"));
    } catch {
      existing = [];
    }
  }

  const merged = mergeByUrl(Array.isArray(existing) ? existing : [], generated);
  merged.sort((a, b) => a.title.localeCompare(b.title));

  const backup = join(dataDir, `courses.backup.${Date.now()}.json`);
  if (existsSync(coursesPath)) copyFileSync(coursesPath, backup);
  writeFileSync(coursesPath, JSON.stringify(merged, null, 2), "utf-8");
  console.error(`Wrote ${merged.length} courses to courses.json (backup: ${backup})`);

  const domPath = join(dataDir, "catalog-institution-domains.json");
  writeFileSync(
    domPath,
    JSON.stringify(
      [...domains.entries()].map(([domain, name]) => ({ domain, name })),
      null,
      2,
    ),
    "utf-8",
  );
  console.error(`Wrote ${domains.size} institution domain hints to catalog-institution-domains.json`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
