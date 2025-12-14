/**
 * Factory functions for creating manuscript entities
 * 
 * These functions provide convenient constructors for manuscript entities,
 * handling ID generation and default values.
 */

import { 
  Project, 
  Section, 
  Chapter, 
  Scene, 
  ContentBlock,
  SectionType,
  ContentBlockType,
  EntityId
} from './types';

/**
 * Generate a unique ID for entities
 * Uses timestamp + random string for uniqueness
 */
export function generateId(): EntityId {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Create a new ContentBlock
 */
export function createContentBlock(
  type: ContentBlockType,
  text: string,
  sortOrder: number,
  metadata?: Record<string, unknown>
): ContentBlock {
  return {
    id: generateId(),
    type,
    text,
    sortOrder,
    metadata
  };
}

/**
 * Create a new Scene
 */
export function createScene(
  content: ContentBlock[],
  sortOrder: number,
  title?: string,
  metadata?: Record<string, unknown>
): Scene {
  return {
    id: generateId(),
    title,
    content,
    sortOrder,
    metadata
  };
}

/**
 * Create a new Chapter
 */
export function createChapter(
  title: string,
  sortOrder: number,
  options?: {
    scenes?: Scene[];
    content?: ContentBlock[];
    metadata?: Record<string, unknown>;
  }
): Chapter {
  return {
    id: generateId(),
    title,
    scenes: options?.scenes || [],
    content: options?.content || [],
    sortOrder,
    metadata: options?.metadata
  };
}

/**
 * Create a new Section
 */
export function createSection(
  type: SectionType,
  sortOrder: number,
  chapters: Chapter[] = [],
  title?: string,
  metadata?: Record<string, unknown>
): Section {
  return {
    id: generateId(),
    type,
    title,
    chapters,
    sortOrder,
    metadata
  };
}

/**
 * Create a new Project with default sections
 */
export function createProject(
  title: string,
  options?: {
    subtitle?: string;
    author?: string;
    metadata?: Record<string, unknown>;
  }
): Project {
  const now = new Date();
  
  // Create default sections (empty initially)
  const sections = [
    createSection('frontMatter', 0, [], 'Front Matter'),
    createSection('body', 1, [], 'Main Content'),
    createSection('backMatter', 2, [], 'Back Matter')
  ];
  
  return {
    id: generateId(),
    title,
    subtitle: options?.subtitle,
    author: options?.author,
    sections,
    createdAt: now,
    updatedAt: now,
    metadata: options?.metadata
  };
}
