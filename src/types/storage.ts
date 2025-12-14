/**
 * Storage types for local-first persistence
 */

import { Document } from './content';

/**
 * Storage interface for local-first document persistence
 * No cloud dependencies - everything stays on the local machine
 */
export interface IStorage {
  /**
   * Save a document to local storage
   */
  save(document: Document): Promise<void>;
  
  /**
   * Load a document from local storage
   */
  load(documentId: string): Promise<Document | null>;
  
  /**
   * List all available documents
   */
  list(): Promise<DocumentInfo[]>;
  
  /**
   * Delete a document
   */
  delete(documentId: string): Promise<void>;
  
  /**
   * Check if a document exists
   */
  exists(documentId: string): Promise<boolean>;
}

export interface DocumentInfo {
  id: string;
  title: string;
  modified: number;
  wordCount: number;
}

/**
 * Storage options for configuring the local storage backend
 */
export interface StorageOptions {
  /**
   * Base directory for storing documents
   * Defaults to user's documents folder
   */
  basePath?: string;
  
  /**
   * Whether to enable automatic backups
   */
  autoBackup?: boolean;
  
  /**
   * Backup interval in milliseconds
   */
  backupInterval?: number;
}
