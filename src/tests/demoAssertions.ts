import assert from "node:assert";
import { readFileSync } from "node:fs";
import { ingestRawText } from "../core/ingestion/ingest.js";

/**
 * Deterministic assertions against the demo input.
 * Fails loudly if ingestion behavior changes unexpectedly.
 */

const raw = readFileSync(new URL("../../src/demo/example.txt", import.meta.url), "utf-8");
const project = ingestRawText(raw, "Example Manuscript", "Anonymous");

// Assert section and chapter counts
assert.strictEqual(project.sections.length, 1, "Expected exactly one body section");
const body = project.sections[0];
assert.strictEqual(body.chapters.length, 2, "Expected two chapters");

// Assert chapter titles
assert.strictEqual(body.chapters[0].title, "CHAPTER ONE", "Chapter 1 title mismatch");
assert.strictEqual(body.chapters[1].title, "CHAPTER TWO", "Chapter 2 title mismatch");

// Assert scene counts per chapter
assert.ok(body.chapters[0].scenes && body.chapters[0].scenes.length === 2, "Chapter 1 should have two scenes");
assert.ok(body.chapters[1].scenes && body.chapters[1].scenes.length === 2, "Chapter 2 should have two scenes");

// Assert paragraph counts within scenes
assert.strictEqual(body.chapters[0].scenes![0].paragraphs.length, 2, "Chapter 1 Scene 1 should have 2 paragraphs");
assert.strictEqual(body.chapters[0].scenes![1].paragraphs.length, 1, "Chapter 1 Scene 2 should have 1 paragraph");
assert.strictEqual(body.chapters[1].scenes![0].paragraphs.length, 1, "Chapter 2 Scene 1 should have 1 paragraph");
assert.strictEqual(body.chapters[1].scenes![1].paragraphs.length, 1, "Chapter 2 Scene 2 should have 1 paragraph");

console.log("Demo assertions passed.");
