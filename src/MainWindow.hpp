#pragma once

#include <QMainWindow>
#include <QHash>

class WritingPanel;
class StructurePanel;
class LayoutPanel;
class AnalysisPanel;
class PlanningPanel;
class RevisionPanel;
class Chapter;

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget* parent = nullptr);

private slots:
    void onImportMarkdown();
    void onExportMarkdown();
    void onStructureItemSelected(const QString& id);

private:
    WritingPanel* writingPanel;
    StructurePanel* structurePanel;
    LayoutPanel* layoutPanel;
    AnalysisPanel* analysisPanel;
    PlanningPanel* planningPanel;
    RevisionPanel* revisionPanel;

    // Chapter storage: maps item IDs to chapter objects
    QHash<QString, Chapter*> chapters;
    QString currentChapterId;
    
    // Menu references for enable/disable
    QMenu* formatMenu;

    void setupPanels();
    void setupMenus();
    void setupFormatMenu();
    void setupEditMenu();
    void setupViewMenu();
    void connectSignals();
    void updateMenuStates();
    
    Chapter* getCurrentChapter();
    void saveCurrentChapter();
};
