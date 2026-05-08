/**
 * Parse Coursera course page HTML for schema.org Course JSON-LD.
 */
export function extractCourseFromHtml(html) {
  const blocks = [
    ...html.matchAll(
      /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
    ),
  ];
  for (const b of blocks) {
    let j;
    try {
      j = JSON.parse(b[1].trim());
    } catch {
      continue;
    }
    const candidates = Array.isArray(j) ? j : j["@graph"] ? j["@graph"] : [j];
    for (const node of candidates) {
      if (!node || typeof node !== "object") continue;
      const t = node["@type"];
      if (t === "Course" || (Array.isArray(t) && t.includes("Course"))) {
        return node;
      }
    }
  }
  return null;
}

export function institutionDomainFromCourse(schema) {
  const p = schema?.provider;
  if (!p || typeof p !== "object") return null;
  const url = p.url;
  if (typeof url !== "string" || !url.startsWith("http")) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

export function slugFromCourseraLearnUrl(url) {
  try {
    const u = new URL(url);
    const m = u.pathname.match(/\/learn\/([^/?#]+)/);
    return m ? m[1] : null;
  } catch {
    return null;
  }
}

export function subjectFromSchema(schema) {
  const about = schema?.about;
  if (Array.isArray(about) && about.length > 0) {
    const first = about[0];
    if (typeof first === "string") return first;
  }
  if (typeof about === "string") return about;
  return "General";
}
