/** Повертає URL для iframe embed (YouTube), або null якщо це не впізнане YouTube-посилання. */
export function getYoutubeEmbedSrcFromUrl(raw: string): string | null {
  const url = raw.trim();
  if (!url) return null;
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    if (host === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) {
        return `https://www.youtube-nocookie.com/embed/${id}`;
      }
    }
    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = u.searchParams.get("v");
      if (v) {
        return `https://www.youtube-nocookie.com/embed/${v}`;
      }
      const m = u.pathname.match(/^\/embed\/([^/?#]+)/);
      if (m?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${m[1]}`;
      }
      const s = u.pathname.match(/^\/shorts\/([^/?#]+)/);
      if (s?.[1]) {
        return `https://www.youtube-nocookie.com/embed/${s[1]}`;
      }
    }
  } catch {
    return null;
  }
  return null;
}
