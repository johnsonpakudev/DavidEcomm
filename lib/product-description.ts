const ALLOWED_TAGS = new Set(["p", "br", "strong", "em", "ul", "ol", "li", "a"]);

function stripDisallowedTags(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tagName: string) => {
    const tag = tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      return "";
    }

    if (tag === "a") {
      const hrefMatch = match.match(/\shref=(["'])(.*?)\1/i);

      if (!hrefMatch || !match.startsWith("<a")) {
        return "";
      }

      const href = hrefMatch[2] ?? "";

      if (/^(https?:|mailto:|tel:|#)/i.test(href)) {
        return `<a href="${href.replace(/"/g, "&quot;")}">`;
      }

      return "";
    }

    if (match.startsWith("</")) {
      return `</${tag}>`;
    }

    return tag === "br" ? "<br>" : `<${tag}>`;
  });
}

export function sanitizeProductDescription(html: string): string {
  if (!html.trim()) {
    return "";
  }

  const withoutScripts = html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=(["']).*?\1/gi, "");

  return stripDisallowedTags(withoutScripts).trim();
}
