/**
 * Renders one or more schema.org objects as <script type="application/ld+json">.
 * Server Component — safe to place anywhere in the page body. The `<` escaping
 * prevents a "</script>" sequence inside data from breaking out of the tag.
 */
export function JsonLd({ data }: { data: unknown | unknown[] }) {
  const items = Array.isArray(data) ? data : [data];
  return (
    <>
      {items.filter(Boolean).map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(item).replace(/</g, "\\u003c"),
          }}
        />
      ))}
    </>
  );
}
