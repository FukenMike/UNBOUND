# UNBOUND UI Architecture Refactor

## Overview

UNBOUND has been refactored from a single-workflow, biased writing interface into a **multi-domain, panel-based environment** where all major writing-related domains coexist without overwhelming the user.

## Architecture

### Seven Writing Domains

1. **Structure** (Left Sidebar)
   - Document organization and navigation
   - Sections, chapters, scenes, fragments
   - Always visible by default
   - Supports drag-and-drop reordering
   - Domain responsibility: Managing document hierarchy

2. **Writing** (Center Canvas)
   - Clean, distraction-free text editing
   - No destructive formatting
   - Non-intrusive header with item title/number
   - Neutral empty state ("Select an item to edit")
   - Domain responsibility: Pure text composition

3. **Layout** (Right Sidebar - Optional)
   - Non-destructive visual controls
   - Line width presets (Narrow, Medium, Wide, Full)
   - Line height adjustment (1.2 - 2.5)
   - Character spacing (font kerning)
   - All changes are view-only; content never modified
   - Domain responsibility: Visual appearance without data mutation

4. **Planning** (Right Sidebar - Optional)
   - Outlines, cards, high-level organization
   - Optional; never required for writing
   - Dockable and can be toggled off
   - Domain responsibility: Pre-writing and organizational thinking

5. **Analysis** (Right Sidebar - Optional)
   - Read-only statistics and metrics
   - Word count, character count, paragraph count, average line length
   - Current document metrics update in real-time
   - Cannot be edited, only observed
   - Domain responsibility: Document metrics and insights

6. **Revision** (Right Sidebar - Optional)
   - Version comparison and change tracking
   - Not yet fully implemented; prepared for future expansion
   - Menu-accessed or dockable when active
   - Domain responsibility: Tracking document changes over time

7. **Ingest** (File Menu)
   - Text import and normalization
   - Accessible via "File > Import Text" menu
   - NOT a primary mode or persistent panel
   - Only opened when user needs to import external content
   - Domain responsibility: Getting content into the system

### UI Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Menu Bar (Domain Access Layer)                                 │
│  File | Project | View | Tools     [Project Title]  [Word Count] │
└─────────────────────────────────────────────────────────────────┘
┌──────────────────┐ ┌─────────────────────────────────┐ ┌───────────┐
│                  │ │                                 │ │           │
│  Left Sidebar    │ │    Center Canvas                │ │  Right    │
│  Structure       │ │    Writing Surface              │ │  Sidebar  │
│  Domain          │ │                                 │ │           │
│                  │ │  [Item Title]                   │ │  Layout   │
│  - Sections      │ │                                 │ │  Planning │
│  - Chapters      │ │  [Editor: Clean text area]      │ │  Analysis │
│  - Scenes        │ │                                 │ │  Revision │
│                  │ │  [Neutral placeholder]          │ │  (Toggle) │
│                  │ │                                 │ │           │
└──────────────────┘ └─────────────────────────────────┘ └───────────┘
  (Resizable)          (Always visible, minimal)        (Optional panels)
