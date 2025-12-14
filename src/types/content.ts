/**
 * Core content types for UNBOUND
 * Represents semantic content storage with clear separation of concerns
 */

/**
 * ContentNode represents a semantic unit of content
 * This is the fundamental building block that separates content from presentation
 */
export interface ContentNode {
  id: string;
  type: ContentType;
  content: string;
  metadata: ContentMetadata;
  children?: ContentNode[];
}

/**
 * Content types define the semantic meaning, not visual presentation
 */
export enum ContentType {
  DOCUMENT = 'document',
  SECTION = 'section',
  PARAGRAPH = 'paragraph',
  HEADING = 'heading',
  TEXT = 'text',
  LIST = 'list',
  LIST_ITEM = 'list_item',
  BLOCKQUOTE = 'blockquote',
  CODE_BLOCK = 'code_block',
  INLINE_CODE = 'inline_code',
  EMPHASIS = 'emphasis',
  STRONG = 'strong',
  LINK = 'link',
}

/**
 * Metadata stores semantic information about content
 * Does not include presentation/layout information
 */
export interface ContentMetadata {
  created: number;
  modified: number;
  level?: number; // For headings
  href?: string; // For links
  language?: string; // For code blocks
  [key: string]: unknown;
}

/**
 * Document represents the top-level container
 * Keeps content separate from structure and layout
 */
export interface Document {
  id: string;
  title: string;
  content: ContentNode[];
  metadata: DocumentMetadata;
  version: string;
}

export interface DocumentMetadata {
  created: number;
  modified: number;
  wordCount: number;
  characterCount: number;
  author?: string;
  tags?: string[];
  [key: string]: unknown;
}

/**
 * Structure defines the organization of content
 * Separate from the content itself
 */
export interface DocumentStructure {
  documentId: string;
  outline: OutlineNode[];
  sections: SectionInfo[];
}

export interface OutlineNode {
  id: string;
  title: string;
  level: number;
  children?: OutlineNode[];
}

export interface SectionInfo {
  id: string;
  title: string;
  startNodeId: string;
  endNodeId?: string;
}

/**
 * Layout preferences are separate from content and structure
 * This enables the same content to be presented differently
 */
export interface LayoutPreferences {
  theme: string;
  fontSize: number;
  lineHeight: number;
  fontFamily: string;
  maxWidth?: number;
  [key: string]: unknown;
}
