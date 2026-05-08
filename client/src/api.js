const API = import.meta.env.VITE_API_URL || "";

export async function fetchJson(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  const hasBody = rest.body != null;
  const res = await fetch(`${API}${path}`, {
    ...rest,
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(optHeaders || {}),
    },
  });
  if (!res.ok) {
    let detail = await res.text();
    try {
      const j = JSON.parse(detail);
      if (j.error) detail = j.error;
    } catch {
      /* use text */
    }
    throw new Error(detail || res.statusText);
  }
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}
