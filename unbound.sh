#!/bin/bash
# UNBOUND Quick Launch Script

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_DIR="$SCRIPT_DIR/build"
EXECUTABLE="$BUILD_DIR/src/unbound"

# Check if executable exists
if [ ! -f "$EXECUTABLE" ]; then
    echo "Error: Executable not found at $EXECUTABLE"
    echo "Please build the project first:"
    echo "  cd $SCRIPT_DIR"
    echo "  rm -rf build && mkdir -p build && cd build && cmake .. && make -j\$(nproc)"
    exit 1
fi

# Launch the app
echo "Launching UNBOUND..."
"$EXECUTABLE" "$@"
