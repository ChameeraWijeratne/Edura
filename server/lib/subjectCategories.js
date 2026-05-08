/**
 * High-level subject categories for international & Sri Lanka course listings.
 * Order is stable for dropdowns; first matching rule wins.
 */

export const SUBJECT_CATEGORIES = [
  "Technology & Computing",
  "Computer Science",
  "Artificial Intelligence",
  "Engineering & Architecture",
  "Business & Economics",
  "Health & Medicine",
  "Sciences & Mathematics",
  "Humanities & Languages",
  "Law & Social Sciences",
  "Arts & Media",
  "Education & Teaching",
  "Environment & Sustainability",
];

const DEFAULT_CATEGORY = "Sciences & Mathematics";

/** @type {Array<{ test: (s: string) => boolean, category: string }>} */
const RULES = [
  // Most specific tech disciplines first
  {
    category: "Artificial Intelligence",
    test: (s) =>
      /\b(machine learning|deep learning|artificial intelligence|generative ai|\bai ethics\b|\bai for\b|\bai applications\b|neural network|large language|\bllm\b|natural language processing|\bnlp\b|computer vision|reinforcement learning|transfer learning|transformers?\b|pytorch|tensorflow|keras|convolutional|recurrent|generative model|prompt engineering|chatgpt|gemini ai|data science|predictive model|supervised learning|unsupervised learning|feature engineering|scikit|autoencoder|\bgan\b)\b/i.test(
        s,
      ) || /\b(ai\b.*\b(coursera|course|learn|specialization))|specialization.*\b(ai|machine learning)\b/i.test(s),
  },
  {
    category: "Computer Science",
    test: (s) =>
      /\b(computer science|\bcs50\b|data structures?|algorithms?|algorithmic|operating systems?|compiler design|theory of computation|discrete mathematics|software engineering|object[\s-]oriented|systems programming|computer architecture|distributed systems|computational thinking|programming languages|computability|cryptography(?!\s+law)|database theory|leetcode-style|oop\b|functional programming)\b/i.test(
        s,
      ) ||
      /\b(programming|coding)\b.*\b(intro(duction)?|fundamentals|basics|beginner|python|java|c\+\+|rust|golang)\b/i.test(
        s,
      ) ||
      /\b(intro(duction)? to computer science|cs\s*principles|ap computer science)\b/i.test(s),
  },
  {
    category: "Technology & Computing",
    test: (s) =>
      /\b(computing|software developer|full-?stack|web dev|cybersecurity|blockchain|cloud|devops|information technology|\bit\b|database admin|python|javascript|\bjava\b|react|node\.?js|kubernetes|docker|aws|azure|gpu|informatics|ux design|ui design|human.?computer|hci|digital product|tech entrepreneurship|kubernetes|site reliability)\b/i.test(
        s,
      ) ||
      /\b(computer|coding|tensor)\b/i.test(s),
  },
  {
    category: "Engineering & Architecture",
    test: (s) =>
      /\b(engineering|civil eng|mechanical eng|electrical eng|chemical eng|aerospace|structural|manufacturing|robotics|embedded systems|architecture|architectural|built environment|construction management|surveying)\b/i.test(
        s,
      ),
  },
  {
    category: "Business & Economics",
    test: (s) =>
      /\b(business|mba|finance|accounting|marketing|management|economics|entrepreneur|leadership|supply chain|operations research|human resources|\bhr\b|strategy|investment|banking|commerce|real estate business)\b/i.test(
        s,
      ),
  },
  {
    category: "Health & Medicine",
    test: (s) =>
      /\b(medicine|medical|health|nursing|clinical|pharma|dentistry|epidemiology|public health|anatomy|physiology|pathology|surgery|patient|mental health|therapy|wellness|nutrition science|biostat)\b/i.test(
        s,
      ),
  },
  {
    category: "Sciences & Mathematics",
    test: (s) =>
      /\b(physics|chemistry|mathematics|statistics|math\b|biology|astronomy|geology|materials science|neuroscience|quantum|calculus|algebra|geometry|laboratory science)\b/i.test(
        s,
      ),
  },
  {
    category: "Humanities & Languages",
    test: (s) =>
      /\b(philosophy|history|literature|religion|theology|linguistics|classics|archaeology|humanities|cultural studies|english studies|sinhala studies|arabic|chinese language|french|german|spanish|language learning)\b/i.test(
        s,
      ),
  },
  {
    category: "Law & Social Sciences",
    test: (s) =>
      /\b(law|legal|jurisprudence|psychology|sociology|anthropology|political science|public policy|international relations|criminology|social work|governance)\b/i.test(
        s,
      ),
  },
  {
    category: "Arts & Media",
    test: (s) =>
      /\b(art\b|fine art|music|film|theatre|theater|journalism|media studies|graphic design|creative writing|photography|animation|fashion design|performing arts|visual communication)\b/i.test(
        s,
      ),
  },
  {
    category: "Education & Teaching",
    test: (s) =>
      /\b(education|teaching|pedagogy|curriculum|classroom|learning sciences|higher education admin|instructional design|edtech|nvq|vocational training|foundation programme|pre-university)\b/i.test(
        s,
      ) && !/\b(machine learning|deep learning)\b/i.test(s),
  },
  {
    category: "Environment & Sustainability",
    test: (s) =>
      /\b(environment|climate|sustainability|agriculture|agri|forestry|renewable energy|ecology|conservation|marine biology|earth science|geograph|gis\b|geographic information|remote sensing|gps\b|energy transition|pollution|water resources)\b/i.test(
        s,
      ),
  },
];

