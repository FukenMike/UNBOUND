/**
 * Intelligent text normalization without altering meaning
 * Focuses on cleaning and standardizing input while preserving author intent
 */

export interface NormalizationOptions {
  /**
   * Normalize whitespace (collapse multiple spaces, trim, etc.)
   */
  normalizeWhitespace?: boolean;
  
  /**
   * Normalize line endings to consistent format
   */
  normalizeLineEndings?: boolean;
  
  /**
   * Remove zero-width characters and other invisible unicode
   */
  removeInvisibleChars?: boolean;
  
  /**
   * Normalize quotation marks to consistent style
   */
  normalizeQuotes?: boolean;
  
  /**
   * Normalize dashes and hyphens
   */
  normalizeDashes?: boolean;
  
  /**
   * Preserve intentional formatting (multiple newlines, indentation)
   */
  preserveIntentionalFormatting?: boolean;
}

export class TextNormalizer {
  private options: Required<NormalizationOptions>;
  
  constructor(options: NormalizationOptions = {}) {
    this.options = {
      normalizeWhitespace: options.normalizeWhitespace ?? true,
      normalizeLineEndings: options.normalizeLineEndings ?? true,
      removeInvisibleChars: options.removeInvisibleChars ?? true,
      normalizeQuotes: options.normalizeQuotes ?? false,
      normalizeDashes: options.normalizeDashes ?? false,
      preserveIntentionalFormatting: options.preserveIntentionalFormatting ?? true,
    };
  }
  
  /**
   * Normalize text according to configured options
   * Non-intrusive: only cleans up technical issues, doesn't alter meaning
   */
  normalize(text: string): string {
    let normalized = text;
    
    if (this.options.removeInvisibleChars) {
      normalized = this.removeInvisibleCharacters(normalized);
    }
    
    if (this.options.normalizeLineEndings) {
      normalized = this.normalizeLineEndings(normalized);
    }
    
    if (this.options.normalizeWhitespace) {
      normalized = this.normalizeWhitespace(normalized);
    }
    
    if (this.options.normalizeQuotes) {
      normalized = this.normalizeQuotes(normalized);
    }
    
    if (this.options.normalizeDashes) {
      normalized = this.normalizeDashes(normalized);
    }
    
    return normalized;
  }
  
  /**
   * Remove zero-width and other problematic invisible characters
   * These often come from copy-paste from web or other sources
   */
  private removeInvisibleCharacters(text: string): string {
    return text
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Zero-width chars
      .replace(/\u00A0/g, ' ') // Non-breaking space to regular space
      .replace(/[\u2028\u2029]/g, '\n'); // Line/paragraph separators to newline
  }
  
  /**
   * Normalize line endings to \n (Unix style)
   * Consistent storage regardless of platform
   */
  private normalizeLineEndings(text: string): string {
    return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }
  
  /**
   * Normalize whitespace without destroying intentional formatting
   */
  private normalizeWhitespace(text: string): string {
    if (this.options.preserveIntentionalFormatting) {
      // Only normalize excessive spaces within lines
      // Preserve paragraph breaks (double newlines) and intentional indentation
      return text
        .split('\n')
        .map(line => {
          // Preserve leading whitespace if it appears intentional (indentation)
          const leadingWhitespace = line.match(/^\s*/)?.[0] || '';
          const content = line.slice(leadingWhitespace.length);
          
          // Collapse multiple spaces in content, but preserve single spaces
          const normalizedContent = content.replace(/  +/g, ' ');
          
          return leadingWhitespace + normalizedContent;
        })
        .join('\n');
    } else {
      // More aggressive normalization
      return text.replace(/  +/g, ' ').trim();
    }
  }
  
  /**
   * Normalize quotes to smart quotes consistently
   * Only if explicitly requested - this alters presentation
   */
  private normalizeQuotes(text: string): string {
    // This is conservative and only fixes obvious issues
    return text
      .replace(/``/g, '"') // Double backticks to opening quote
      .replace(/''/g, '"'); // Double single quotes to closing quote
  }
  
  /**
   * Normalize dashes and hyphens
   * Only if explicitly requested
   */
  private normalizeDashes(text: string): string {
    // Replace em-dash variants with proper em-dash
    return text
      .replace(/--/g, '—') // Double hyphen to em-dash
      .replace(/\s-\s/g, ' — '); // Spaced hyphen to spaced em-dash
  }
  
  /**
   * Ingest text from various sources and normalize appropriately
   * Detects source characteristics and applies appropriate normalization
   */
  static ingestFrom(text: string, source: 'clipboard' | 'file' | 'direct'): string {
    const options: NormalizationOptions = {
      normalizeWhitespace: true,
      normalizeLineEndings: true,
      removeInvisibleChars: true,
      preserveIntentionalFormatting: true,
    };
    
    // More aggressive cleaning for clipboard (often has web artifacts)
    if (source === 'clipboard') {
      options.removeInvisibleChars = true;
      options.normalizeWhitespace = true;
    }
    
    // Preserve more for files (author's saved format)
    if (source === 'file') {
      options.normalizeWhitespace = false;
      options.preserveIntentionalFormatting = true;
    }
    
    const normalizer = new TextNormalizer(options);
    return normalizer.normalize(text);
  }
}
