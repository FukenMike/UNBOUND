/**
 * Document manager - coordinates content, storage, and normalization
 * Maintains clean separation of concerns
 */

import { Document, ContentNode, ContentType, DocumentMetadata } from '../types/content';
import { IStorage } from '../types/storage';
import { TextNormalizer } from '../normalization/textNormalizer';
import { v4 as uuidv4 } from 'uuid';

export class DocumentManager {
  private storage: IStorage;
  private normalizer: TextNormalizer;
  
  constructor(storage: IStorage, normalizer?: TextNormalizer) {
    this.storage = storage;
    this.normalizer = normalizer || new TextNormalizer();
  }
  
  /**
   * Create a new document with semantic content structure
   */
  async createDocument(title: string, initialContent?: string): Promise<Document> {
    const now = Date.now();
    
    const document: Document = {
      id: uuidv4(),
      title: title || 'Untitled',
      version: '1.0',
      content: [],
      metadata: {
        created: now,
        modified: now,
        wordCount: 0,
        characterCount: 0,
      },
    };
    
    if (initialContent) {
      const normalized = this.normalizer.normalize(initialContent);
      document.content = this.parseContent(normalized);
      document.metadata = this.calculateMetadata(document);
    }
    
    await this.storage.save(document);
    return document;
  }
  
  /**
   * Load an existing document
   */
  async loadDocument(documentId: string): Promise<Document | null> {
    return await this.storage.load(documentId);
  }
  
  /**
   * Update document content
   * Non-intrusive: only normalizes on explicit save, not during editing
   */
  async updateDocument(documentId: string, content: ContentNode[]): Promise<Document> {
    const document = await this.storage.load(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    document.content = content;
    document.metadata = this.calculateMetadata(document);
    
    await this.storage.save(document);
    return document;
  }
  
  /**
   * Update document title
   */
  async updateTitle(documentId: string, title: string): Promise<Document> {
    const document = await this.storage.load(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    document.title = title;
    document.metadata.modified = Date.now();
    
    await this.storage.save(document);
    return document;
  }
  
  /**
   * Import text from external source with intelligent normalization
   */
  async importText(title: string, text: string, source: 'clipboard' | 'file' | 'direct'): Promise<Document> {
    const normalized = TextNormalizer.ingestFrom(text, source);
    return await this.createDocument(title, normalized);
  }
  
  /**
   * Export document content as plain text
   */
  async exportText(documentId: string): Promise<string> {
    const document = await this.storage.load(documentId);
    if (!document) {
      throw new Error(`Document ${documentId} not found`);
    }
    
    return this.contentToText(document.content);
  }
  
  /**
   * Delete a document
   */
  async deleteDocument(documentId: string): Promise<void> {
    await this.storage.delete(documentId);
  }
  
  /**
   * List all documents
   */
  async listDocuments() {
    return await this.storage.list();
  }
  
  /**
   * Parse plain text into semantic content structure
   * Simple paragraph-based parsing - keeps it semantic
   */
  private parseContent(text: string): ContentNode[] {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    
    return paragraphs.map(para => {
      const trimmed = para.trim();
      const now = Date.now();
      
      // Detect headings (lines starting with # or short lines followed by content)
      if (trimmed.startsWith('#')) {
        const level = trimmed.match(/^#+/)?.[0].length ?? 1;
        const content = trimmed.replace(/^#+\s*/, '');
        return {
          id: uuidv4(),
          type: ContentType.HEADING,
          content,
          metadata: {
            created: now,
            modified: now,
            level,
          },
        };
      }
      
      // Regular paragraph
      return {
        id: uuidv4(),
        type: ContentType.PARAGRAPH,
        content: trimmed,
        metadata: {
          created: now,
          modified: now,
        },
      };
    });
  }
  
  /**
   * Convert semantic content structure back to plain text
   */
  private contentToText(content: ContentNode[]): string {
    return content.map(node => {
      if (node.type === ContentType.HEADING && typeof node.metadata.level === 'number') {
        const hashes = '#'.repeat(node.metadata.level);
        return `${hashes} ${node.content}`;
      }
      return node.content;
    }).join('\n\n');
  }
  
  /**
   * Calculate document metadata (word count, character count, etc.)
   */
  private calculateMetadata(document: Document): DocumentMetadata {
    const text = this.contentToText(document.content);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    
    return {
      ...document.metadata,
      modified: Date.now(),
      wordCount: words.length,
      characterCount: text.length,
    };
  }
}
