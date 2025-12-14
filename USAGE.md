# Usage Guide

This guide demonstrates how to use UNBOUND's content storage system.

## Quick Start

```typescript
import { DocumentManager, LocalStorage } from './src/index';

// Initialize local storage
const storage = new LocalStorage();
await storage.initialize();

// Create document manager
const manager = new DocumentManager(storage);

// Create your first document
const doc = await manager.createDocument(
  'My First Document',
  'This is the beginning of my story...'
);

console.log(`Created document: ${doc.title} (${doc.id})`);
```

## Working with Documents

### Creating Documents

```typescript
// Empty document
const emptyDoc = await manager.createDocument('Empty Document');

// Document with content
const contentDoc = await manager.createDocument(
  'My Novel',
  '# Chapter One\n\nIt was a dark and stormy night...'
);

// Document from imported text
const importedDoc = await manager.importText(
  'Imported Notes',
  clipboardText,
  'clipboard' // Source type for appropriate normalization
);
```

### Loading and Listing Documents

```typescript
// Load a specific document
const doc = await manager.loadDocument(documentId);
if (doc) {
  console.log(`Loaded: ${doc.title}`);
}

// List all documents
const documents = await manager.listDocuments();
documents.forEach(info => {
  console.log(`${info.title} - ${info.wordCount} words`);
});
```

### Updating Documents

```typescript
// Update title
await manager.updateTitle(documentId, 'New Title');

// Update content (using semantic nodes)
import { ContentType } from './src/index';

const newContent = [
  {
    id: 'node-1',
    type: ContentType.HEADING,
    content: 'Chapter Two',
    metadata: {
      created: Date.now(),
      modified: Date.now(),
      level: 1,
    },
  },
  {
    id: 'node-2',
    type: ContentType.PARAGRAPH,
    content: 'The storm had passed.',
    metadata: {
      created: Date.now(),
      modified: Date.now(),
    },
  },
];

await manager.updateDocument(documentId, newContent);
```

### Exporting Documents

```typescript
// Export as plain text
const text = await manager.exportText(documentId);
console.log(text);

// Can be used for:
// - Copying to clipboard
// - Saving as .txt file
// - Converting to other formats
```

## Text Normalization

### Basic Normalization

```typescript
import { TextNormalizer } from './src/index';

const normalizer = new TextNormalizer({
  normalizeWhitespace: true,
  removeInvisibleChars: true,
  preserveIntentionalFormatting: true,
});

const cleaned = normalizer.normalize(messyText);
```

### Source-Aware Normalization

```typescript
// Aggressive cleaning for clipboard (removes web artifacts)
const fromClipboard = TextNormalizer.ingestFrom(clipboardText, 'clipboard');

// Gentle handling for files (preserves user's format)
const fromFile = TextNormalizer.ingestFrom(fileText, 'file');

// Direct input (minimal normalization)
const fromUser = TextNormalizer.ingestFrom(userInput, 'direct');
```

### Custom Normalization Options

```typescript
const normalizer = new TextNormalizer({
  // Core normalization (recommended)
  normalizeWhitespace: true,
  normalizeLineEndings: true,
  removeInvisibleChars: true,
  
  // Preserve user intent
  preserveIntentionalFormatting: true,
  
  // Optional transformations (opt-in)
  normalizeQuotes: false, // Smart quotes
  normalizeDashes: false, // Em-dashes
});
```

## Storage Configuration

### Default Configuration

```typescript
// Uses ~/Documents/UNBOUND by default
const storage = new LocalStorage();
await storage.initialize();
```

### Custom Configuration

```typescript
const storage = new LocalStorage({
  // Custom storage location
  basePath: '/path/to/my/documents',
  
  // Enable automatic backups
  autoBackup: true,
  
  // Backup every 5 minutes
  backupInterval: 300000,
});

await storage.initialize();
```

### Multiple Storage Locations

```typescript
// Main writing projects
const mainStorage = new LocalStorage({
  basePath: '/path/to/projects',
});

const mainManager = new DocumentManager(mainStorage);

// Research notes in separate location
const researchStorage = new LocalStorage({
  basePath: '/path/to/research',
});

const researchManager = new DocumentManager(researchStorage);
```

## Working with Semantic Content

### Understanding Content Types

```typescript
import { ContentType, ContentNode } from './src/index';

// Content types represent meaning, not presentation
const heading: ContentNode = {
  id: 'unique-id',
  type: ContentType.HEADING,
  content: 'Chapter Title',
  metadata: {
    created: Date.now(),
    modified: Date.now(),
    level: 1, // Semantic level (h1, h2, etc.)
  },
};

const paragraph: ContentNode = {
  id: 'unique-id-2',
  type: ContentType.PARAGRAPH,
  content: 'Paragraph text content.',
  metadata: {
    created: Date.now(),
    modified: Date.now(),
  },
};
```

