/**
 * Canonical Manuscript Data Model
 * 
 * This module defines the core data structures for UNBOUND's manuscript representation.
 * 
 * Design Principles:
 * - Content is stored semantically, never with formatting or layout
 * - All entities have unique IDs for tracking and referencing
 * - Ordering is explicit (via sortOrder field) to allow flexible reordering
 * - Metadata is separated from content for clean separation of concerns
 * - Structure supports optional scene-level organization within chapters
 */

/**
 * Unique identifier for entities within the manuscript
 */
export type EntityId = string;

/**
 * Section types in a manuscript follow traditional book structure
 * - frontMatter: Preface, dedication, table of contents, etc.
 * - body: The main narrative content
 * - backMatter: Appendices, glossary, acknowledgments, etc.
 */
export type SectionType = 'frontMatter' | 'body' | 'backMatter';

/**
 * Content block types - the atomic units of manuscript content
 * - paragraph: Standard text paragraph
 * - heading: Section or chapter headings (semantic, not visual)
 * - sceneBreak: Explicit scene break marker
 */
export type ContentBlockType = 'paragraph' | 'heading' | 'sceneBreak';

/**
 * ContentBlock represents a single unit of content
 * Paragraphs are the primary content type; headings and scene breaks provide structure
 */
export interface ContentBlock {
  id: EntityId;
  type: ContentBlockType;
  
  /**
   * The actual text content (for paragraph and heading types)
   * For sceneBreak, this may be empty or contain original marker (e.g., "***")
   */
  text: string;
  
  /**
   * Order within the parent container (scene or chapter)
   */
  sortOrder: number;
  
  /**
   * Optional metadata for extensibility
   * Examples: timestamps, notes, revision markers
   */
  metadata?: Record<string, unknown>;
}

/**
 * Scene is an optional organizational unit within a chapter
 * Not all manuscripts use scenes; some go directly from chapter to paragraphs
 */
export interface Scene {
  id: EntityId;
  
  /**
   * Optional title for the scene (often scenes are untitled)
   */
  title?: string;
  
  /**
   * Content blocks that make up this scene
   */
  content: ContentBlock[];
  
  /**
   * Order within the parent chapter
   */
  sortOrder: number;
  
  /**
   * Optional metadata for extensibility
   */
  metadata?: Record<string, unknown>;
}

/**
 * Chapter represents a major division within a section
 */
export interface Chapter {
  id: EntityId;
  
  /**
   * Chapter title (e.g., "Chapter 1", "The Beginning", etc.)
   * May be auto-detected from ingestion or manually set
   */
  title: string;
  
  /**
   * Optional scenes within the chapter
   * If empty, content blocks are stored directly in the chapter
   */
  scenes: Scene[];
  
  /**
   * Content blocks directly in the chapter (if not using scenes)
   * Either scenes or content should be used, not both
   */
  content: ContentBlock[];
  
  /**
   * Order within the parent section
   */
  sortOrder: number;
  
  /**
   * Optional metadata for extensibility
   */
  metadata?: Record<string, unknown>;
}

/**
 * Section represents a major division of the manuscript
 * Follows traditional book structure (front matter, body, back matter)
 */
export interface Section {
  id: EntityId;
  type: SectionType;
  
  /**
   * Optional title for the section
   */
  title?: string;
  
  /**
   * Chapters within this section
   */
  chapters: Chapter[];
  
  /**
   * Order within the project (frontMatter=0, body=1, backMatter=2 typically)
   */
  sortOrder: number;
  
  /**
   * Optional metadata for extensibility
   */
  metadata?: Record<string, unknown>;
}

/**
 * Project is the top-level container for a manuscript
 * Represents a complete writing project (novel, screenplay, etc.)
 */
export interface Project {
  id: EntityId;
  
  /**
   * Project title
   */
  title: string;
  
  /**
   * Optional subtitle
   */
  subtitle?: string;
  
  /**
   * Author name(s)
   */
  author?: string;
  
  /**
   * The three main sections of the manuscript
   */
  sections: Section[];
  
  /**
   * Creation timestamp
   */
  createdAt: Date;
  
  /**
   * Last modification timestamp
   */
  updatedAt: Date;
  
  /**
   * Optional metadata for extensibility
   * Examples: genre, target word count, draft version, etc.
   */
  metadata?: Record<string, unknown>;
}
