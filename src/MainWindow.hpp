#pragma once

#include <QMainWindow>

class WritingPanel;
class StructurePanel;
class LayoutPanel;
class AnalysisPanel;
class PlanningPanel;
class RevisionPanel;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget* parent = nullptr);

private:
    WritingPanel* writingPanel;
    StructurePanel* structurePanel;
    LayoutPanel* layoutPanel;
    AnalysisPanel* analysisPanel;
    PlanningPanel* planningPanel;
    RevisionPanel* revisionPanel;

    void setupPanels();
    void connectSignals();
};
