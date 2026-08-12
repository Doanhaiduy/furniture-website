import type { ReactNode } from "react";
import {
  getBlogRichTextHeadings,
  normalizeBlogRichText,
  type BlogRichTextDocument,
  type BlogRichTextMark,
  type BlogRichTextNode,
} from "@/lib/blog-rich-text";

function renderMarkedText(text: string, marks: BlogRichTextMark[] | undefined, key: string): ReactNode {
  let output: ReactNode = text;
  for (const [index, mark] of (marks ?? []).entries()) {
    const markKey = `${key}-mark-${index}`;
    if (mark.type === "bold") output = <strong key={markKey}>{output}</strong>;
    if (mark.type === "italic") output = <em key={markKey}>{output}</em>;
    if (mark.type === "underline") output = <u key={markKey}>{output}</u>;
    if (mark.type === "strike") output = <s key={markKey}>{output}</s>;
    if (mark.type === "link" && mark.attrs?.href) {
      const external = /^https?:\/\//i.test(mark.attrs.href);
      output = (
        <a key={markKey} href={mark.attrs.href} {...(external ? { target: "_blank", rel: "noreferrer noopener" } : {})}>
          {output}
        </a>
      );
    }
  }
  return output;
}

function renderInline(nodes: BlogRichTextNode[] | undefined, keyPrefix: string): ReactNode[] {
  return (nodes ?? []).map((node, index) => {
    const key = `${keyPrefix}-${index}`;
    if (node.type === "hardBreak") return <br key={key} />;
    if (node.type === "text") return <span key={key}>{renderMarkedText(node.text ?? "", node.marks, key)}</span>;
    return null;
  });
}

function renderDocument(document: BlogRichTextDocument): ReactNode[] {
  const headings = getBlogRichTextHeadings(document);
  let headingIndex = 0;

  const renderNode = (node: BlogRichTextNode, key: string): ReactNode => {
    const childBlocks = node.content?.map((child, index) => renderNode(child, `${key}-${index}`));
    const textAlign = node.attrs?.textAlign;
    const alignmentClass = textAlign === "center" ? "text-center"
      : textAlign === "right" ? "text-right"
      : textAlign === "justify" ? "text-justify"
      : textAlign === "left" ? "text-left"
      : undefined;
    switch (node.type) {
      case "paragraph":
        return <p key={key} className={alignmentClass}>{renderInline(node.content, key)}</p>;
      case "heading": {
        const id = headings[headingIndex++]?.id;
        return Number(node.attrs?.level) === 3
          ? <h3 key={key} id={id} className={alignmentClass}>{renderInline(node.content, key)}</h3>
          : <h2 key={key} id={id} className={alignmentClass}>{renderInline(node.content, key)}</h2>;
      }
      case "bulletList":
        return <ul key={key}>{childBlocks}</ul>;
      case "orderedList":
        return <ol key={key}>{childBlocks}</ol>;
      case "listItem":
        return <li key={key}>{childBlocks}</li>;
      case "blockquote":
        return <blockquote key={key}>{childBlocks}</blockquote>;
      case "image":
        return (
          <figure key={key} className="rich-content-image">
            {/* The source is allowlisted during document normalization. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={String(node.attrs?.src ?? "")} alt={typeof node.attrs?.alt === "string" ? node.attrs.alt : ""} />
          </figure>
        );
      default:
        return null;
    }
  };

  return document.content.map((node, index) => renderNode(node, `node-${index}`));
}

/** Safe public/admin-preview renderer for the canonical blog document. */
export function BlogRichTextRenderer({
  document,
  className = "",
}: {
  document: BlogRichTextDocument | unknown;
  className?: string;
}) {
  const normalized = normalizeBlogRichText(document);
  return (
    <div className={`rich-content ${className}`.trim()}>
      {renderDocument(normalized)}
    </div>
  );
}

export function getBlogTocItems(document: BlogRichTextDocument | unknown) {
  return getBlogRichTextHeadings(normalizeBlogRichText(document));
}
