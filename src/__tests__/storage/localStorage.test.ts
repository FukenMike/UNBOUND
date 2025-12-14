import { LocalStorage } from '../../storage/localStorage';
import { Document, ContentType } from '../../types/content';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

describe('LocalStorage', () => {
  let storage: LocalStorage;
  let testDir: string;
  
  beforeEach(async () => {
    // Create temporary test directory
    testDir = path.join(os.tmpdir(), `unbound-test-${Date.now()}`);
    storage = new LocalStorage({ basePath: testDir, autoBackup: false });
    await storage.initialize();
  });
  
  afterEach(async () => {
    // Cleanup test directory
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });
  
  const createTestDocument = (): Document => ({
    id: 'test-doc-1',
    title: 'Test Document',
    version: '1.0',
    content: [
      {
        id: 'node-1',
        type: ContentType.PARAGRAPH,
        content: 'Test content',
        metadata: {
          created: Date.now(),
          modified: Date.now(),
        },
      },
    ],
    metadata: {
      created: Date.now(),
      modified: Date.now(),
      wordCount: 2,
      characterCount: 12,
    },
  });
  
  describe('Document persistence', () => {
    it('should save a document', async () => {
      const doc = createTestDocument();
      await storage.save(doc);
      
      const exists = await storage.exists(doc.id);
      expect(exists).toBe(true);
    });
    
    it('should load a saved document', async () => {
      const doc = createTestDocument();
      await storage.save(doc);
      
      const loaded = await storage.load(doc.id);
      expect(loaded).not.toBeNull();
      expect(loaded?.id).toBe(doc.id);
      expect(loaded?.title).toBe(doc.title);
      expect(loaded?.content).toHaveLength(1);
    });
    
    it('should return null for non-existent document', async () => {
      const loaded = await storage.load('non-existent');
      expect(loaded).toBeNull();
    });
    
    it('should update modified timestamp on save', async () => {
      const doc = createTestDocument();
      const originalModified = doc.metadata.modified;
      
      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));
      
      await storage.save(doc);
      const loaded = await storage.load(doc.id);
      
      expect(loaded?.metadata.modified).toBeGreaterThan(originalModified);
    });
  });
  
  describe('Document listing', () => {
    it('should list all documents', async () => {
      const doc1 = createTestDocument();
      const doc2 = { ...createTestDocument(), id: 'test-doc-2', title: 'Second Doc' };
      
      await storage.save(doc1);
      await storage.save(doc2);
      
      const list = await storage.list();
      expect(list).toHaveLength(2);
      expect(list.map(d => d.id)).toContain(doc1.id);
      expect(list.map(d => d.id)).toContain(doc2.id);
    });
    
    it('should sort documents by modified date', async () => {
      const doc1 = { ...createTestDocument(), id: 'doc-1' };
      await storage.save(doc1);
      
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const doc2 = { ...createTestDocument(), id: 'doc-2' };
      await storage.save(doc2);
      
      const list = await storage.list();
      expect(list[0].id).toBe(doc2.id); // Most recent first
    });
    
    it('should return empty list when no documents', async () => {
      const list = await storage.list();
      expect(list).toHaveLength(0);
    });
  });
  
  describe('Document deletion', () => {
    it('should delete a document', async () => {
      const doc = createTestDocument();
      await storage.save(doc);
      
      expect(await storage.exists(doc.id)).toBe(true);
      
      await storage.delete(doc.id);
      
      expect(await storage.exists(doc.id)).toBe(false);
    });
    
    it('should not throw when deleting non-existent document', async () => {
      await expect(storage.delete('non-existent')).resolves.not.toThrow();
    });
  });
  
  describe('Local-first characteristics', () => {
    it('should store documents as JSON files', async () => {
      const doc = createTestDocument();
      await storage.save(doc);
      
      const files = await fs.readdir(testDir);
      const jsonFiles = files.filter(f => f.endsWith('.json'));
      
      expect(jsonFiles.length).toBeGreaterThan(0);
    });
    
    it('should store human-readable formatted JSON', async () => {
      const doc = createTestDocument();
      await storage.save(doc);
      
      const files = await fs.readdir(testDir);
      const jsonFile = files.find(f => f.endsWith('.json'));
      const filePath = path.join(testDir, jsonFile!);
      
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Should be formatted (has newlines)
      expect(content).toContain('\n');
      
      // Should be valid JSON
      expect(() => JSON.parse(content)).not.toThrow();
    });
  });
  
  describe('Backup functionality', () => {
    it('should create backups when enabled', async () => {
      const storageWithBackup = new LocalStorage({
        basePath: testDir,
        autoBackup: true,
      });
      await storageWithBackup.initialize();
      
      const doc = createTestDocument();
      await storageWithBackup.save(doc);
      
      // Modify and save again to trigger backup
      doc.content[0].content = 'Modified content';
      await storageWithBackup.save(doc);
      
      // Check backup directory exists
      const backupDir = path.join(testDir, '.backups');
      const backupExists = await fs.access(backupDir).then(() => true).catch(() => false);
      
      expect(backupExists).toBe(true);
    });
  });
});
