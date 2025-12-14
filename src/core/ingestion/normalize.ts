/**
 * Normalization utilities for raw text ingestion.
 * Responsibilities:
 * - Normalize line endings to "\n".
 * - Trim trailing spaces and collapse excessive blank lines.
 * - Remove hard wraps inside paragraphs while preserving paragraph breaks.
 */

/** Normalize line endings to "\n" and remove carriage returns. */
export function normalizeLineEndings(input: string): string {
  return input.replace(/\r\n?/g, "\n");
}

/** Trim trailing spaces per line and collapse multiple blank lines to max 2. */
export function normalizeWhitespace(input: string): string {
  const lines = input.split("\n").map(l => l.replace(/[\t ]+$/g, ""));
  // Collapse 3+ blank lines down to 2 to be conservative for front/back matter spacing.
  const result: string[] = [];
  let blankCount = 0;
  for (const line of lines) {
    if (line.trim().length === 0) {
      blankCount++;
      if (blankCount <= 2) result.push("");
    } else {
      blankCount = 0;
      result.push(line);
    }
  }
  return result.join("\n");
}

/**
 * Remove hard wraps within paragraphs by joining lines that are part of the same paragraph.
 * Heuristic: consecutive non-empty lines are considered a paragraph unless headers or scene breaks.
 */
export function unwrapHardWraps(input: string): string {
  const lines = input.split("\n");
  const out: string[] = [];
  let buffer: string[] = [];

  const flush = () => {
    if (buffer.length > 0) {
      // Join with single spaces to reconstruct paragraph.
      out.push(buffer.join(" ").replace(/[ ]{2,}/g, " "));
      buffer = [];
    }
  };

  const isSceneBreak = (l: string) => /^(\*\*\*|---|\*\s\*\s\*|\*\*\*\s*)$/.test(l.trim());
  const isProbableHeading = (l: string) => {
    const t = l.trim();
    if (t.length === 0) return false;
    // All-caps short lines likely headings, or lines starting with Chapter
    if (/^chapter\b/i.test(t)) return true;
    if (/^part\b/i.test(t)) return true;
    if (/^(prologue|epilogue)\b/i.test(t)) return true;
    if (/^\d+\.?\s*$/i.test(t)) return true; // standalone number
    if (t.length <= 60 && t === t.toUpperCase() && /[A-Z]/.test(t)) return true;
    return false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.length === 0) {
      // Paragraph break
      flush();
      out.push("");
      continue;
    }

    if (isSceneBreak(line) || isProbableHeading(line)) {
      // Treat as standalone block boundary
      flush();
      out.push(line.trim());
      continue;
    }

    // Part of paragraph
    buffer.push(trimmed);
  }

  flush();
  return out.join("\n");
}

/** Full normalization pipeline. */
export function normalizeRawText(input: string): string {
  const step1 = normalizeLineEndings(input);
  const step2 = normalizeWhitespace(step1);
  const step3 = unwrapHardWraps(step2);
  return step3;
}
