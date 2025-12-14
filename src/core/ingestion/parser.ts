/**
 * Text Parsing Module
 * 
 * Detects structural elements in normalized text:
 * - Chapter headings (various formats)
 * - Scene breaks
 * - Paragraphs
 * 
 * This module works with already-normalized text.
 */

/**
 * Chapter heading patterns to detect
 * Covers common formats:
 * - "Chapter 1", "Chapter One", "CHAPTER 1"
 * - "Part 1", "Part One"
 * - "Prologue", "Epilogue"
 * - Numbered headings: "1.", "I.", "1"
 * - Roman numerals: "I", "II", "III"
 */
const CHAPTER_PATTERNS = [
  // "Chapter" with number or word
  /^chapter\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|[ivxlcdm]+)(?:\s|$|:)/i,
  
  // "Part" with number or word
  /^part\s+(?:\d+|one|two|three|four|five|six|seven|eight|nine|ten|[ivxlcdm]+)(?:\s|$|:)/i,
  
  // Special chapter types
  /^(?:prologue|epilogue|preface|introduction|foreword|afterword|interlude)(?:\s|$|:)/i,
  
  // Numbered headings (with or without period)
  /^(?:\d+|[ivxlcdm]+)\.?\s+[A-Z]/,
  
  // Standalone roman numerals or numbers on their own line (if short enough)
  /^(?:[IVXLCDM]+|\d+)$/,
];

/**
 * Scene break patterns
 * Common markers used to indicate scene breaks:
 * - Three or more asterisks: ***, ****
 * - Three or more dashes: ---, ----
 * - Three or more hashes: ###, ####
 * - Three or more em-dashes: —————
 * - Centered symbols: * * *, # # #
 */
const SCENE_BREAK_PATTERNS = [
  /^\*{3,}$/,           // ***
  /^-{3,}$/,            // ---
  /^#{3,}$/,            // ###
  /^—{3,}$/,            // em-dashes
  /^[*]\s+[*]\s+[*]$/,  // * * *
  /^[#]\s+[#]\s+[#]$/,  // # # #
];

/**
 * Detect if a line is a chapter heading
 */
export function isChapterHeading(line: string): boolean {
  const trimmed = line.trim();
  
  // Empty lines are not headings
  if (!trimmed) {
    return false;
  }
  
  // Check against all patterns
  return CHAPTER_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Detect if a line is a scene break marker
 */
export function isSceneBreak(line: string): boolean {
  const trimmed = line.trim();
  
  // Empty lines are not scene breaks (they're just spacing)
  if (!trimmed) {
    return false;
  }
  
  // Check against all patterns
  return SCENE_BREAK_PATTERNS.some(pattern => pattern.test(trimmed));
}

/**
 * Parse normalized text into structured segments
 * Each segment is tagged with its type and content
 */
export interface TextSegment {
  type: 'chapter' | 'sceneBreak' | 'paragraph';
  content: string;
  lineNumber: number; // Original line number for debugging
}

/**
 * Parse text into segments
 * Identifies chapters, scene breaks, and paragraphs
 */
export function parseIntoSegments(text: string): TextSegment[] {
  const lines = text.split('\n');
  const segments: TextSegment[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line) continue;
    const trimmed = line.trim();
    
    // Skip empty lines (they're just spacing between paragraphs)
    if (!trimmed) {
      continue;
    }
    
    // Check for chapter heading
    if (isChapterHeading(trimmed)) {
      segments.push({
        type: 'chapter',
        content: trimmed,
        lineNumber: i + 1
      });
      continue;
    }
    
    // Check for scene break
    if (isSceneBreak(trimmed)) {
      segments.push({
        type: 'sceneBreak',
        content: trimmed,
        lineNumber: i + 1
      });
      continue;
    }
    
    // Otherwise, it's a paragraph
    segments.push({
      type: 'paragraph',
      content: trimmed,
      lineNumber: i + 1
    });
  }
  
  return segments;
}

/**
 * Group segments into chapters
 * Segments before the first chapter go into a default "Opening" chapter
 */
export interface ChapterSegments {
  title: string;
  segments: TextSegment[];
}

export function groupIntoChapters(segments: TextSegment[]): ChapterSegments[] {
  const chapters: ChapterSegments[] = [];
  let currentChapter: ChapterSegments | null = null;
  
  for (const segment of segments) {
    if (segment.type === 'chapter') {
      // Save the previous chapter if it exists
      if (currentChapter) {
        chapters.push(currentChapter);
      }
      
      // Start a new chapter
      currentChapter = {
        title: segment.content,
        segments: []
      };
    } else {
      // If no chapter has been declared yet, create a default one
      if (!currentChapter) {
        currentChapter = {
          title: 'Opening',
          segments: []
        };
      }
      
      // Add segment to current chapter
      currentChapter.segments.push(segment);
    }
  }
  
  // Add the final chapter
  if (currentChapter) {
    chapters.push(currentChapter);
  }
  
  return chapters;
}

/**
 * Group chapter segments into scenes (based on scene break markers)
 */
export interface SceneSegments {
  segments: TextSegment[];
}

export function groupIntoScenes(segments: TextSegment[]): SceneSegments[] {
  const scenes: SceneSegments[] = [];
  let currentScene: SceneSegments = { segments: [] };
  
  for (const segment of segments) {
    if (segment.type === 'sceneBreak') {
      // If current scene has content, save it
      if (currentScene.segments.length > 0) {
        scenes.push(currentScene);
      }
      
      // Start a new scene (scene break marker is not included in content)
      currentScene = { segments: [] };
    } else {
      // Add segment to current scene
      currentScene.segments.push(segment);
    }
  }
  
  // Add the final scene if it has content
  if (currentScene.segments.length > 0) {
    scenes.push(currentScene);
  }
  
  return scenes;
}
