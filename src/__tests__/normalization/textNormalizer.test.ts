import { TextNormalizer } from '../../normalization/textNormalizer';

describe('TextNormalizer', () => {
  describe('Basic normalization', () => {
    it('should remove invisible characters', () => {
      const normalizer = new TextNormalizer({
        removeInvisibleChars: true,
      });
      
      const input = 'Hello\u200BWorld\uFEFF';
      const result = normalizer.normalize(input);
      
      expect(result).toBe('HelloWorld');
    });
    
    it('should normalize line endings', () => {
      const normalizer = new TextNormalizer({
        normalizeLineEndings: true,
      });
      
      const input = 'Line1\r\nLine2\rLine3\nLine4';
      const result = normalizer.normalize(input);
      
      expect(result).toBe('Line1\nLine2\nLine3\nLine4');
    });
    
    it('should normalize whitespace while preserving intentional formatting', () => {
      const normalizer = new TextNormalizer({
        normalizeWhitespace: true,
        preserveIntentionalFormatting: true,
      });
      
      const input = 'Text  with   excessive    spaces\n  Indented line';
      const result = normalizer.normalize(input);
      
      // Should collapse excessive spaces but preserve indentation
      expect(result).toContain('Text with excessive spaces');
      expect(result).toContain('  Indented line');
    });
    
    it('should not alter content meaning', () => {
      const normalizer = new TextNormalizer({
        normalizeWhitespace: true,
        normalizeLineEndings: true,
        removeInvisibleChars: true,
      });
      
      const input = 'The quick brown fox jumps over the lazy dog.';
      const result = normalizer.normalize(input);
      
      expect(result).toBe(input);
    });
  });
  
  describe('Source-aware ingestion', () => {
    it('should handle clipboard source with aggressive cleaning', () => {
      const text = 'Text\u200Bwith\uFEFFinvisible  chars';
      const result = TextNormalizer.ingestFrom(text, 'clipboard');
      
      expect(result).not.toContain('\u200B');
      expect(result).not.toContain('\uFEFF');
    });
    
    it('should preserve more for file source', () => {
      const text = 'File  content\n\nWith  spacing';
      const result = TextNormalizer.ingestFrom(text, 'file');
      
      // Should still have structure but normalized line endings
      expect(result).toContain('\n\n');
    });
  });
  
  describe('Preservation of intent', () => {
    it('should preserve paragraph breaks', () => {
      const normalizer = new TextNormalizer({
        preserveIntentionalFormatting: true,
      });
      
      const input = 'Paragraph 1\n\nParagraph 2\n\nParagraph 3';
      const result = normalizer.normalize(input);
      
      expect(result.match(/\n\n/g)?.length).toBe(2);
    });
    
    it('should preserve intentional indentation', () => {
      const normalizer = new TextNormalizer({
        normalizeWhitespace: true,
        preserveIntentionalFormatting: true,
      });
      
      const input = '    Indented line\nNormal line';
      const result = normalizer.normalize(input);
      
      expect(result).toContain('    Indented line');
    });
  });
  
  describe('Optional transformations', () => {
    it('should not normalize quotes by default', () => {
      const normalizer = new TextNormalizer();
      
      const input = 'Text with `` quotes';
      const result = normalizer.normalize(input);
      
      expect(result).toBe(input);
    });
    
    it('should normalize quotes when enabled', () => {
      const normalizer = new TextNormalizer({
        normalizeQuotes: true,
      });
      
      const input = 'Text with `` quotes';
      const result = normalizer.normalize(input);
      
      expect(result).toContain('"');
    });
    
    it('should not normalize dashes by default', () => {
      const normalizer = new TextNormalizer();
      
      const input = 'Text -- with dashes';
      const result = normalizer.normalize(input);
      
      expect(result).toBe(input);
    });
    
    it('should normalize dashes when enabled', () => {
      const normalizer = new TextNormalizer({
        normalizeDashes: true,
      });
      
      const input = 'Text -- with dashes';
      const result = normalizer.normalize(input);
      
      expect(result).toContain('—');
    });
  });
});
