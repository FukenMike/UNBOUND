# UNBOUND

A desktop, local-first writer's cockpit.

This repository contains:
- **Core Library**: Canonical manuscript model and text ingestion engine
- **Desktop Application**: Native desktop shell with three-panel cockpit layout

## Project Structure

- `src/core/manuscript`: data model definitions
- `src/core/ingestion`: normalization + ingestion
- `src/desktop`: Electron-based desktop application
  - `main.ts`: main process (desktop integration)
  - `preload.ts`: secure bridge between processes
  - `renderer/`: UI layer (HTML/CSS/TypeScript)
- `src/demo`: example input and demo runner
- `src/tests`: test harness

## Quick Start

### Core Library Demo
```bash
npm install
npm run demo
```

### Desktop Application
```bash
npm install
npm start
```

Once the app launches, click "Open" in the Structure panel to load `example-project.json`.

## Design Rules

- Content is semantic only; no formatting/layout stored.
- IDs are stable opaque strings.
- Ordering is explicit.
- Model is readable and extensible.

## Notes
### Supported Heading Formats

The ingestion heuristics recognize conservative variations of chapter/part headings:
- Chapter headings: "Chapter 1", "CHAPTER ONE", "Chapter I", optional punctuation like ":" or "." (case-insensitive)
- Part headings: "Part One", "PART I", "Part 2" (case-insensitive)
- Special: "Prologue", "Epilogue" (case-insensitive)
- Fallback: short all-caps lines may be treated as headings only if at least two words and above a minimum length; common emphasis words are ignored.
### Known Limitations

- Heuristics are conservative; prefer false negatives over false positives.
- Single short ALL-CAPS emphasis lines such as "NOTE", "IMPORTANT", "STOP" are ignored.
- Roman numerals are recognized up to L (50); can be extended cautiously.
- Numeric-only lines are treated as headings when standalone and short.


When detection confidence is low, the system falls back to fewer splits to avoid misclassification.

The ingestion heuristics are intentionally conservative and documented in code comments for future tuning.
