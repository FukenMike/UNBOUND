import { Chapter, Paragraph, Project, Scene, Section, makeId } from "../manuscript/model.js";
import { normalizeRawText } from "./normalize.js";

/**
 * Ingest raw text and produce a structured manuscript.
 * - Detect chapters ("Chapter 1", "CHAPTER ONE", numeric headings).
 * - Detect scene breaks (***, ---).
 * - Preserve paragraphs and ordering.
 * - No formatting/layout stored.
 */

/**
 * Chapter heading heuristics (conservative):
 * - "Chapter" followed by Arabic numbers or English words.
 * - Roman numerals (I, II, III, ... up to reasonably large).
 * - "Part" headings (e.g., PART ONE, PART I, Part 1).
 * - Optional punctuation like trailing colon or period.
 * - Prologue/Epilogue recognized as chapter-like markers.
 * - Short all-caps lines treated as probable headings, but only as fallback.
 *
 * If confidence is low, the parser will not split and will fallback to a single chapter.
 */
// Roman numerals up to 50 for practical coverage (extend if needed conservatively)
// Roman numerals: use character class for flexibility; case-insensitive
const ROMAN_CLASS = "[IVXLCDM]+";
const ENGLISH_NUM_WORDS = "one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|twenty\\s*one|twenty\\s*two|twenty\\s*three|twenty\\s*four|twenty\\s*five";

const CHAPTER_PATTERNS: RegExp[] = [
  // Chapter + number/word/roman, optional punctuation
  new RegExp(`^chapter\s+(?:\\d+|(?:${ENGLISH_NUM_WORDS})|${ROMAN_CLASS})\s*[:.-]?$`, "i"),
  // Explicit English word list as a direct regex literal (defensive redundancy)
  /^(?:chapter)\s+(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty)\b\s*[:.-]?$/i,
  // Standalone CHAPTER (next lines may contain content); conservative, often rare in raw text
  /^chapter\b\s*$/i,
  // Prologue/Epilogue as chapter markers
  /^(prologue|epilogue)\b\s*[:.-]?$/i,
  // Part headings
  new RegExp(`^part\s+(?:\\d+|(?:${ENGLISH_NUM_WORDS})|${ROMAN_CLASS})\s*[:.-]?$`, "i"),
  /**
   * Numeric-only headings (e.g., "1", "2", "10").
   * Acceptance: standalone numbers with optional trailing punctuation.
   * Rejection: this pattern does NOT match numbered lists like "1. Item" because
   * normalization and paragraph splitting will group list items as content.
   */
  /^\d+\s*[:.-]?$/
];

const SCENE_BREAK_PATTERN = /^(\*\*\*|---|\*\s\*\s\*)$/;

function isChapterHeading(line: string): boolean {
  const t = line.trim();
  if (t.length === 0) return false;
  
  // Primary rules: explicit chapter/part/prologue/epilogue patterns
  if (CHAPTER_PATTERNS.some(re => re.test(t))) return true;
  
  /**
   * Mildly permissive fallback: "Chapter <word>" with short alphabetic word (e.g., One, Two).
   * Accepts: "Chapter One", "chapter two", "Chapter four".
   * Rejects: lines without the chapter keyword.
   */
  if (/^chapter\s+[a-z]{1,10}\b\s*[:.-]?$/i.test(t)) return true;

  /**
   * Conservative fallback: short ALL-CAPS lines likely headings if:
   * - Longer than minimum threshold (6 chars).
   * - Not in ignore list (NOTE, STOP, IMPORTANT, etc.).
   * - At least 2 words to avoid single-word emphasis.
   * Prefers false negatives over false positives.
   */
  const ALL_CAPS_IGNORE = new Set([
    "NOTE", "STOP", "IMPORTANT", "WARNING", "CAUTION", "INFO"
  ]);
  const isAllCaps = t === t.toUpperCase() && /[A-Z]/.test(t);
  const minLength = 6;
  if (isAllCaps && t.length >= minLength && !ALL_CAPS_IGNORE.has(t)) {
    if (t.split(/\s+/).length >= 2) return true;
  }
  return false;
}

function isSceneBreak(line: string): boolean {
  return SCENE_BREAK_PATTERN.test(line.trim());
}

/** Create paragraphs from a block of text separated by blank lines. */
function paragraphize(block: string): Paragraph[] {
  const paras = block
    .split(/\n{2,}/)
    .map(s => s.trim())
    .filter(s => s.length > 0);
  return paras.map((content, idx) => ({ id: makeId("para"), order: idx + 1, content }));
}

/**
 * Split chapter content by scene breaks into scenes; if none, return paragraphs at chapter level.
 */
function splitScenes(chapterText: string): { scenes?: Scene[]; paragraphs?: Paragraph[] } {
  const lines = chapterText.split("\n");
  let blocks: string[] = [];
  let buf: string[] = [];

  const flush = () => {
    if (buf.length > 0) {
      blocks.push(buf.join("\n"));
      buf = [];
    }
  };

  let hasSceneBreak = false;

  for (const line of lines) {
    if (isSceneBreak(line)) {
      hasSceneBreak = true;
      flush();
    } else {
      buf.push(line);
    }
  }
  flush();

  if (hasSceneBreak) {
    const scenes: Scene[] = blocks.map((b, i) => ({
      id: makeId("scene"),
      order: i + 1,
      paragraphs: paragraphize(b)
    }));
    return { scenes };
  } else {
    return { paragraphs: paragraphize(blocks.join("\n")) };
  }
}

/** Parse normalized text into chapters by heading detection. */
function splitChapters(normalized: string): { heading: string | undefined; content: string }[] {
  const lines = normalized.split("\n");
  const chapters: { heading: string | undefined; content: string }[] = [];
  let currentHeading: string | undefined = undefined;
  let buf: string[] = [];

  const flush = () => {
    const content = buf.join("\n").trim();
    buf = [];
    if (content.length > 0 || currentHeading !== undefined) {
      chapters.push({ heading: currentHeading, content });
      currentHeading = undefined;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isChapterHeading(line)) {
      // New chapter starts; flush previous
      flush();
      currentHeading = line.trim();
    } else {
      buf.push(line);
    }
  }
  flush();

  // If no chapters detected, treat entire text as a single chapter without heading
  if (chapters.length === 0) {
    return [{ heading: undefined, content: normalized }];
  }
  return chapters.filter(ch => ch.heading !== undefined || ch.content.length > 0);
}

/** Convert split chapters into canonical Section/Chapter structures. */
function buildSections(chapterBlocks: { heading: string | undefined; content: string }[]): Section[] {
  // For now, all parsed content goes into the `body` section.
  const bodySection: Section = {
    id: makeId("section"),
    kind: "body",
    order: 1,
    chapters: [],
  };

  chapterBlocks.forEach((block, idx) => {
    const chapter: Chapter = {
      id: makeId("chapter"),
      title: block.heading?.trim(),
      order: idx + 1,
      ...splitScenes(block.content)
    };
    bodySection.chapters.push(chapter);
  });

  return [bodySection];
}

export function ingestRawText(raw: string, title?: string, author?: string): Project {
  const normalized = normalizeRawText(raw);
  const chapterBlocks = splitChapters(normalized);
  const sections = buildSections(chapterBlocks);
  const project: Project = {
    id: makeId("project"),
    title,
    author,
    sections
  };
  return project;
}
