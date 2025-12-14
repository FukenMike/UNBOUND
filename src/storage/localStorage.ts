/**
 * Local-first storage implementation
 * No cloud dependencies - all data stays on the user's machine
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { IStorage, StorageOptions, DocumentInfo } from '../types/storage';
import { Document } from '../types/content';

export class LocalStorage implements IStorage {
  private basePath: string;
  private options: Required<StorageOptions>;
  
  constructor(options: StorageOptions = {}) {
    // Default to user's documents folder for a desktop app
    this.basePath = options.basePath || path.join(os.homedir(), 'Documents', 'UNBOUND');
    
    this.options = {
      basePath: this.basePath,
      autoBackup: options.autoBackup ?? true,
      backupInterval: options.backupInterval ?? 300000, // 5 minutes default
    };
  }
  
  /**
   * Initialize storage directory
   */
  async initialize(): Promise<void> {
    try {
      await fs.mkdir(this.basePath, { recursive: true });
      
      // Create backups directory if auto-backup is enabled
      if (this.options.autoBackup) {
        const backupPath = path.join(this.basePath, '.backups');
        await fs.mkdir(backupPath, { recursive: true });
      }
    } catch (error) {
      throw new Error(`Failed to initialize storage: ${error}`);
    }
  }
  
  /**
   * Save document to local storage
   * Uses semantic JSON format for clean, future-proof storage
   */
  async save(document: Document): Promise<void> {
    try {
      const filePath = this.getDocumentPath(document.id);
      
      // Create backup if it exists
      if (this.options.autoBackup && await this.exists(document.id)) {
        await this.createBackup(document.id);
      }
      
      // Update modified timestamp
      document.metadata.modified = Date.now();
      
      // Write as formatted JSON for human readability
      // This is a professional tool - data should be inspectable
      const json = JSON.stringify(document, null, 2);
      await fs.writeFile(filePath, json, 'utf-8');
      
    } catch (error) {
      throw new Error(`Failed to save document ${document.id}: ${error}`);
    }
  }
  
  /**
   * Load document from local storage
   */
  async load(documentId: string): Promise<Document | null> {
    try {
      const filePath = this.getDocumentPath(documentId);
      
      if (!await this.exists(documentId)) {
        return null;
      }
      
      const json = await fs.readFile(filePath, 'utf-8');
      const document: Document = JSON.parse(json);
      
      return document;
      
    } catch (error) {
      throw new Error(`Failed to load document ${documentId}: ${error}`);
    }
  }
  
  /**
   * List all available documents
   */
  async list(): Promise<DocumentInfo[]> {
    try {
      await this.initialize();
      
      const files = await fs.readdir(this.basePath);
      const documentFiles = files.filter(f => f.endsWith('.json') && !f.startsWith('.'));
      
      const documents: DocumentInfo[] = [];
      
      for (const file of documentFiles) {
        const filePath = path.join(this.basePath, file);
        const json = await fs.readFile(filePath, 'utf-8');
        const doc: Document = JSON.parse(json);
        
        documents.push({
          id: doc.id,
          title: doc.title,
          modified: doc.metadata.modified,
          wordCount: doc.metadata.wordCount,
        });
      }
      
      // Sort by modified date, most recent first
      documents.sort((a, b) => b.modified - a.modified);
      
      return documents;
      
    } catch (error) {
      throw new Error(`Failed to list documents: ${error}`);
    }
  }
  
  /**
   * Delete a document
   */
  async delete(documentId: string): Promise<void> {
    try {
      const filePath = this.getDocumentPath(documentId);
      
      if (!await this.exists(documentId)) {
        return;
      }
      
      // Create final backup before deletion
      if (this.options.autoBackup) {
        await this.createBackup(documentId);
      }
      
      await fs.unlink(filePath);
      
    } catch (error) {
      throw new Error(`Failed to delete document ${documentId}: ${error}`);
    }
  }
  
  /**
   * Check if document exists
   */
  async exists(documentId: string): Promise<boolean> {
    try {
      const filePath = this.getDocumentPath(documentId);
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
  
  /**
   * Get the file path for a document
   */
  private getDocumentPath(documentId: string): string {
    // Sanitize document ID for filesystem
    const sanitized = documentId.replace(/[^a-zA-Z0-9-_]/g, '-');
    return path.join(this.basePath, `${sanitized}.json`);
  }
  
  /**
   * Create a backup of a document
   */
  private async createBackup(documentId: string): Promise<void> {
    try {
      const sourcePath = this.getDocumentPath(documentId);
      const backupDir = path.join(this.basePath, '.backups');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupDir, `${documentId}-${timestamp}.json`);
      
      await fs.copyFile(sourcePath, backupPath);
      
      // Cleanup old backups (keep last 10 per document)
      await this.cleanupOldBackups(documentId);
      
    } catch (error) {
      // Don't fail the main operation if backup fails
      console.error(`Backup failed for ${documentId}:`, error);
    }
  }
  
  /**
   * Remove old backups, keeping only the most recent ones
   */
  private async cleanupOldBackups(documentId: string, keepCount: number = 10): Promise<void> {
    try {
      const backupDir = path.join(this.basePath, '.backups');
      const files = await fs.readdir(backupDir);
      
      const documentBackups = files
        .filter(f => f.startsWith(documentId))
        .map(f => ({
          name: f,
          path: path.join(backupDir, f),
        }))
        .sort((a, b) => b.name.localeCompare(a.name)); // Sort by timestamp descending
      
      // Remove oldest backups
      const toRemove = documentBackups.slice(keepCount);
      for (const backup of toRemove) {
        await fs.unlink(backup.path);
      }
      
    } catch (error) {
      console.error(`Backup cleanup failed for ${documentId}:`, error);
    }
  }
}
