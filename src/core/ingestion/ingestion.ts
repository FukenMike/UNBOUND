/**
 * Text Ingestion Engine
 * 
 * Main entry point for converting raw text into structured manuscript data.
 * Orchestrates normalization, parsing, and conversion to the canonical model.
 */

import { normalizeText } from './normalizer';
import { parseIntoSegments, groupIntoChapters, groupIntoScenes } from './parser';
import {
  Project,
  createProject,
  createChapter,
  createScene,
  createContentBlock,
} from '../manuscript';

export interface IngestionOptions {
  /**
   * Title for the project (required)
   */
  title: string;
  
  /**
   * Author name (optional)
   */
  author?: string;
  
  /**
   * Whether to detect and use scenes within chapters
   * Default: true
   */
  detectScenes?: boolean;
  
  /**
   * Section to place ingested content
   * Default: 'body'
   */
  sectionType?: 'frontMatter' | 'body' | 'backMatter';
}

/**
 * Ingest raw text and convert to structured manuscript
 * 
 * Process:
 * 1. Normalize the text (line endings, spacing, hard wraps)
 * 2. Parse into segments (chapters, scene breaks, paragraphs)
 * 3. Group segments into chapters and scenes
 * 4. Convert to canonical manuscript model
 */
export function ingestText(rawText: string, options: IngestionOptions): Project {
  // Step 1: Normalize the text
  const normalizedText = normalizeText(rawText);
  
  // Step 2: Parse into segments
  const segments = parseIntoSegments(normalizedText);
  
  // Step 3: Group segments into chapters
  const chapterSegments = groupIntoChapters(segments);
  
  // Step 4: Create the project
  const project = createProject(options.title, {
    author: options.author,
  });
  
  // Step 5: Convert to manuscript model
  const detectScenes = options.detectScenes !== false; // default true
  const sectionType = options.sectionType || 'body';
  
  // Find the target section
  const section = project.sections.find(s => s.type === sectionType);
  if (!section) {
    throw new Error(`Section type ${sectionType} not found`);
  }
  
  // Convert each chapter
  section.chapters = chapterSegments.map((chapterSeg, chapterIndex) => {
    const chapter = createChapter(chapterSeg.title, chapterIndex);
    
    if (detectScenes) {
      // Group chapter segments into scenes
      const sceneSegments = groupIntoScenes(chapterSeg.segments);
      
      // Only use scenes if there are multiple, or if there are scene breaks
      if (sceneSegments.length > 1) {
        chapter.scenes = sceneSegments.map((sceneSeg, sceneIndex) => {
          const scene = createScene(
            sceneSeg.segments.map((seg, segIndex) => 
              createContentBlock('paragraph', seg.content, segIndex)
            ),
            sceneIndex
          );
          return scene;
        });
      } else {
        // Single scene - just use content blocks directly
        chapter.content = chapterSeg.segments.map((seg, segIndex) => 
          createContentBlock('paragraph', seg.content, segIndex)
        );
      }
    } else {
      // Not detecting scenes - all segments become content blocks
      chapter.content = chapterSeg.segments.map((seg, segIndex) => 
        createContentBlock('paragraph', seg.content, segIndex)
      );
    }
    
    return chapter;
  });
  
  return project;
}

/**
 * Convenience function: ingest from a file path
 */
export async function ingestFromFile(
  filePath: string, 
  options: IngestionOptions
): Promise<Project> {
  const fs = await import('fs/promises');
  const rawText = await fs.readFile(filePath, 'utf-8');
  return ingestText(rawText, options);
}
