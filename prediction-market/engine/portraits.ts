// Free-media portraits from Wikipedia's REST summary API.
const cache: Record<string, string> = {};
export async function portrait(fullName: string): Promise<string | null> {
  if (cache[fullName]) return cache[fullName];
  try {
    const r = await fetch("https://en.wikipedia.org/api/rest_v1/page/summary/" + encodeURIComponent(fullName.replace(/ /g, "_")));
    const j = await r.json();
    if (j && j.thumbnail && j.thumbnail.source) { cache[fullName] = j.thumbnail.source; return j.thumbnail.source; }
  } catch { /* */ }
  return null;
}
export function initials(name: string): string {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2);
}
