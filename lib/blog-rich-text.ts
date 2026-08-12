/**
 * Canonical rich-text contract for blog posts.
 *
 * `blog_post_translations.body_json` used to contain a mix of Lexical JSON,
 * hand-written `{ sections }` objects and HTML strings.  The admin editor is
 * TipTap, therefore this module makes a small, explicit TipTap-compatible
 * document the only format written from now on.  Legacy values are converted
 * when read; they are never rendered as arbitrary HTML.
 */

export type BlogRichTextMark = {
  type: "bold" | "italic" | "underline" | "strike" | "link";
  attrs?: { href?: string };
};

export type BlogRichTextNode = {
  type: string;
  attrs?: Record<string, unknown>;
  text?: string;
  marks?: BlogRichTextMark[];
  content?: BlogRichTextNode[];
};

export type BlogRichTextDocument = {
  type: "doc";
  content: BlogRichTextNode[];
};

export type BlogRichTextHeading = {
  id: string;
  level: 2 | 3;
  text: string;
};

const MAX_DOCUMENT_CHARACTERS = 50_000;
const MAX_DOCUMENT_NODES = 1_000;
const MAX_HEADING_LENGTH = 160;
const SAFE_LINK_PROTOCOLS = new Set(["http:", "https:", "mailto:", "tel:"]);

const emptyDocument = (): BlogRichTextDocument => ({ type: "doc", content: [] });

const asRecord = (value: unknown): Record<string, unknown> | null =>
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const asArray = (value: unknown): unknown[] => Array.isArray(value) ? value : [];

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function safeHref(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const candidate = value.trim();
  // Only root-relative paths are valid internal links. Protocol-relative URLs
  // (`//host`) must not bypass the external-link policy.
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  if (candidate.startsWith("#")) return candidate;
  try {
    const url = new URL(candidate);
    return SAFE_LINK_PROTOCOLS.has(url.protocol) ? candidate : undefined;
  } catch {
    return undefined;
  }
}

function safeImageSource(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" || url.protocol === "http:" ? value.trim() : undefined;
  } catch {
    return undefined;
  }
}

function safeTextAlign(value: unknown): "left" | "center" | "right" | "justify" | undefined {
  return value === "left" || value === "center" || value === "right" || value === "justify"
    ? value
    : undefined;
}

function normalizeMarks(value: unknown): BlogRichTextMark[] | undefined {
  const seen = new Set<string>();
  const marks: BlogRichTextMark[] = [];

  for (const rawMark of asArray(value)) {
    const mark = asRecord(rawMark);
    const type = mark?.type;
    if (type === "bold" || type === "italic" || type === "underline" || type === "strike") {
      if (!seen.has(type)) {
        marks.push({ type });
        seen.add(type);
      }
    }
    if (type === "link") {
      const href = safeHref(asRecord(mark?.attrs)?.href);
      if (href && !seen.has(`link:${href}`)) {
        marks.push({ type: "link", attrs: { href } });
        seen.add(`link:${href}`);
      }
    }
  }

  return marks.length > 0 ? marks : undefined;
}

function textNode(text: unknown, marks?: BlogRichTextMark[]): BlogRichTextNode | null {
  if (typeof text !== "string" || text.length === 0) return null;
  return {
    type: "text",
    text,
    ...(marks?.length ? { marks: marks.map((mark) => ({ ...mark, ...(mark.attrs ? { attrs: { ...mark.attrs } } : {}) })) } : {}),
  };
}

function inlineNodesFromTipTap(value: unknown): BlogRichTextNode[] {
  const output: BlogRichTextNode[] = [];
  for (const rawNode of asArray(value)) {
    const node = asRecord(rawNode);
    if (!node) continue;
    if (node.type === "text") {
      const text = textNode(node.text, normalizeMarks(node.marks));
      if (text) output.push(text);
    } else if (node.type === "hardBreak") {
      output.push({ type: "hardBreak" });
    }
  }
  return output;
}

