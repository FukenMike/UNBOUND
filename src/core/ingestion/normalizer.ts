/**
 * Text Normalization Module
 * 
 * Handles cleaning and normalizing raw text input before structural parsing.
 * This ensures consistent processing regardless of source format.
 */

/**
 * Normalize line endings to \n
 * Handles Windows (\r\n), Mac (\r), and Unix (\n) line endings
 */
export function normalizeLineEndings(text: string): string {
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Remove hard line wraps while preserving paragraph breaks
 * 
 * Strategy:
 * - A single newline within a paragraph is likely a hard wrap (remove it)
 * - Multiple newlines (blank lines) indicate paragraph breaks (preserve them)
 * - Lines ending with certain punctuation (. ! ? :) are likely paragraph ends
 * 
 * This is a heuristic approach that works well for most prose.
 */
export function removeHardWraps(text: string): string {
  const lines = text.split('\n');
  const result: string[] = [];
  let currentParagraph: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]?.trim() || '';
    const nextLine = i < lines.length - 1 ? (lines[i + 1]?.trim() || '') : '';
    
    // Empty line - paragraph break
    if (line === '') {
      if (currentParagraph.length > 0) {
        result.push(currentParagraph.join(' '));
        currentParagraph = [];
      }
      // Preserve the blank line
      result.push('');
      continue;
    }
    
    // Add line to current paragraph
    currentParagraph.push(line);
    
    // Check if this line ends a paragraph
    // Heuristics:
    // 1. Line ends with sentence-ending punctuation
    // 2. Next line is empty (handled above)
    // 3. Next line looks like a heading or special marker
    const endsWithPunctuation = /[.!?:"]$/.test(line);
    const nextLooksLikeHeading = /^(chapter|part|prologue|epilogue|\d+\.)/i.test(nextLine);
    const nextLooksLikeBreak = /^(\*\*\*|---|###|—{3})/.test(nextLine);
    
    if (endsWithPunctuation && (nextLine === '' || nextLooksLikeHeading || nextLooksLikeBreak)) {
      result.push(currentParagraph.join(' '));
      currentParagraph = [];
    }
  }
  
  // Add any remaining paragraph
  if (currentParagraph.length > 0) {
    result.push(currentParagraph.join(' '));
  }
  
  return result.join('\n');
}

/**
 * Normalize whitespace
 * - Trim leading/trailing whitespace from each line
 * - Collapse multiple spaces into single spaces
 * - Remove tabs (replace with spaces)
 */
export function normalizeWhitespace(text: string): string {
  return text
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '))
    .join('\n');
}

/**
 * Normalize spacing - collapse multiple blank lines into at most 2
 * (which typically represents a scene break or section break)
 */
export function normalizeSpacing(text: string): string {
  // Replace 3 or more consecutive newlines with exactly 2
  return text.replace(/\n{3,}/g, '\n\n');
}

/**
 * Full normalization pipeline
 * Applies all normalization steps in sequence
 */
export function normalizeText(text: string): string {
  let normalized = text;
  
  // Step 1: Normalize line endings
  normalized = normalizeLineEndings(normalized);
  
  // Step 2: Normalize whitespace within lines
  normalized = normalizeWhitespace(normalized);
  
  // Step 3: Remove hard wraps
  normalized = removeHardWraps(normalized);
  
  // Step 4: Normalize spacing between paragraphs
  normalized = normalizeSpacing(normalized);
  
  // Step 5: Final trim
  normalized = normalized.trim();
  
  return normalized;
}
