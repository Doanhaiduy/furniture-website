/**
 * Robust "copy text to clipboard" helper.
 *
 * The async Clipboard API (`navigator.clipboard`) is ONLY exposed in a
 * secure context — i.e. HTTPS or `localhost`. On a plain-HTTP deployment
 * (e.g. an IP-address VPS such as http://103.228.74.240) `navigator.clipboard`
 * is `undefined`, so `navigator.clipboard.writeText(...)` throws a TypeError and
 * every copy/share button silently fails.
 *
 * This helper tries the modern API first and transparently falls back to the
 * legacy `document.execCommand("copy")` + hidden-textarea technique, which works
 * in non-secure contexts and older browsers.
 *
 * @returns `true` when the text was copied, `false` otherwise.
 */
export async function copyTextToClipboard(text: string): Promise<boolean> {
  // Preferred path: async Clipboard API (needs a secure context + permission).
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Permission denied / not allowed — fall through to the legacy path.
    }
  }

  if (typeof document === "undefined") return false;

  // Legacy fallback: works on plain HTTP and older browsers.
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    // Keep it visually hidden but still selectable; avoid scroll jump / iOS zoom.
    textarea.style.position = "fixed";
    textarea.style.top = "0";
    textarea.style.left = "0";
    textarea.style.width = "1px";
    textarea.style.height = "1px";
    textarea.style.padding = "0";
    textarea.style.border = "none";
    textarea.style.outline = "none";
    textarea.style.boxShadow = "none";
    textarea.style.background = "transparent";
    textarea.style.opacity = "0";
    textarea.style.fontSize = "16px"; // prevents zoom-on-focus on iOS Safari
    document.body.appendChild(textarea);

    // Preserve any existing user selection so we can restore it afterwards.
    const selection = document.getSelection();
    const savedRange =
      selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

    textarea.focus();
    textarea.select();
    // iOS Safari needs an explicit range.
    textarea.setSelectionRange(0, text.length);

    const succeeded = document.execCommand("copy");
    document.body.removeChild(textarea);

    if (savedRange && selection) {
      selection.removeAllRanges();
      selection.addRange(savedRange);
    }

    return succeeded;
  } catch {
    return false;
  }
}
