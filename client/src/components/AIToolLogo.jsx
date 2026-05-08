import { useState } from "react";

function hostnameForFavicon(t) {
  if (t.logoHost) {
    return String(t.logoHost).replace(/^www\./, "");
  }
  try {
    return new URL(t.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function faviconUrl(t) {
  const host = hostnameForFavicon(t);
  if (!host) return null;
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

export default function AIToolLogo({ name, tool }) {
  const [ok, setOk] = useState(true);
  const src = faviconUrl(tool);
  if (!ok || !src) {
    return (
      <div className="ai-tool-logo ai-tool-logo--ph" aria-hidden>
        {String(name).charAt(0).toUpperCase()}
      </div>
    );
  }
  return (
    <img
      className="ai-tool-logo"
      src={src}
      width={40}
      height={40}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}
