# UNBOUND Architecture

## Overview

UNBOUND is a desktop, local-first writer's cockpit designed with professional writing in mind. The architecture prioritizes clean semantic content storage, separation of concerns, and non-intrusive user experience.

## Core Principles

### 1. Clean, Semantic Content Storage

Content is stored in a semantic format that represents **meaning**, not presentation. Each piece of content is a `ContentNode` with:

- **Type**: The semantic type (paragraph, heading, list, etc.)
- **Content**: The actual text content
- **Metadata**: Semantic information (creation time, heading level, etc.)
- **No presentation data**: Font sizes, colors, margins are kept separate

**Why?** This ensures content is future-proof, portable, and can be presented in any format without losing meaning.

### 2. Separation of Content, Structure, and Layout

The system maintains three distinct layers:

#### Content Layer
- Raw semantic content nodes
- The "what" of the document
- Stored in `Document.content`

#### Structure Layer  
- Organization and outline
- The "how it's organized"
- Represented in `DocumentStructure`

#### Layout Layer
- Visual presentation preferences
- The "how it looks"
- Stored in `LayoutPreferences`

**Why?** This separation allows:
- The same content to be presented differently (print vs. screen)
- Structure changes without content changes
- Layout changes without affecting content or structure
- Easy export to different formats

### 3. Non-Intrusive UX

The system is designed to **preserve writing flow**:

- **No auto-formatting during editing**: Changes are only applied on explicit save
- **Intelligent normalization**: Cleans technical issues (zero-width chars, line endings) without altering meaning
- **Preservation of intent**: Multiple newlines, indentation, and intentional formatting are preserved
- **Optional transformations**: Smart quotes, dash normalization are opt-in only

**Why?** Writers need to focus on their craft, not fight with tools. The application should be invisible during the creative process.

### 4. Intelligent Text Ingestion

The `TextNormalizer` provides smart text processing:

- **Source-aware normalization**: Different handling for clipboard vs. file vs. direct input
- **Removes artifacts**: Zero-width characters, invisible unicode from web sources
- **Preserves meaning**: Never changes the author's intended content
- **Configurable**: Options to control normalization behavior

**Why?** Content comes from many sources (copy-paste, imports, direct typing), each with different characteristics. Smart normalization ensures clean storage while respecting author intent.

### 5. Local-First Storage

All data stays on the user's machine:

- **No cloud dependencies**: Documents stored in user's local filesystem
- **Human-readable format**: JSON storage that can be inspected and backed up
- **Automatic backups**: Local backup system with version history
- **File-based**: Standard filesystem operations, no proprietary database

**Why?** 
- Privacy: User data never leaves their machine
- Reliability: No internet required, no service dependencies
- Ownership: Users own their files
- Portability: Standard JSON format is readable and future-proof

## System Components

### Core Types (`src/types/`)

Defines the fundamental data structures:

- **content.ts**: Semantic content types, document structure
- **storage.ts**: Storage interfaces and options

### Storage Layer (`src/storage/`)

Implements local-first persistence:

- **localStorage.ts**: File-based storage implementation
  - Saves documents as formatted JSON
  - Automatic backup system
  - Human-readable format

### Normalization Layer (`src/normalization/`)

Handles intelligent text processing:

- **textNormalizer.ts**: Text ingestion and normalization
  - Removes technical artifacts
  - Preserves intentional formatting
  - Source-aware processing

### Core Logic (`src/core/`)

Coordinates the system:

- **documentManager.ts**: Main API for document operations
  - Create, read, update, delete documents
  - Import/export functionality
  - Metadata calculation

## Data Flow

### Creating a Document

```
User Input → TextNormalizer → ContentNode[] → Document → LocalStorage
```

1. Raw text from user or import
2. Normalization (optional, based on source)
3. Parsing into semantic content nodes
4. Wrapping in Document structure with metadata
5. Persisting to local filesystem

### Loading a Document

```
LocalStorage → Document → ContentNode[] → Presentation Layer
```

1. Read JSON from filesystem
2. Parse into Document object
3. Extract semantic content
4. Render with layout preferences (separate system)

### Updating a Document

```
User Edits → ContentNode[] → Document (updated metadata) → LocalStorage
```

1. Content changes in editor
2. Update content nodes
3. Recalculate metadata (word count, etc.)
4. Save to filesystem (with backup)

## File Structure

```
Documents/UNBOUND/
├── {document-id}.json          # Document files
└── .backups/                   # Automatic backups
    └── {document-id}-{timestamp}.json
```

Each document is stored as a formatted JSON file:

```json
{
  "id": "uuid",
  "title": "Document Title",
  "version": "1.0",
  "content": [
    {
      "id": "uuid",
      "type": "paragraph",
      "content": "Text content",
      "metadata": {
        "created": 1234567890,
        "modified": 1234567890
      }
    }
  ],
  "metadata": {
    "created": 1234567890,
    "modified": 1234567890,
    "wordCount": 42,
    "characterCount": 200
  }
}
```

## Design Decisions

### Why JSON over Binary?

- **Human readable**: Users can inspect their data
- **Future-proof**: JSON parsers will exist forever
- **Portable**: Easy to process with any tool
- **Debuggable**: Easy to diagnose issues
- **Git-friendly**: Text format works with version control

### Why File-based over Database?

- **Simple**: No database server, no complex setup
- **Reliable**: Filesystem is always available
- **Portable**: Easy to backup, sync, move
- **Transparent**: Users understand files
- **Professional**: Users own their data

### Why Semantic Content?

- **Portable**: Export to any format
- **Future-proof**: Meaning persists even as presentation changes
- **Accessible**: Can be rendered in multiple ways
- **Professional**: Industry standard for content management

## Extension Points

The architecture is designed for extension:

1. **Storage backends**: Implement `IStorage` for different storage solutions
2. **Content types**: Add new `ContentType` enum values for new semantic types
3. **Normalization**: Extend `TextNormalizer` for domain-specific processing
4. **Export formats**: Use semantic content to generate any output format

## Anti-Patterns (What This Is NOT)

- ❌ **Not web-first**: This is a desktop application, not a web app
- ❌ **Not auto-formatting**: No automatic changes during editing
- ❌ **Not cloud-based**: No SaaS, no subscriptions, no remote storage
- ❌ **Not a casual editor**: Professional tool for serious writing
- ❌ **Not intrusive AI**: Intelligence is non-intrusive and opt-in

## Summary

UNBOUND's architecture reflects its purpose as a professional creative tool. Every decision prioritizes:

1. **User control**: The writer decides, the tool obeys
2. **Data ownership**: Local-first, human-readable, portable
3. **Clean separation**: Content, structure, and layout are distinct
4. **Non-intrusive behavior**: Preserves writing flow
5. **Semantic storage**: Meaning over presentation

This creates a solid foundation for a professional writer's cockpit that respects the craft and the craftsperson.
