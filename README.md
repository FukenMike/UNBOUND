# UNBOUND - Native Qt6 Writer Application

A professional writer's cockpit built with C++ and Qt6 Widgets.

## Build Requirements

- CMake 3.16+
- Qt6 (Core, Widgets)
- C++17 compiler (gcc, clang, or MSVC)

## Build Instructions

```bash
cd qt-app
mkdir build
cd build
cmake ..
make
./unbound
```

## Architecture

- **MainWindow**: QMainWindow shell with dockable panels
- **StructurePanel**: Document organization tree (left dock)
- **LayoutPanel**: Visual controls for editor (right dock)
- **WritingPanel**: Central text editor
- **PlanningPanel**: Notes and outlines (bottom dock)
- **AnalysisPanel**: Statistics (right dock, tabbed)
- **RevisionPanel**: Version history (floating)

## Features

- Fully dockable/draggable panels
- Persistent window state via QSettings
- Real-time chapter selection and editing
- Visual layout controls (page tone, spacing, width)
- Word count and statistics tracking