function blockNodeFromTipTap(value: unknown): BlogRichTextNode | null {
  const node = asRecord(value);
  if (!node || typeof node.type !== "string") return null;

  switch (node.type) {
    case "paragraph": {
      const textAlign = safeTextAlign(asRecord(node.attrs)?.textAlign);
      return {
        type: "paragraph",
        ...(textAlign ? { attrs: { textAlign } } : {}),
        content: inlineNodesFromTipTap(node.content),
      };
    }
    case "heading": {
      const attrs = asRecord(node.attrs);
      const requestedLevel = Number(attrs?.level);
      const level: 2 | 3 = requestedLevel === 3 ? 3 : 2;
      const textAlign = safeTextAlign(attrs?.textAlign);
      return {
        type: "heading",
        attrs: { level, ...(textAlign ? { textAlign } : {}) },
        content: inlineNodesFromTipTap(node.content),
      };
    }
    case "blockquote":
      return {
        type: "blockquote",
        content: asArray(node.content).map(blockNodeFromTipTap).filter((item): item is BlogRichTextNode => Boolean(item)),
      };
    case "bulletList":
    case "orderedList":
      return {
        type: node.type,
        content: asArray(node.content).map(blockNodeFromTipTap).filter((item): item is BlogRichTextNode => Boolean(item)),
      };
    case "listItem":
      return {
        type: "listItem",
        content: asArray(node.content).map(blockNodeFromTipTap).filter((item): item is BlogRichTextNode => Boolean(item)),
      };
    case "image": {
      const attrs = asRecord(node.attrs);
      const src = safeImageSource(attrs?.src);
      if (!src) return null;
      return {
        type: "image",
        attrs: {
          src,
          alt: typeof attrs?.alt === "string" ? attrs.alt.slice(0, 250) : "",
        },
      };
    }
    default:
      return null;
  }
}

function headingSlug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72);
}

export function richTextToPlainText(value: BlogRichTextNode | BlogRichTextDocument | unknown): string {
  const node = asRecord(value);
  if (!node) return "";
  const ownText = typeof node.text === "string" ? node.text : "";
  return ownText + asArray(node.content).map((child) => richTextToPlainText(child)).join("");
}

function escapeHtml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;");
}

/**
 * A constrained HTML projection used only when asking the existing translation
 * service to preserve structure. It never serializes arbitrary attributes.
 */
export function blogRichTextToHtml(value: BlogRichTextDocument | unknown): string {
  const document = normalizeBlogRichText(value);
  const inline = (nodes: BlogRichTextNode[] | undefined): string => (nodes ?? []).map((node) => {
    if (node.type === "hardBreak") return "<br>";
    if (node.type !== "text") return "";
    let output = escapeHtml(node.text ?? "");
    for (const mark of node.marks ?? []) {
      if (mark.type === "bold") output = `<strong>${output}</strong>`;
      if (mark.type === "italic") output = `<em>${output}</em>`;
      if (mark.type === "underline") output = `<u>${output}</u>`;
      if (mark.type === "strike") output = `<s>${output}</s>`;
      if (mark.type === "link" && mark.attrs?.href) output = `<a href="${escapeHtml(mark.attrs.href)}">${output}</a>`;
    }
    return output;
  }).join("");
  const blocks = (nodes: BlogRichTextNode[] | undefined): string => (nodes ?? []).map((node) => {
    if (node.type === "paragraph") return `<p>${inline(node.content)}</p>`;
    if (node.type === "heading") return Number(node.attrs?.level) === 3 ? `<h3>${inline(node.content)}</h3>` : `<h2>${inline(node.content)}</h2>`;
    if (node.type === "blockquote") return `<blockquote>${blocks(node.content)}</blockquote>`;
    if (node.type === "bulletList") return `<ul>${blocks(node.content)}</ul>`;
    if (node.type === "orderedList") return `<ol>${blocks(node.content)}</ol>`;
    if (node.type === "listItem") return `<li>${blocks(node.content)}</li>`;
    if (node.type === "image" && typeof node.attrs?.src === "string") return `<img src="${escapeHtml(node.attrs.src)}" alt="${escapeHtml(typeof node.attrs.alt === "string" ? node.attrs.alt : "")}">`;
    return "";
  }).join("");
  return blocks(document.content);
}

