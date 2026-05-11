const rawApiBase = (import.meta.env.VITE_API_URL || '')
  .trim()
  .replace(/\/+$/, '');

/**
 * If VITE_API_URL is set to https://example.com/api but paths are /api/...,
 * concatenation would produce /api/api/... — strip a trailing /api from the base.
 */
function apiBaseFor(path) {
  if (!rawApiBase) return '';
  if (path.startsWith('/api/') && rawApiBase.endsWith('/api')) {
    return rawApiBase.slice(0, -4);
  }
  return rawApiBase;
}

export async function fetchJson(path, options = {}) {
  const { headers: optHeaders, ...rest } = options;
  const hasBody = rest.body != null;
  const base = apiBaseFor(path);
  const res = await fetch(`${base}${path}`, {
    ...rest,
    headers: {
      ...(hasBody ? { 'Content-Type': 'application/json' } : {}),
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
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  if (path.startsWith('/api')) {
    throw new Error(
      'API returned a non-JSON response. Check Nginx /api proxy and VITE_API_URL (use site origin only, not …/api).',
    );
  }
  return res.text();
}