```

## Key Changes

### 1. Menu Bar (New)
- **Purpose**: Domain-level command access without panel clutter
- **Domains Exposed**:
  - File: Load, Import, Export (JSON/Markdown)
  - Project: Add Chapter, Add Section, View Structure
  - View: Toggle panels on/off (Structure, Layout, Planning, Analysis, Revision)
  - Tools: Search, Word Analysis, Settings

### 2. Sidebar System (Redesigned)
- **Left Sidebar**: Structure domain only (always pinned, collapsible)
- **Right Sidebar**: Multiple optional domains (Layout, Planning, Analysis, Revision)
- **Both Sidebars**: Resizable, persistent state saved to localStorage
- **No Auto-Opening**: Panels remain closed until user explicitly toggles them

### 3. Center Canvas (Refined)
- **Truly distraction-free**: Removed tools rail
- **Minimal header**: Item number and title only (optional)
- **Neutral placeholder**: Removed workflow language ("Select an item to edit" not "begin writing")
- **Layout controls** moved to right sidebar or layout toolbar (optional)

### 4. Language Updates
- **Removed workflow bias**: "Begin writing", "Final manuscript", "Start chapter" → neutral
- **"Chapters" → "Items"**: More generic terminology
- **"Canvas"**: Still used internally; friendly name for center editing area

## UI Rules (Maintained)

✓ **Do NOT remove existing functionality**  
✓ **Do NOT force a linear workflow**  
✓ **Do NOT overload any single panel**  
✓ **Do NOT auto-open panels without user action**  
✓ Keep the center panel calm and uncluttered  
✓ Domains coexist without hiding each other  

## State Persistence

All panel states persist via `localStorage`:
- `sidebar-left-width`: Width of left sidebar (default: 320px)
- `sidebar-right-width`: Width of right sidebar (default: 320px)
- `panel-{domain}-visible`: Whether each right-sidebar domain is open
- `editor-wrap-width`: Wrap width setting (default: 1000px)
- `editor-line-height`: Line height setting (default: 1.8)
- `editor-char-spacing`: Character spacing setting (default: 0)

## Code Organization

### Domains in Renderer

Each domain is initialized by a dedicated function:
- `initStructureDomain()` - Navigation and document organization
- `initWritingDomain()` - Text editing and paste handling
- `initLayoutDomain()` - Visual controls (width, spacing, line height)
- `initAnalysisDomain()` - Statistics calculation and display
- (Revision, Planning, Ingest: prepared but minimal implementation)

### Menu & Command Layer
- `initMenuBar()` - Button setup and dropdown toggle
- `initDropdownMenus()` - Menu item actions and command routing
- `togglePanelVisibility()` - Open/close panels programmatically

### Panel Management
- `initPanelControls()` - Close buttons on panels
- `initPanelResizing()` - Mouse drag resizing for sidebars
- `restorePanelState()` - Load saved panel visibility on startup

## Usage Examples

### Opening a Domain Panel
1. Click "View" menu → Check "Layout" → Layout panel appears on right
2. Close via the × button on the panel header, or uncheck in menu

### Adjusting Layout
1. Open View menu > Layout (checkbox)
2. Adjust line width, height, character spacing
3. Changes persist to localStorage automatically
4. Changes are non-destructive (text content unaffected)

### Organizing Structure
1. Drag chapters up/down in Structure panel
2. Double-click chapter name to rename inline
3. Hover over chapter to reveal action buttons (↑↓✎+)
4. Add scenes to a chapter with the + button

### Exporting Work
1. File menu > Export as JSON (full structured data)
2. File menu > Export as Markdown (human-readable)
3. Both preserve the document hierarchy

## Future Expansion

### Planning Domain
- Prepare for implementation of outline mode
- Card-based organization system
- High-level scene planning

### Revision Domain
- Version history tracking
- Change comparison
- Rollback functionality

### Ingest Domain
- Text file import wizard
- Normalization rules
- Multi-file batch import

## Migration from Old UI

### Old Behavior → New Behavior
| Feature | Old | New |
|---------|-----|-----|
| Load project | "Open" button in Structure panel | File > Load Project menu |
| Add chapter | "+" button in Structure panel | Project > Add Item menu or Structure panel + button |
| Wrap width control | Right tools rail button | View > Layout panel (optional) |
| Stats display | Tools rail > "Σ" button | View > Analysis panel (optional) |
| Export | Tools rail > Export button | File menu |
| Search | Tools rail, in-editor | Tools > Search in Document menu (planned) |

## Testing Checklist

- [x] Menu bar displays and toggles dropdowns correctly
- [x] View menu checkboxes toggle panel visibility
- [x] Panels persist state across page reload
- [x] Sidebars resize smoothly
- [x] Structure panel tree renders correctly
- [x] Chapters load into editor and save content
- [x] Layout controls (width, height, spacing) apply non-destructively
- [x] Analysis panel updates in real-time
- [x] Export to JSON and Markdown works
- [x] Keyboard shortcuts (Enter to rename, Escape to cancel)
- [x] All domains coexist without conflicts

## Notes for Developers

1. **No Breaking Changes**: All existing project file formats remain compatible
2. **Domain Isolation**: Each domain is responsible for its own state and UI
3. **Clean API**: Functions are grouped by domain with clear comments
4. **Extensibility**: New domains can be added without disrupting existing ones
5. **localStorage Strategy**: Minimal, domain-based keys to avoid collisions

## Known Limitations

- **Planning domain**: UI skeleton only; not yet functional
- **Revision domain**: UI skeleton only; not yet functional
- **Ingest domain**: Menu item only; import dialog not yet implemented
- **Search**: Prepared in code but not yet wired to UI

---

**Version**: 0.2.0  
**Refactor Date**: December 2025  
**Status**: Multi-domain architecture implemented, all domains coexist