function lexicalMarks(format: unknown): BlogRichTextMark[] | undefined {
  const bitmask = typeof format === "number" ? format : 0;
  const marks: BlogRichTextMark[] = [];
  if (bitmask & 1) marks.push({ type: "bold" });
  if (bitmask & 2) marks.push({ type: "italic" });
  if (bitmask & 4) marks.push({ type: "strike" });
  if (bitmask & 8) marks.push({ type: "underline" });
  return marks.length ? marks : undefined;
}

function lexicalInlineNodes(value: unknown): BlogRichTextNode[] {
  const nodes: BlogRichTextNode[] = [];
  for (const rawNode of asArray(value)) {
    const node = asRecord(rawNode);
    if (!node) continue;
    if (node.type === "text") {
      const text = textNode(node.text, lexicalMarks(node.format));
      if (text) nodes.push(text);
    } else if (node.type === "linebreak") {
      nodes.push({ type: "hardBreak" });
    } else if (node.type === "link") {
      const href = safeHref(node.url);
      const children = lexicalInlineNodes(node.children);
      nodes.push(...children.map((child): BlogRichTextNode => {
        if (child.type !== "text" || !href) return child;
        return {
          ...child,
          marks: [...(child.marks ?? []), { type: "link" as const, attrs: { href } }],
        };
      }));
    } else {
      nodes.push(...lexicalInlineNodes(node.children));
    }
  }
  return nodes;
}

function lexicalBlocks(value: unknown): BlogRichTextNode[] {
  const blocks: BlogRichTextNode[] = [];
  for (const rawNode of asArray(value)) {
    const node = asRecord(rawNode);
    if (!node) continue;
    const children = node.children;
    if (node.type === "paragraph") {
      blocks.push({ type: "paragraph", content: lexicalInlineNodes(children) });
    } else if (node.type === "heading") {
      blocks.push({
        type: "heading",
        attrs: { level: node.tag === "h3" ? 3 : 2 },
        content: lexicalInlineNodes(children),
      });
    } else if (node.type === "quote") {
      blocks.push({ type: "blockquote", content: lexicalBlocks(children) });
    } else if (node.type === "list") {
      const listType = node.listType === "number" ? "orderedList" : "bulletList";
      blocks.push({
        type: listType,
        content: asArray(children).map((item) => ({ type: "listItem", content: lexicalBlocks(asRecord(item)?.children) })),
      });
    } else if (node.type === "listitem") {
      blocks.push({ type: "listItem", content: lexicalBlocks(children) });
    } else if (node.type === "text") {
      const inline = lexicalInlineNodes([node]);
      if (inline.length) blocks.push({ type: "paragraph", content: inline });
    } else {
      blocks.push(...lexicalBlocks(children));
    }
  }
  return blocks;
}

