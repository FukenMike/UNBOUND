# Source-level CMakeLists.txt

set(SOURCES
    main.cpp
    UnboundApp.cpp
    MainWindow.cpp
    WritingPanel.cpp
    StructurePanel.cpp
    LayoutPanel.cpp
    AnalysisPanel.cpp
    PlanningPanel.cpp
    RevisionPanel.cpp
    model/Project.cpp
    model/Chapter.cpp
)

set(HEADERS
    UnboundApp.hpp
    MainWindow.hpp
    WritingPanel.hpp
    StructurePanel.hpp
    LayoutPanel.hpp
    AnalysisPanel.hpp
    PlanningPanel.hpp
    RevisionPanel.hpp
    model/Project.hpp
    model/Chapter.hpp
)

add_executable(unbound ${SOURCES} ${HEADERS})
target_link_libraries(unbound Qt6::Core Qt6::Widgets)
