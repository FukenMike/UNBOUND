#include "MainWindow.hpp"
#include "WritingPanel.hpp"
#include "StructurePanel.hpp"
#include "LayoutPanel.hpp"
#include "AnalysisPanel.hpp"
#include "PlanningPanel.hpp"
#include "RevisionPanel.hpp"
#include <QMenuBar>
#include <QMenu>
#include <QAction>
#include <QVBoxLayout>

MainWindow::MainWindow(QWidget* parent)
    : QMainWindow(parent)
{
    setWindowTitle("UNBOUND - Professional Writer's Cockpit");
    setGeometry(100, 100, 1200, 800);

    setupPanels();
    connectSignals();
}

void MainWindow::setupPanels()
{
    // Create panels
    writingPanel = new WritingPanel(this);
    structurePanel = new StructurePanel(this);
    layoutPanel = new LayoutPanel(this);
    analysisPanel = new AnalysisPanel(this);
    planningPanel = new PlanningPanel(this);
    revisionPanel = new RevisionPanel(this);

    // Set central widget to writing panel
    setCentralWidget(writingPanel);

    // Add dock widgets
    addDockWidget(Qt::LeftDockWidgetArea, structurePanel);
    addDockWidget(Qt::RightDockWidgetArea, layoutPanel);
    addDockWidget(Qt::RightDockWidgetArea, analysisPanel);
    addDockWidget(Qt::BottomDockWidgetArea, planningPanel);
    addDockWidget(Qt::RightDockWidgetArea, revisionPanel);

    // Tab the right panel items
    tabifyDockWidget(layoutPanel, analysisPanel);
    tabifyDockWidget(analysisPanel, revisionPanel);
}

void MainWindow::connectSignals()
{
    // Connect structure panel selection to writing panel
    connect(structurePanel, &StructurePanel::itemSelected, this, [this](const QString& id) {
        writingPanel->setTitle("Selected: " + id);
    });

    // Connect writing panel changes to analysis panel
    connect(writingPanel, &WritingPanel::contentChanged, this, [this](const QString& content) {
        analysisPanel->updateStats(content);
        // Also update structure panel word count
        int words = content.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts).size();
        structurePanel->updateWordCount(words);
    });
}
