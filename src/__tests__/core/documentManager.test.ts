import { DocumentManager } from '../../core/documentManager';
import { LocalStorage } from '../../storage/localStorage';
import { ContentType } from '../../types/content';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('DocumentManager', () => {
  let manager: DocumentManager;
  let storage: LocalStorage;
  let testDir: string;
  
  beforeEach(async () => {
    testDir = path.join(os.tmpdir(), `unbound-test-${Date.now()}`);
    storage = new LocalStorage({ basePath: testDir, autoBackup: false });
    await storage.initialize();
    manager = new DocumentManager(storage);
  });
  
  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  describe('Document creation', () => {
    it('should create a new document', async () => {
      const doc = await manager.createDocument('Test Document');
      
      expect(doc.id).toBeDefined();
      expect(doc.title).toBe('Test Document');
      expect(doc.version).toBe('1.0');
      expect(doc.content).toHaveLength(0);
    });
    
    it('should create document with initial content', async () => {
      const content = 'First paragraph\n\nSecond paragraph';
      const doc = await manager.createDocument('Test', content);
      
      expect(doc.content.length).toBeGreaterThan(0);
      expect(doc.metadata.wordCount).toBeGreaterThan(0);
    });
    
    it('should parse content into semantic nodes', async () => {
      const content = '# Heading\n\nParagraph text';
      const doc = await manager.createDocument('Test', content);
      
      expect(doc.content).toHaveLength(2);
      expect(doc.content[0].type).toBe(ContentType.HEADING);
      expect(doc.content[1].type).toBe(ContentType.PARAGRAPH);
    });
    
    it('should calculate metadata', async () => {
      const content = 'Hello world test document';
      const doc = await manager.createDocument('Test', content);
      
      expect(doc.metadata.wordCount).toBe(4);
      expect(doc.metadata.characterCount).toBeGreaterThan(0);
      expect(doc.metadata.created).toBeDefined();
      expect(doc.metadata.modified).toBeDefined();
    });
  });
  
  describe('Document loading', () => {
    it('should load an existing document', async () => {
      const created = await manager.createDocument('Test');
      const loaded = await manager.loadDocument(created.id);
      
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(created.id);
    });
    
    it('should return null for non-existent document', async () => {
      const loaded = await manager.loadDocument('non-existent');
      expect(loaded).toBeNull();
    });
  });
  
  describe('Document updates', () => {
    it('should update document content', async () => {
      const doc = await manager.createDocument('Test', 'Original content');
      const originalModified = doc.metadata.modified;
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const newContent = [
        {
          id: 'new-node',
          type: ContentType.PARAGRAPH,
          content: 'New content',
          metadata: {
            created: Date.now(),
            modified: Date.now(),
          },
        },
      ];
      
      const updated = await manager.updateDocument(doc.id, newContent);
      
      expect(updated.content).toHaveLength(1);
      expect(updated.content[0].content).toBe('New content');
      expect(updated.metadata.modified).toBeGreaterThan(originalModified);
    });
    
    it('should update document title', async () => {
      const doc = await manager.createDocument('Original Title');
      
      const updated = await manager.updateTitle(doc.id, 'New Title');
      
      expect(updated.title).toBe('New Title');
    });
    
    it('should recalculate metadata on update', async () => {
      const doc = await manager.createDocument('Test', 'Short');
      
      const longContent = [
        {
          id: 'node',
          type: ContentType.PARAGRAPH,
          content: 'This is a much longer piece of content with many more words',
          metadata: {
            created: Date.now(),
            modified: Date.now(),
          },
        },
      ];
      
      const updated = await manager.updateDocument(doc.id, longContent);
      
      expect(updated.metadata.wordCount).toBeGreaterThan(doc.metadata.wordCount);
    });
  });
  
  describe('Text import and export', () => {
    it('should import text with normalization', async () => {
      const text = 'Text\u200Bwith\uFEFFinvisible chars';
      const doc = await manager.importText('Imported', text, 'clipboard');
      
      // Should have normalized the invisible characters
      const exported = await manager.exportText(doc.id);
      expect(exported).not.toContain('\u200B');
      expect(exported).not.toContain('\uFEFF');
    });
    
    it('should export document as plain text', async () => {
      const doc = await manager.createDocument('Test', '# Heading\n\nParagraph');
      const text = await manager.exportText(doc.id);
      
      expect(text).toContain('# Heading');
      expect(text).toContain('Paragraph');
    });
    
    it('should apply source-aware normalization on import', async () => {
      const text = 'Test  content';
      
      const clipboardDoc = await manager.importText('Clipboard', text, 'clipboard');
      const fileDoc = await manager.importText('File', text, 'file');
      
      // Both should succeed but may normalize differently
      expect(clipboardDoc.id).toBeDefined();
      expect(fileDoc.id).toBeDefined();
    });
  });
  
  describe('Document management', () => {
    it('should delete a document', async () => {
      const doc = await manager.createDocument('Test');
      
      await manager.deleteDocument(doc.id);
      
      const loaded = await manager.loadDocument(doc.id);
      expect(loaded).toBeNull();
    });
    
    it('should list all documents', async () => {
      await manager.createDocument('Doc 1');
      await manager.createDocument('Doc 2');
      
      const list = await manager.listDocuments();
      
      expect(list.length).toBeGreaterThanOrEqual(2);
    });
  });
  
  describe('Semantic content structure', () => {
    it('should maintain semantic types', async () => {
      const content = '# Title\n\nParagraph one\n\nParagraph two';
      const doc = await manager.createDocument('Test', content);
      
      // Check semantic structure is maintained
      expect(doc.content[0].type).toBe(ContentType.HEADING);
      expect(doc.content[0].metadata.level).toBe(1);
      expect(doc.content[1].type).toBe(ContentType.PARAGRAPH);
    });
    
    it('should preserve content IDs', async () => {
      const doc = await manager.createDocument('Test', 'Content');
      const originalId = doc.content[0].id;
      
      const loaded = await manager.loadDocument(doc.id);
      
      expect(loaded?.content[0].id).toBe(originalId);
    });
  });
  
  describe('Non-intrusive behavior', () => {
    it('should not auto-format content', async () => {
      const content = 'Text  with   irregular    spacing';
      const doc = await manager.createDocument('Test', content);
      
      // Content should be normalized but meaning preserved
      const exported = await manager.exportText(doc.id);
      expect(exported.split(/\s+/).length).toBe(content.split(/\s+/).length);
    });
  });
});