/**
 * Map free-text subject/title/description snippets to a canonical category.
 * @param {string} subject
 * @param {string} [title]
 * @param {string} [description]
 */
export function normalizeSubject(subject, title = "", description = "") {
  const combined = `${subject || ""} ${title || ""} ${(description || "").slice(0, 400)}`;
  const s = combined.replace(/\s+/g, " ").trim();
  if (!s) return DEFAULT_CATEGORY;

  for (const { test, category } of RULES) {
    try {
      if (test(s)) return category;
    } catch {
      /* ignore */
    }
  }

  // Light fallbacks on subject field alone
  const sub = (subject || "").toLowerCase();
  if (
    /machine learning|deep learning|artificial intelligence|\bai\b|neural|nlp|generative|llm|data sci/.test(
      sub,
    )
  )
    return "Artificial Intelligence";
  if (/computer science|algorithm|data structure|programming|software eng/.test(sub))
    return "Computer Science";
  if (/tech|comput|software|it\b|digital|cyber|code|web|cloud|developer/.test(sub))
    return "Technology & Computing";
  if (/eng|architect|built|civil|mech|electrical/.test(sub))
    return "Engineering & Architecture";
  if (/business|finance|econom|market|management|mba|account/.test(sub))
    return "Business & Economics";
  if (/health|medic|nurs|clinic|bio.?med|pharma|dental/.test(sub))
    return "Health & Medicine";
  if (/law|legal|psych|soci|politic|social|policy/.test(sub))
    return "Law & Social Sciences";
  if (/art|music|film|design|media|journal/.test(sub)) return "Arts & Media";
  if (/humanities|language|history|philosoph|literature|religion/.test(sub))
    return "Humanities & Languages";
  if (/science|math|physic|chemist|biology|statistic|mathematic/.test(sub))
    return "Sciences & Mathematics";
  if (/education|teach|pedagog|curriculum/.test(sub))
    return "Education & Teaching";
  if (/environment|climate|agri|sustain|ecolog|energy|earth|forest|marine/.test(sub))
    return "Environment & Sustainability";
  if (/^foundation$/i.test((subject || "").trim())) return "Education & Teaching";

  return DEFAULT_CATEGORY;
}

/**
 * @param {Record<string, unknown>} course
 */
export function withNormalizedSubject(course) {
  const c = { ...course };
  const sub = String(c.subject ?? "");
  const title = String(c.title ?? "");
  const desc = String(c.description ?? "");
  c.subject = normalizeSubject(sub, title, desc);
  return c;
}
