/**
 * Basic Tests for UNBOUND Core
 * 
 * Simple test suite demonstrating core functionality
 */

import { normalizeText, isChapterHeading, isSceneBreak } from './core/ingestion';
import { ingestText } from './core/ingestion';

/**
 * Test helper
 */
function test(name: string, fn: () => void | Promise<void>): void {
  try {
    const result = fn();
    if (result instanceof Promise) {
      result.then(() => {
        console.log(`✓ ${name}`);
      }).catch(error => {
        console.error(`✗ ${name}`);
        console.error(`  ${error.message}`);
      });
    } else {
      console.log(`✓ ${name}`);
    }
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Assert helper
 */
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

console.log('Running UNBOUND Core Tests\n');

// Normalization tests
test('normalizeText removes Windows line endings', () => {
  const input = 'Line 1\r\nLine 2\r\nLine 3';
  const output = normalizeText(input);
  assert(!output.includes('\r'), 'Should not contain \\r characters');
});

test('normalizeText removes hard wraps', () => {
  const input = 'This is a long line\nthat was wrapped\nby the editor.';
  const output = normalizeText(input);
  assert(output.includes('This is a long line that was wrapped by the editor.'), 
         'Should join wrapped lines');
});

test('normalizeText preserves paragraph breaks', () => {
  const input = 'Paragraph 1.\n\nParagraph 2.';
  const output = normalizeText(input);
  const paragraphs = output.split('\n\n');
  assert(paragraphs.length === 2, 'Should have two paragraphs');
});

test('normalizeText collapses multiple spaces', () => {
  const input = 'Too   many    spaces';
  const output = normalizeText(input);
  assert(output === 'Too many spaces', 'Should collapse multiple spaces');
});

// Chapter detection tests
test('isChapterHeading detects "Chapter 1"', () => {
  assert(isChapterHeading('Chapter 1'), 'Should detect "Chapter 1"');
});

test('isChapterHeading detects "CHAPTER ONE"', () => {
  assert(isChapterHeading('CHAPTER ONE'), 'Should detect "CHAPTER ONE"');
});

test('isChapterHeading detects "Prologue"', () => {
  assert(isChapterHeading('Prologue'), 'Should detect "Prologue"');
});

test('isChapterHeading detects "Part 1"', () => {
  assert(isChapterHeading('Part 1'), 'Should detect "Part 1"');
});

test('isChapterHeading detects roman numerals', () => {
  assert(isChapterHeading('IV'), 'Should detect roman numerals');
});

test('isChapterHeading rejects normal paragraphs', () => {
  assert(!isChapterHeading('This is just a normal paragraph.'), 
         'Should not detect normal text as chapter');
});

// Scene break detection tests
test('isSceneBreak detects ***', () => {
  assert(isSceneBreak('***'), 'Should detect ***');
});

test('isSceneBreak detects ---', () => {
  assert(isSceneBreak('---'), 'Should detect ---');
});

test('isSceneBreak detects ###', () => {
  assert(isSceneBreak('###'), 'Should detect ###');
});

test('isSceneBreak detects * * *', () => {
  assert(isSceneBreak('* * *'), 'Should detect * * *');
});

test('isSceneBreak rejects normal paragraphs', () => {
  assert(!isSceneBreak('This is not a scene break'), 
         'Should not detect normal text as scene break');
});

// Integration test
test('ingestText creates structured project', () => {
  const input = `Chapter 1

This is the first paragraph.

This is the second paragraph.

***

This is after a scene break.

Chapter 2

This is in chapter two.`;

  const project = ingestText(input, {
    title: 'Test Project',
    author: 'Test Author'
  });
  
  assert(project.title === 'Test Project', 'Project title should match');
  assert(project.author === 'Test Author', 'Author should match');
  
  const bodySection = project.sections.find(s => s.type === 'body');
  if (!bodySection) throw new Error('Should have body section');
  assert(bodySection.chapters.length === 2, 'Should have 2 chapters');
  
  const chapter1 = bodySection.chapters[0];
  if (!chapter1) throw new Error('Chapter 1 should exist');
  assert(chapter1.title === 'Chapter 1', 'First chapter title should match');
  assert(chapter1.scenes.length === 2, 'Chapter 1 should have 2 scenes (split by ***)');
  
  const chapter2 = bodySection.chapters[1];
  if (!chapter2) throw new Error('Chapter 2 should exist');
  assert(chapter2.title === 'Chapter 2', 'Second chapter title should match');
});

test('ingestText without scene detection stores content directly', () => {
  const input = `Chapter 1

Paragraph 1.

***

Paragraph 2.`;

  const project = ingestText(input, {
    title: 'Test Project',
    detectScenes: false
  });
  
  const bodySection = project.sections.find(s => s.type === 'body');
  if (!bodySection) throw new Error('Should have body section');
  const chapter1 = bodySection.chapters[0];
  if (!chapter1) throw new Error('Chapter 1 should exist');
  
  // With detectScenes: false, should use content directly
  // However, the scene break won't create separate content blocks
  assert(chapter1.content.length >= 2, 'Should have content blocks');
  assert(chapter1.scenes.length === 0, 'Should not have scenes');
});

console.log('\nAll tests completed!');