function htmlInlineNodes(html: string): BlogRichTextNode[] {
  const nodes: BlogRichTextNode[] = [];
  const markStack: BlogRichTextMark[] = [];
  const tokens = html.split(/(<[^>]+>)/g).filter(Boolean);

  for (const token of tokens) {
    if (!token.startsWith("<")) {
      const text = textNode(decodeHtml(token), markStack);
      if (text) nodes.push(text);
      continue;
    }

    const closing = /^<\//.test(token);
    const match = /^<\/?\s*([a-z0-9]+)/i.exec(token);
    const tag = match?.[1]?.toLowerCase();
    if (!tag) continue;
    if (tag === "br") {
      nodes.push({ type: "hardBreak" });
      continue;
    }

    const markType = tag === "b" || tag === "strong" ? "bold"
      : tag === "i" || tag === "em" ? "italic"
      : tag === "u" ? "underline"
      : tag === "s" || tag === "strike" || tag === "del" ? "strike"
      : tag === "a" ? "link"
      : null;
    if (!markType) continue;

    if (closing) {
      for (let index = markStack.length - 1; index >= 0; index--) {
        if (markStack[index].type === markType) {
          markStack.splice(index, 1);
          break;
        }
      }
    } else if (markType === "link") {
      const href = safeHref(/\bhref\s*=\s*["']([^"']+)["']/i.exec(token)?.[1]);
      if (href) markStack.push({ type: "link", attrs: { href } });
    } else {
      markStack.push({ type: markType });
    }
  }

  return nodes;
}

function htmlBlocks(value: string): BlogRichTextNode[] {
  const blocks: BlogRichTextNode[] = [];
  const pattern = /<(h[1-3]|p|blockquote|ul|ol)\b[^>]*>([\s\S]*?)<\/\1>|<img\b([^>]*)\/?\s*>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  const appendPlainText = (text: string) => {
    const plain = decodeHtml(text.replace(/<[^>]*>/g, "")).trim();
    if (plain) blocks.push({ type: "paragraph", content: [textNode(plain)!] });
  };

  while ((match = pattern.exec(value)) !== null) {
    appendPlainText(value.slice(cursor, match.index));
    cursor = match.index + match[0].length;
    const tag = match[1]?.toLowerCase();
    if (!tag) {
      const attrs = match[3] ?? "";
      const src = safeImageSource(/\bsrc\s*=\s*["']([^"']+)["']/i.exec(attrs)?.[1]);
      if (src) {
        blocks.push({
          type: "image",
          attrs: { src, alt: decodeHtml(/\balt\s*=\s*["']([^"']*)["']/i.exec(attrs)?.[1] ?? "").slice(0, 250) },
        });
      }
      continue;
    }

    const inner = match[2] ?? "";
    if (tag === "h1" || tag === "h2" || tag === "h3") {
      blocks.push({ type: "heading", attrs: { level: tag === "h3" ? 3 : 2 }, content: htmlInlineNodes(inner) });
    } else if (tag === "p") {
      blocks.push({ type: "paragraph", content: htmlInlineNodes(inner) });
    } else if (tag === "blockquote") {
      blocks.push({ type: "blockquote", content: [{ type: "paragraph", content: htmlInlineNodes(inner) }] });
    } else {
      const itemPattern = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
      const items: BlogRichTextNode[] = [];
      let item: RegExpExecArray | null;
      while ((item = itemPattern.exec(inner)) !== null) {
        items.push({ type: "listItem", content: [{ type: "paragraph", content: htmlInlineNodes(item[1]) }] });
      }
      if (items.length) blocks.push({ type: tag === "ol" ? "orderedList" : "bulletList", content: items });
    }
  }

  appendPlainText(value.slice(cursor));
  if (!blocks.length) {
    const plain = decodeHtml(value.replace(/<[^>]*>/g, "")).trim();
    if (plain) blocks.push({ type: "paragraph", content: [textNode(plain)!] });
  }
  return blocks;
}

function localizedLegacyValue(value: unknown, locale: "vi" | "en"): string {
  if (typeof value === "string") return value;
  const record = asRecord(value);
  if (!record) return "";
  return typeof record[locale] === "string"
    ? record[locale] as string
    : typeof record.vi === "string"
      ? record.vi
      : typeof record.en === "string"
        ? record.en
        : "";
}

