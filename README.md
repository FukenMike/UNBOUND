# UNBOUND

A desktop, local-first writer's cockpit for managing manuscripts with clean, semantic structure.

## Overview

UNBOUND is a foundational core for manuscript management that prioritizes:
- **Clean, semantic content** - No formatting or layout stored in the manuscript model
- **Local-first** - Designed for desktop use with no cloud dependencies
- **Extensible structure** - Clear data model supporting projects, sections, chapters, scenes, and content blocks
- **Smart ingestion** - Automatically detects structure from raw text

## Features

### Canonical Manuscript Data Model

The data model follows traditional book structure:
- **Project** - Top-level container for a manuscript
- **Sections** - Front matter, body, and back matter
- **Chapters** - Major divisions with explicit ordering
- **Scenes** (optional) - Scene-level organization within chapters
- **Content Blocks** - Paragraphs and structural markers

All entities have:
- Unique IDs for tracking and referencing
- Explicit sort order for flexible reordering
- Optional metadata for extensibility

### Text Ingestion Engine

The ingestion engine converts raw text into structured manuscripts:

**Normalization:**
- Normalizes line endings (Windows, Mac, Unix)
- Removes hard line wraps while preserving paragraphs
- Collapses excessive whitespace
- Preserves semantic paragraph breaks

**Structure Detection:**
- Detects chapter headings in multiple formats:
  - "Chapter 1", "CHAPTER ONE", "Chapter One"
  - "Part 1", "Part One"
  - "Prologue", "Epilogue", etc.
  - Numbered and roman numeral headings
- Detects scene break markers:
  - `***`, `---`, `###`
  - `* * *`, `# # #`
  - Em-dashes

## Installation

```bash
npm install
```

## Usage

### Running the Demo

```bash
npm run demo
```

This demonstrates ingestion of example manuscripts and shows the resulting structured output.

### Running Tests

```bash
npm test
```

Runs the basic test suite covering normalization, parsing, and ingestion.

### Building

```bash
npm run build
```

Compiles TypeScript to JavaScript in the `dist/` directory.

### Programmatic Usage

```typescript
import { ingestText, ingestFromFile } from './core/ingestion';

// Ingest from a string
const project = ingestText(rawText, {
  title: 'My Novel',
  author: 'Author Name',
  detectScenes: true  // default
});

// Ingest from a file
const project = await ingestFromFile('manuscript.txt', {
  title: 'My Novel',
  author: 'Author Name'
});

// Access the structured data
for (const section of project.sections) {
  for (const chapter of section.chapters) {
    console.log(`Chapter: ${chapter.title}`);
    
    // If using scenes
    for (const scene of chapter.scenes) {
      for (const block of scene.content) {
        console.log(block.text);
      }
    }
    
    // If not using scenes
    for (const block of chapter.content) {
      console.log(block.text);
    }
  }
}
```

### Creating Manuscripts Manually

```typescript
import { 
  createProject, 
  createChapter, 
  createContentBlock 
} from './core/manuscript';

const project = createProject('My Novel', {
  author: 'Author Name'
});

// Add a chapter to the body section
const bodySection = project.sections.find(s => s.type === 'body');
if (bodySection) {
  const chapter = createChapter('Chapter 1', 0, {
    content: [
      createContentBlock('paragraph', 'First paragraph.', 0),
      createContentBlock('paragraph', 'Second paragraph.', 1)
    ]
  });
  bodySection.chapters.push(chapter);
}
```

## Project Structure

```
UNBOUND/
├── src/
│   ├── core/
│   │   ├── manuscript/        # Data model and factory functions
│   │   │   ├── types.ts       # TypeScript type definitions
│   │   │   ├── factory.ts     # Entity creation functions
│   │   │   └── index.ts       # Module exports
│   │   └── ingestion/         # Text import and parsing
│   │       ├── normalizer.ts  # Text normalization
│   │       ├── parser.ts      # Structure detection
│   │       ├── ingestion.ts   # Main ingestion engine
│   │       └── index.ts       # Module exports
│   ├── demo.ts                # Demo script
│   └── test.ts                # Basic tests
├── examples/
│   ├── sample-manuscript.txt  # Example with scenes
│   └── simple-story.txt       # Example with prologue
├── package.json
├── tsconfig.json
└── README.md
```

## Design Principles

### Content is Semantic, Not Visual

The manuscript model stores **what** the content is, not **how** it looks:
- A paragraph is a paragraph, not "14pt Times New Roman with 1.5 line spacing"
- A chapter is a structural division, not a page break with a large heading
- Formatting and layout are rendering concerns, not data concerns

This separation allows:
- The same manuscript to be rendered in different formats (print, ebook, web)
- Content to be easily transformed and processed
- Future-proof data that doesn't depend on specific rendering technologies

### Explicit Ordering

All collections use explicit `sortOrder` fields rather than relying on array order:
- Enables database-friendly storage
- Makes reordering operations explicit
- Supports concurrent editing (future enhancement)

### Optional Metadata

Every entity supports optional metadata:
- Extensible without breaking the core model
- Supports future features (revision tracking, notes, etc.)
- Allows custom application-specific data

### No UI Assumptions

The core is pure business logic:
- No web framework dependencies
- No UI components
- No rendering code
- Clean separation allows any UI to be built on top

## Examples

See the `examples/` directory for sample manuscripts that demonstrate:
- Chapter detection (various formats)
- Scene break detection
- Paragraph normalization
- Hard wrap removal

## Future Extensions

The foundational core supports future features:
- Revision tracking and version control
- Collaborative editing
- Export to various formats (EPUB, PDF, Word)
- Custom metadata and tagging
- Search and navigation
- Writing statistics and analytics

## License

ISC 
