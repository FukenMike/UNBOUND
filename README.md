# UNBOUND - Professional Writer's Cockpit

A native Qt6 C++ desktop application for manuscript writing and organization.

## Quick Start

### Prerequisites
- CMake 3.16+
- Qt6 (Core, Widgets)
- C++17 compiler (gcc/g++, clang, or MSVC)
- Linux/macOS/Windows

### Build

```bash
cd ~/Desktop/UNBOUND
rm -rf build && mkdir -p build
cd build
cmake ..
make -j$(nproc)
```

### Quick Launch

**Option 1: Launch script (recommended)**
```bash
./unbound.sh
```

**Option 2: Direct executable**
```bash
./build/src/unbound
```

**Option 3: Desktop entry**
Install to applications menu:
```bash
cp unbound.desktop ~/.local/share/applications/
chmod +x ~/.local/share/applications/unbound.desktop
```
Then launch from your application menu or desktop.

## User Interface

### Structure Panel (Left Sidebar)
Hierarchical document organization:
- **Front Matter** (unchecked by default): Copyright, Dedication, Epigraph, TOC, Foreword, Preface, Acknowledgments
- **Body** (unchecked): Prologue, Introduction, Untitled Chapter, Conclusion, Epilogue, Afterword
- **Back Matter** (unchecked): Notes, About the Author

Features:
- ✓ Double-click to rename items
- ✓ Drag-drop to reorder (Body section only)
- ✓ Real-time word count display
- ✓ Click to select and load in editor

### Writing Panel (Center)
Clean, distraction-free text editor with:
- Placeholder guidance
- Real-time word/character/paragraph counting
- Automatic content persistence

### Layout Panel (Right Sidebar)
Non-destructive visual controls:
- **Page Tone**: Dark, Neutral, Light
- **Line Height**: 1.2 - 3.0
- **Character Spacing**: -0.05 to +0.10
- **Paragraph Spacing**: 0-24px
- **Page Width**: Narrow (600px), Medium (800px), Wide (1000px), Full

### Analysis Panel (Right Sidebar, Tabbed)
Real-time statistics:
- Word count
- Character count (with/without spaces)
- Paragraph count with average words per paragraph

### Planning & Revision Panels
- **Planning**: Notes and outline workspace
- **Revision**: Version history and change tracking

## Architecture

```
src/
├── main.cpp              # Entry point
├── UnboundApp.hpp/cpp    # QApplication wrapper
├── MainWindow.hpp/cpp    # Main window with dock layout
├── StructurePanel.hpp/cpp    # Document hierarchy tree
├── WritingPanel.hpp/cpp      # Text editor
├── LayoutPanel.hpp/cpp       # Visual controls
├── AnalysisPanel.hpp/cpp     # Statistics
├── PlanningPanel.hpp/cpp     # Notes
├── RevisionPanel.hpp/cpp     # Version history
└── model/
	├── Project.hpp/cpp   # Document model
	└── Chapter.hpp/cpp   # Chapter data
```

## Building from Scratch

If you need a clean build:

```bash
cd ~/Desktop/UNBOUND
rm -rf build
mkdir build
cd build
cmake ..
make -j$(nproc)
./src/unbound
```

## Development

The project uses:
- **Qt6 Widgets** for UI
- **CMake** for build system
- **C++17** standard
- **QSettings** for persistence
- **Signals/Slots** for communication

All panels are dockable and resizable. Window state persists across sessions.
