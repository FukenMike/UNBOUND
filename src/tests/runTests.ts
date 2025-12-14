import assert from "node:assert";
import { ingestRawText } from "../core/ingestion/ingest.js";

function testBasicChaptersAndScenes() {
  const input = [
    "CHAPTER ONE",
    "",
    "Para one line one.",
    "Line two continues same paragraph.",
    "",
    "***",
    "",
    "Second scene single paragraph.",
    "",
    "CHAPTER TWO",
    "",
    "Another chapter para.",
    "---",
    "Post break para."
  ].join("\n");

  const project = ingestRawText(input, "Test", "Tester");
  assert.strictEqual(project.sections.length, 1, "one body section");
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 2, "two chapters detected");
  assert.strictEqual(body.chapters[0].title, "CHAPTER ONE");
  assert.strictEqual(body.chapters[1].title, "CHAPTER TWO");

  const ch1 = body.chapters[0];
  assert.ok(ch1.scenes && ch1.scenes.length === 2, "chapter one has two scenes");
  assert.strictEqual(ch1.scenes![0].paragraphs.length, 1, "scene 1 has one paragraph after unwrap");
  assert.ok(/Para one line one.*Line two/.test(ch1.scenes![0].paragraphs[0].content), "hard wraps removed");

  const ch2 = body.chapters[1];
  assert.ok(ch2.scenes && ch2.scenes.length === 2, "chapter two split at ---");
}

function testNoHeadingsSingleChapter() {
  const input = [
    "First paragraph line one.",
    "Line two of same para.",
    "",
    "Second paragraph."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 1, "single implicit chapter");
  const ch = body.chapters[0];
  assert.ok(ch.paragraphs && ch.paragraphs.length === 2, "paragraphized without scenes");
}

// Top-level targeted tests to avoid ordering issues
function testRomanAndPartHeadings_top() {
  const input = [
    "CHAPTER IX",
    "Content for Chapter IX.",
    "",
    "PART II",
    "Content for Part II.",
    "",
    "Epilogue",
    "Closing content."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 3, "Detect roman, part, and epilogue headings");
  assert.strictEqual(body.chapters[0].title, "CHAPTER IX");
  assert.strictEqual(body.chapters[1].title, "PART II");
  assert.strictEqual((body.chapters[2].title || "").toLowerCase(), "epilogue");
}

function testFalsePositiveAllCapsIgnored_top() {
  const input = [
    "IMPORTANT",
    "This should not start a new chapter.",
    "",
    "NOTE",
    "Still the same chapter."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 1, "all-caps emphasis words should not be treated as chapters");
}

function testMixedCaseChapterWords_top() {
  // Test acceptance: mixed-case headings with chapter keyword are detected
  const input = [
    "Chapter One",
    "First chapter content.",
    "",
    "chapter two",
    "Second chapter content.",
    "",
    "Chapter IV",
    "Fourth chapter content."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 3);
  assert.strictEqual(body.chapters[0].title, "Chapter One");
  assert.strictEqual(body.chapters[1].title, "chapter two");
  assert.strictEqual(body.chapters[2].title, "Chapter IV");
}

function testNumericOnlyHeadings() {
  // Test acceptance: standalone numeric-only lines surrounded by blank lines are headings
  const input = [
    "1",
    "",
    "First chapter content.",
    "",
    "2",
    "",
    "Second chapter content.",
    "",
    "10",
    "",
    "Tenth chapter content."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  assert.strictEqual(body.chapters.length, 3, "numeric-only lines detected as chapters");
  assert.strictEqual(body.chapters[0].title, "1");
  assert.strictEqual(body.chapters[1].title, "2");
  assert.strictEqual(body.chapters[2].title, "10");
}

function testNumericListsNotChapters() {
  // Test rejection: numbered lists should NOT be detected as chapters
  const input = [
    "Here are some items:",
    "",
    "1. First item",
    "2. Second item",
    "3. Third item",
    "",
    "More content."
  ].join("\n");

  const project = ingestRawText(input);
  const body = project.sections[0];
  // Should be a single chapter (no headings detected)
  assert.strictEqual(body.chapters.length, 1, "numbered lists should not create chapters");
}

function runAll() {
  function testRomanAndPartHeadings() {
    // Minimal inline: Roman numeral and Part headings
    const input = [
      "CHAPTER IX",
      "Content for Chapter IX.",
      "",
      "PART II",
      "Content for Part II.",
      "",
      "Epilogue",
      "Closing content."
    ].join("\n");

    const project = ingestRawText(input);
    const body = project.sections[0];
    // Expect 3 headings: CHAPTER IX, PART II, Epilogue
    assert.strictEqual(body.chapters.length, 3, "Detect roman, part, and epilogue headings");
    assert.strictEqual(body.chapters[0].title, "CHAPTER IX", "Roman numeral chapter title");
    assert.strictEqual(body.chapters[1].title, "PART II", "Part heading title");
    assert.strictEqual((body.chapters[2].title || "").toLowerCase(), "epilogue", "Epilogue heading");
  }

  function testFalsePositiveAllCapsIgnored() {
    // Minimal inline: all-caps emphasis lines should not trigger chapters
    const input = [
      "IMPORTANT",
      "This should not start a new chapter.",
      "",
      "NOTE",
      "Still the same chapter."
    ].join("\n");
  function testMixedCaseChapterWords() {
    // Minimal inline: mixed-case chapter words (English number words)
    const input = [
      "Chapter One",
      "First chapter content.",
      "",
      "chapter two",
      "Second chapter content.",
      "",
      "Chapter IV",
      "Fourth chapter content."
    ].join("\n");

    const project = ingestRawText(input);
    const body = project.sections[0];
    assert.strictEqual(body.chapters.length, 3, "mixed-case headings and roman numerals detected");
    assert.strictEqual(body.chapters[0].title, "Chapter One", "mixed-case Chapter One title preserved");
    assert.strictEqual(body.chapters[1].title, "chapter two", "lowercase chapter two title preserved");
    assert.strictEqual(body.chapters[2].title, "Chapter IV", "roman numeral IV detected");
  }

    const project = ingestRawText(input);
    const body = project.sections[0];
    assert.strictEqual(body.chapters.length, 1, "all-caps emphasis words should not be treated as chapters");
    const ch = body.chapters[0];
    assert.ok(ch.paragraphs && ch.paragraphs.length >= 1, "content remains in single chapter");
  }

  const tests = [
    ["basic chapters and scenes", testBasicChaptersAndScenes],
    ["no headings single chapter", testNoHeadingsSingleChapter],
    ["roman and part headings", testRomanAndPartHeadings_top],
    ["ignore false positive all-caps", testFalsePositiveAllCapsIgnored_top],
    ["mixed-case chapter words", testMixedCaseChapterWords_top],
    ["numeric-only headings", testNumericOnlyHeadings],
    ["numeric lists not chapters", testNumericListsNotChapters]
  ] as const;

  let passed = 0;
  for (const [name, fn] of tests) {
    try {
      fn();
      console.log(`PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`FAIL: ${name}`);
      console.error(err);
      process.exitCode = 1;
    }
  }
  console.log(`\n${passed}/${tests.length} tests passed.`);
}

runAll();