### Parsing and Generating Content

```typescript
// The document manager handles parsing
const doc = await manager.createDocument('Title', '# Heading\n\nContent');

// Content is now semantic
doc.content.forEach(node => {
  console.log(`${node.type}: ${node.content}`);
});

// Export back to text
const text = await manager.exportText(doc.id);
```

## Best Practices

### 1. Separation of Concerns

```typescript
// ✅ Good: Store semantic content
const content = {
  type: ContentType.PARAGRAPH,
  content: 'Text content',
  metadata: { created: Date.now(), modified: Date.now() },
};

// ❌ Bad: Don't store presentation
const bad = {
  type: ContentType.PARAGRAPH,
  content: 'Text content',
  fontSize: 14, // No! This is presentation
  color: '#000', // No! This is presentation
};
```

### 2. Non-Intrusive Editing

```typescript
// ✅ Good: Normalize only on import/save
const imported = await manager.importText('Doc', text, 'clipboard');

// ❌ Bad: Don't auto-format during editing
// Let users type freely, normalize only when saving
```

### 3. Local-First Storage

```typescript
// ✅ Good: Use local storage
const storage = new LocalStorage({
  basePath: '/local/path',
});

// ❌ Bad: Don't add cloud dependencies
// const cloudStorage = new CloudStorage(); // Not aligned with principles
```

### 4. Respect User Data

```typescript
// ✅ Good: Preserve backups
const storage = new LocalStorage({
  autoBackup: true,
});

// ✅ Good: Human-readable format
// Documents are stored as formatted JSON

// ✅ Good: No lock-in
// Users can read/edit their files directly
```

## Example: Complete Workflow

```typescript
import { DocumentManager, LocalStorage, TextNormalizer } from './src/index';

async function completeWorkflow() {
  // 1. Initialize
  const storage = new LocalStorage({ autoBackup: true });
  await storage.initialize();
  const manager = new DocumentManager(storage);
  
  // 2. Create a new document
  const doc = await manager.createDocument(
    'My Story',
    '# Chapter One\n\nThe beginning...'
  );
  console.log(`Created: ${doc.id}`);
  
  // 3. Import from clipboard
  const clipboardDoc = await manager.importText(
    'Research Notes',
    clipboardContent,
    'clipboard'
  );
  
  // 4. List all documents
  const docs = await manager.listDocuments();
  docs.forEach(d => console.log(`- ${d.title} (${d.wordCount} words)`));
  
  // 5. Update a document
  await manager.updateTitle(doc.id, 'My Epic Story');
  
  // 6. Export for backup
  const text = await manager.exportText(doc.id);
  // Save to external file, copy to clipboard, etc.
  
  // 7. Access metadata
  const loaded = await manager.loadDocument(doc.id);
  console.log(`Word count: ${loaded?.metadata.wordCount}`);
  console.log(`Last modified: ${new Date(loaded?.metadata.modified || 0)}`);
}

completeWorkflow().catch(console.error);
```

## Advanced Topics

### Custom Storage Implementation

```typescript
import { IStorage, DocumentInfo } from './src/index';

class CustomStorage implements IStorage {
  async save(document: Document): Promise<void> {
    // Custom implementation
  }
  
  async load(documentId: string): Promise<Document | null> {
    // Custom implementation
  }
  
  // ... implement other methods
}

// Use with DocumentManager
const manager = new DocumentManager(new CustomStorage());
```

### Extending Content Types

```typescript
// Add custom semantic types
enum CustomContentType {
  SCENE = 'scene',
  CHARACTER = 'character',
  LOCATION = 'location',
}

// Use in your content nodes
const sceneNode = {
  id: 'scene-1',
  type: 'scene' as any, // Cast to ContentType
  content: 'Scene description',
  metadata: {
    created: Date.now(),
    modified: Date.now(),
    location: 'Paris',
    characters: ['Alice', 'Bob'],
  },
};
```

## Troubleshooting

### Storage Issues

```typescript
// Check if storage is initialized
const storage = new LocalStorage();
await storage.initialize(); // Always call this first

// Verify document exists
const exists = await storage.exists(documentId);
if (!exists) {
  console.log('Document not found');
}
```

### Normalization Issues

```typescript
// Debug normalization
const normalizer = new TextNormalizer({
  normalizeWhitespace: true,
  removeInvisibleChars: true,
});

const input = 'Test\u200BContent';
const output = normalizer.normalize(input);

console.log('Input length:', input.length);
console.log('Output length:', output.length);
console.log('Removed invisible chars:', input.length - output.length);
```

## Next Steps

- Explore the [Architecture](./ARCHITECTURE.md) document for system design
- Review the [README](./README.md) for project philosophy
- Build a UI on top of this content storage system
- Implement export to various formats (Markdown, PDF, etc.)
- Add advanced features like search, tagging, etc.
