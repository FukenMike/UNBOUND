# UNBOUND

A desktop, local-first writer's cockpit.

## Overview

UNBOUND is a professional creative writing tool designed with core principles that prioritize the writer's craft:

- **Clean, semantic content storage** - Your content is stored as meaning, not presentation
- **Separation of concerns** - Content, structure, and layout are distinct and independent
- **Non-intrusive UX** - Preserves your writing flow without auto-formatting or interruptions
- **Intelligent text ingestion** - Smart normalization that cleans without altering meaning
- **Local-first** - All your data stays on your machine, no cloud dependencies

## Philosophy

UNBOUND is built on the belief that professional creative tools should:

✅ **Respect the writer** - The tool serves the craft, not the other way around  
✅ **Preserve ownership** - Your data stays on your machine in human-readable format  
✅ **Maintain focus** - Non-intrusive behavior that doesn't interrupt writing flow  
✅ **Store semantics** - Content meaning is preserved, presentation is separate  
✅ **Be transparent** - Open formats, clear architecture, no lock-in  

And should NOT:

❌ Assume web-first patterns  
❌ Auto-format content and alter meaning  
❌ Use intrusive AI behavior  
❌ Depend on SaaS or cloud services  
❌ Act like a casual editor  

## Features

### Semantic Content Storage

Content is stored in a clean, semantic format:

```json
{
  "type": "paragraph",
  "content": "Your text here",
  "metadata": {
    "created": 1234567890,
    "modified": 1234567890
  }
}
```

No font sizes, colors, or other presentation data pollutes your content. This ensures your writing is:

- **Future-proof** - Readable decades from now
- **Portable** - Export to any format
- **Clean** - No presentational cruft

### Separation of Content, Structure, and Layout

The architecture maintains three distinct layers:

1. **Content** - What you wrote (semantic nodes)
2. **Structure** - How it's organized (outline, sections)
3. **Layout** - How it looks (themes, fonts, spacing)

This means you can:

- Change the look without touching content
- Reorganize without rewriting
- Export the same content in multiple formats

### Intelligent Text Normalization

The text normalizer intelligently processes content from various sources:

```typescript
// Source-aware normalization
const text = TextNormalizer.ingestFrom(clipboardText, 'clipboard');
```

**What it does:**
- Removes zero-width and invisible characters (common from web copy-paste)
- Normalizes line endings for consistent storage
- Cleans excessive whitespace while preserving intentional formatting
- Removes technical artifacts without altering meaning

**What it doesn't do:**
- Change your writing style
- Auto-format during editing
- Alter punctuation or grammar
- Make assumptions about intent

### Local-First Storage

All documents are stored on your local filesystem:

```
~/Documents/UNBOUND/
├── document-id.json
├── another-document.json
└── .backups/
    ├── document-id-2024-12-14.json
    └── document-id-2024-12-13.json
```

**Benefits:**
- 🔒 **Privacy** - Your writing never leaves your machine
- 🚀 **Performance** - No network latency, instant access
- 💾 **Ownership** - You own the files, standard JSON format
- 🔄 **Backup** - Automatic local backups, keep your version history
- 📤 **Portability** - Easy to backup, sync, or migrate

## Installation

```bash
npm install
```

## Usage

### Basic Example

```typescript
import { DocumentManager, LocalStorage, TextNormalizer } from './src/index';

// Initialize storage (local-first)
const storage = new LocalStorage({
  basePath: '/path/to/documents',
  autoBackup: true,
});
await storage.initialize();

// Create document manager
const manager = new DocumentManager(storage);

// Create a new document
const doc = await manager.createDocument('My Novel', 'Chapter One\n\nIt was a dark and stormy night...');

// Load a document
const loaded = await manager.loadDocument(doc.id);

// Import from clipboard with smart normalization
const imported = await manager.importText('Imported Document', clipboardText, 'clipboard');

// Export as plain text
const text = await manager.exportText(doc.id);

// List all documents
const docs = await manager.listDocuments();
```

### Text Normalization

```typescript
import { TextNormalizer } from './src/index';

// Custom normalization options
const normalizer = new TextNormalizer({
  normalizeWhitespace: true,
  removeInvisibleChars: true,
  preserveIntentionalFormatting: true,
  normalizeQuotes: false, // Opt-in only
  normalizeDashes: false, // Opt-in only
});

const cleaned = normalizer.normalize(messyText);
```

### Storage Configuration

```typescript
import { LocalStorage } from './src/index';

const storage = new LocalStorage({
  // Custom storage path
  basePath: '/custom/path',
  
  // Enable automatic backups
  autoBackup: true,
  
  // Backup every 5 minutes (300000ms)
  backupInterval: 300000,
});
```

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed architecture documentation.

**Key architectural decisions:**

1. **Semantic content** - Store meaning, not presentation
2. **Separation of concerns** - Content, structure, layout are independent
3. **Local-first** - No cloud dependencies, files on disk
4. **Human-readable storage** - JSON format for transparency
5. **Non-intrusive** - Respect writing flow, no auto-formatting

## Development

```bash
# Build
npm run build

# Test
npm run test

# Lint
npm run lint

# Start (requires Electron integration)
npm start
```

## Project Structure

```
src/
├── types/              # Core type definitions
│   ├── content.ts     # Content types (Document, ContentNode, etc.)
│   └── storage.ts     # Storage interfaces
├── core/              # Core business logic
│   └── documentManager.ts  # Main document operations
├── storage/           # Storage implementations
│   └── localStorage.ts     # Local filesystem storage
├── normalization/     # Text processing
│   └── textNormalizer.ts   # Intelligent text normalization
└── index.ts           # Main exports
```

## Roadmap

- [ ] Desktop application UI (Electron integration)
- [ ] Rich text editing while maintaining semantic storage
- [ ] Export to multiple formats (Markdown, PDF, etc.)
- [ ] Advanced structure management (outlines, sections)
- [ ] Layout theme system
- [ ] Search and organization features
- [ ] Collaboration features (local-first, no cloud)

## Contributing

UNBOUND is built with specific principles in mind. When contributing, please ensure:

- Maintain separation of content, structure, and layout
- Keep storage semantic (no presentation in content)
- Preserve local-first architecture (no cloud dependencies)
- Maintain non-intrusive behavior (no auto-formatting during editing)
- Use clean, readable code that respects the craft

## License

MIT

## Philosophy in Practice

UNBOUND is not just code - it's a statement about how professional creative tools should work. Every line of code reflects these principles:

**Respect the writer.** The tool serves the craft. Writing is hard enough without fighting your tools. UNBOUND gets out of your way and lets you write.

**Respect the data.** Your words are stored in clean, semantic format that will be readable decades from now. No proprietary formats, no lock-in, no mystery.

**Respect the process.** No intrusive AI, no auto-formatting that changes your meaning, no assumptions about your intent. You decide, the tool obeys.

**Respect ownership.** Your data stays on your machine. No clouds, no servers, no subscriptions. You own your work, completely and forever.

This is UNBOUND - a writer's cockpit built by writers, for writers.
