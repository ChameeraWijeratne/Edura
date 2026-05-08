/**
 * Rank courses so English-medium entries sort before other instructional languages.
 * Used for /api/courses (international) and /api/sri-lanka/courses.
 */

/** Non-Latin scripts → treat as not English-medium for ordering. */
const NON_LATIN_SCRIPT =
  /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]|[\u0400-\u052F\u1C80-\u1C8F]|[\u4E00-\u9FFF\u3400-\u4DBF\u3000-\u303F]|[\u3040-\u30FF]|[\uAC00-\uD7AF]|[\u0590-\u05FF]|[\u0E00-\u0E7F]|[\u0900-\u0DFF\u0F00-\u0FFF]/;

/** Sinhala / Tamil medium (titles, URLs, copy). */
const SL_NON_ENGLISH_MEDIUM =
  /\b(sinhala|tamil)(?:\s+|[-–])+\s*medium\b|[-/](sinhala|tamil)-medium\b/i;

/** Spanish inverted punctuation in title often means Spanish-medium catalog entries. */
const SPANISH_PUNCT = /^[\s]*[¿¡]/;

/**
 * @returns {0} English-medium (or undetermined) — list first
 * @returns {1} Other language — list after English
 */
export function englishMediumRank(course) {
  const title = String(course.title || "");
  const desc = String(course.description || "");
  const url = String(course.url || "");
  const head = `${title}\n${url}`;

  if (SL_NON_ENGLISH_MEDIUM.test(head) || SL_NON_ENGLISH_MEDIUM.test(desc)) {
    return 1;
  }

  const sample = `${title}\n${desc.slice(0, 480)}`;
  if (NON_LATIN_SCRIPT.test(sample)) return 1;
  if (SPANISH_PUNCT.test(title)) return 1;

  return 0;
}

export function compareCoursesEnglishMediumFirst(a, b) {
  const ra = englishMediumRank(a);
  const rb = englishMediumRank(b);
  if (ra !== rb) return ra - rb;
  return String(a.title || "").localeCompare(String(b.title || ""), undefined, {
    sensitivity: "base",
  });
}