function sectionsToDocument(value: Record<string, unknown>, locale: "vi" | "en"): BlogRichTextDocument {
  const content: BlogRichTextNode[] = [];
  for (const rawSection of asArray(value.sections)) {
    const section = asRecord(rawSection);
    if (!section) continue;
    const tag = section.tag === "h3" ? "h3" : section.tag === "h2" ? "h2" : null;
    const title = localizedLegacyValue(section.title, locale).trim();
    if (tag && title) {
      content.push({ type: "heading", attrs: { level: tag === "h3" ? 3 : 2 }, content: [textNode(title)!] });
    }
    content.push(...htmlBlocks(localizedLegacyValue(section.body, locale)));
  }
  return { type: "doc", content };
}

/** Convert TipTap, legacy Lexical, legacy sections and HTML into one safe document. */
export function normalizeBlogRichText(value: unknown, locale: "vi" | "en" = "vi"): BlogRichTextDocument {
  const record = asRecord(value);
  let document: BlogRichTextDocument;

  if (record?.type === "doc") {
    document = {
      type: "doc",
      content: asArray(record.content).map(blockNodeFromTipTap).filter((node): node is BlogRichTextNode => Boolean(node)),
    };
  } else if (record?.root) {
    document = { type: "doc", content: lexicalBlocks(asRecord(record.root)?.children) };
  } else if (Array.isArray(record?.sections)) {
    document = sectionsToDocument(record, locale);
  } else if (typeof record?.html === "string") {
    document = { type: "doc", content: htmlBlocks(record.html) };
  } else if (typeof value === "string") {
    document = { type: "doc", content: htmlBlocks(value) };
  } else {
    document = emptyDocument();
  }

  return document;
}

export function getBlogRichTextHeadings(value: BlogRichTextDocument): BlogRichTextHeading[] {
  const headings: BlogRichTextHeading[] = [];
  const occurrences = new Map<string, number>();
  const visit = (nodes: BlogRichTextNode[]) => {
    for (const node of nodes) {
      if (node.type === "heading") {
        const level = Number(node.attrs?.level) === 3 ? 3 : 2;
        const text = richTextToPlainText(node).trim();
        const base = headingSlug(text) || "muc";
        const occurrence = (occurrences.get(base) ?? 0) + 1;
        occurrences.set(base, occurrence);
        const id = occurrence === 1 ? base : `${base}-${occurrence}`;
        if (text && id) headings.push({ id, level, text });
      }
      if (node.content) visit(node.content);
    }
  };
  visit(value.content);
  return headings;
}

export function hasMeaningfulBlogRichText(value: unknown): boolean {
  return richTextToPlainText(normalizeBlogRichText(value)).trim().length > 0;
}

export function validateBlogRichText(value: unknown): { document: BlogRichTextDocument; errors: string[] } {
  const document = normalizeBlogRichText(value);
  const errors: string[] = [];
  const text = richTextToPlainText(document).trim();
  let nodes = 0;
  let previousHeadingLevel: number | null = null;

  const visit = (items: BlogRichTextNode[]) => {
    for (const item of items) {
      nodes++;
      if (item.type === "heading") {
        const level = Number(item.attrs?.level) === 3 ? 3 : 2;
        const title = richTextToPlainText(item).trim();
        if (!title) errors.push("Tiêu đề H2/H3 không được để trống.");
        if (title.length > MAX_HEADING_LENGTH) errors.push("Tiêu đề H2/H3 không được vượt quá 160 ký tự.");
        if (level === 3 && previousHeadingLevel === null) {
          errors.push("H3 phải nằm sau ít nhất một H2.");
        }
        previousHeadingLevel = level;
      }
      if (item.content) visit(item.content);
    }
  };
  visit(document.content);

  if (!text) errors.push("Nội dung bài viết không được để trống.");
  if (text.length > MAX_DOCUMENT_CHARACTERS) errors.push("Nội dung bài viết vượt quá giới hạn 50.000 ký tự.");
  if (nodes > MAX_DOCUMENT_NODES) errors.push("Nội dung bài viết có cấu trúc quá phức tạp.");
  return { document, errors: [...new Set(errors)] };
}
