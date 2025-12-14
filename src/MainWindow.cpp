#include "MainWindow.hpp"
#include "WritingPanel.hpp"
#include "StructurePanel.hpp"
#include "LayoutPanel.hpp"
#include "AnalysisPanel.hpp"
#include "PlanningPanel.hpp"
#include "RevisionPanel.hpp"
#include "model/Chapter.hpp"
#include <QMenuBar>
#include <QMenu>
#include <QAction>
#include <QVBoxLayout>
#include <QFileDialog>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>
#include <QTextCursor>

MainWindow::MainWindow(QWidget* parent)
    : QMainWindow(parent)
{
    setWindowTitle("UNBOUND - Professional Writer's Cockpit");
    setGeometry(100, 100, 1200, 800);

    setupPanels();
    setupMenus();
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

void MainWindow::setupMenus()
{
    // File menu
    QMenu* fileMenu = menuBar()->addMenu("&File");
    
    QAction* importMarkdown = fileMenu->addAction("Import &Markdown...");
    importMarkdown->setShortcut(QKeySequence("Ctrl+Shift+O"));
    connect(importMarkdown, &QAction::triggered, this, &MainWindow::onImportMarkdown);
    
    QAction* exportMarkdown = fileMenu->addAction("&Export Markdown...");
    exportMarkdown->setShortcut(QKeySequence("Ctrl+Shift+S"));
    connect(exportMarkdown, &QAction::triggered, this, &MainWindow::onExportMarkdown);
    
    fileMenu->addSeparator();
    
    QAction* exitAction = fileMenu->addAction("E&xit");
    exitAction->setShortcut(QKeySequence("Ctrl+Q"));
    connect(exitAction, &QAction::triggered, this, &QWidget::close);
    
    // Edit menu
    setupEditMenu();
    
    // Format menu
    setupFormatMenu();
}

void MainWindow::setupEditMenu()
{
    QMenu* editMenu = menuBar()->addMenu("&Edit");
    
    QAction* undoAction = editMenu->addAction("&Undo");
    undoAction->setShortcut(QKeySequence::Undo);
    connect(undoAction, &QAction::triggered, [this]() {
        writingPanel->editor()->undo();
    });
    
    QAction* redoAction = editMenu->addAction("&Redo");
    redoAction->setShortcut(QKeySequence::Redo);
    connect(redoAction, &QAction::triggered, [this]() {
        writingPanel->editor()->redo();
    });
    
    editMenu->addSeparator();
    
    QAction* cutAction = editMenu->addAction("Cu&t");
    cutAction->setShortcut(QKeySequence::Cut);
    connect(cutAction, &QAction::triggered, [this]() {
        writingPanel->editor()->cut();
    });
    
    QAction* copyAction = editMenu->addAction("&Copy");
    copyAction->setShortcut(QKeySequence::Copy);
    connect(copyAction, &QAction::triggered, [this]() {
        writingPanel->editor()->copy();
    });
    
    QAction* pasteAction = editMenu->addAction("&Paste");
    pasteAction->setShortcut(QKeySequence::Paste);
    connect(pasteAction, &QAction::triggered, [this]() {
        writingPanel->editor()->paste();
    });
    
    editMenu->addSeparator();
    
    QAction* selectAllAction = editMenu->addAction("Select &All");
    selectAllAction->setShortcut(QKeySequence::SelectAll);
    connect(selectAllAction, &QAction::triggered, [this]() {
        writingPanel->editor()->selectAll();
    });
    
    editMenu->addSeparator();
    
    QAction* findAction = editMenu->addAction("&Find...");
    findAction->setShortcut(QKeySequence::Find);
    connect(findAction, &QAction::triggered, [this]() {
        // Placeholder for find functionality
        QMessageBox::information(this, "Find", "Find functionality coming soon!");
    });
    
    QAction* replaceAction = editMenu->addAction("&Replace...");
    replaceAction->setShortcut(QKeySequence("Ctrl+H"));
    connect(replaceAction, &QAction::triggered, [this]() {
        // Placeholder for replace functionality
        QMessageBox::information(this, "Replace", "Replace functionality coming soon!");
    });
}

void MainWindow::setupFormatMenu()
{
    QMenu* formatMenu = menuBar()->addMenu("F&ormat");
    
    // Markdown formatting helpers - insert syntax around selection
    QAction* boldAction = formatMenu->addAction("&Bold");
    boldAction->setShortcut(QKeySequence::Bold);
    connect(boldAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        if (cursor.hasSelection()) {
            QString selected = cursor.selectedText();
            cursor.insertText("**" + selected + "**");
        } else {
            cursor.insertText("****");
            cursor.movePosition(QTextCursor::Left, QTextCursor::MoveAnchor, 2);
            writingPanel->editor()->setTextCursor(cursor);
        }
    });
    
    QAction* italicAction = formatMenu->addAction("&Italic");
    italicAction->setShortcut(QKeySequence::Italic);
    connect(italicAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        if (cursor.hasSelection()) {
            QString selected = cursor.selectedText();
            cursor.insertText("*" + selected + "*");
        } else {
            cursor.insertText("**");
            cursor.movePosition(QTextCursor::Left, QTextCursor::MoveAnchor, 1);
            writingPanel->editor()->setTextCursor(cursor);
        }
    });
    
    QAction* strikeAction = formatMenu->addAction("&Strikethrough");
    strikeAction->setShortcut(QKeySequence("Ctrl+Shift+X"));
    connect(strikeAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        if (cursor.hasSelection()) {
            QString selected = cursor.selectedText();
            cursor.insertText("~~" + selected + "~~");
        } else {
            cursor.insertText("~~~~");
            cursor.movePosition(QTextCursor::Left, QTextCursor::MoveAnchor, 2);
            writingPanel->editor()->setTextCursor(cursor);
        }
    });
    
    QAction* codeAction = formatMenu->addAction("&Code");
    codeAction->setShortcut(QKeySequence("Ctrl+`"));
    connect(codeAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        if (cursor.hasSelection()) {
            QString selected = cursor.selectedText();
            cursor.insertText("`" + selected + "`");
        } else {
            cursor.insertText("``");
            cursor.movePosition(QTextCursor::Left, QTextCursor::MoveAnchor, 1);
            writingPanel->editor()->setTextCursor(cursor);
        }
    });
    
    formatMenu->addSeparator();
    
    // Headings
    QMenu* headingMenu = formatMenu->addMenu("&Heading");
    for (int level = 1; level <= 6; ++level) {
        QAction* headingAction = headingMenu->addAction(QString("Heading %1").arg(level));
        headingAction->setShortcut(QKeySequence(QString("Ctrl+Alt+%1").arg(level)));
        connect(headingAction, &QAction::triggered, [this, level]() {
            QTextCursor cursor = writingPanel->editor()->textCursor();
            cursor.movePosition(QTextCursor::StartOfBlock);
            QString prefix = QString("#").repeated(level) + " ";
            cursor.insertText(prefix);
        });
    }
    
    formatMenu->addSeparator();
    
    // Lists
    QMenu* listMenu = formatMenu->addMenu("&Lists");
    
    QAction* bulletAction = listMenu->addAction("&Bullet Point");
    bulletAction->setShortcut(QKeySequence("Ctrl+Shift+B"));
    connect(bulletAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        cursor.movePosition(QTextCursor::StartOfBlock);
        cursor.insertText("- ");
    });
    
    QAction* numberAction = listMenu->addAction("&Numbered Point");
    numberAction->setShortcut(QKeySequence("Ctrl+Shift+N"));
    connect(numberAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        cursor.movePosition(QTextCursor::StartOfBlock);
        cursor.insertText("1. ");
    });
    
    formatMenu->addSeparator();
    
    // Block elements
    QAction* quoteAction = formatMenu->addAction("&Blockquote");
    quoteAction->setShortcut(QKeySequence("Ctrl+>"));
    connect(quoteAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        cursor.movePosition(QTextCursor::StartOfBlock);
        cursor.insertText("> ");
    });
    
    QAction* codeBlockAction = formatMenu->addAction("Code &Block");
    codeBlockAction->setShortcut(QKeySequence("Ctrl+Shift+`"));
    connect(codeBlockAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        cursor.insertText("```\n\n```");
        cursor.movePosition(QTextCursor::Up);
    });
    
    QAction* horizontalAction = formatMenu->addAction("&Horizontal Rule");
    connect(horizontalAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        cursor.movePosition(QTextCursor::StartOfBlock);
        cursor.insertText("---");
    });
}



void MainWindow::connectSignals()
{
    // Connect structure panel selection to load chapter
    connect(structurePanel, &StructurePanel::itemSelected, this, &MainWindow::onStructureItemSelected);

    // Connect writing panel changes to analysis panel and auto-save
    connect(writingPanel, &WritingPanel::contentChanged, this, [this](const QString& content) {
        analysisPanel->updateStats(content);
        structurePanel->updateWordCount(writingPanel->wordCount());
        saveCurrentChapter();
    });
}

void MainWindow::onStructureItemSelected(const QString& id)
{
    // Save current chapter before switching
    saveCurrentChapter();
    
    currentChapterId = id;
    
    // Create chapter if it doesn't exist
    if (!chapters.contains(id)) {
        Chapter* chapter = new Chapter(this);
        chapter->setTitle(id);
        chapters[id] = chapter;
    }
    
    // Load chapter content (stored as Markdown)
    Chapter* chapter = chapters[id];
    writingPanel->setTitle(chapter->title());
    writingPanel->setContent(chapter->content());
}

void MainWindow::saveCurrentChapter()
{
    if (currentChapterId.isEmpty() || !chapters.contains(currentChapterId)) {
        return;
    }
    
    Chapter* chapter = chapters[currentChapterId];
    chapter->setContent(writingPanel->getContent());
}

Chapter* MainWindow::getCurrentChapter()
{
    if (currentChapterId.isEmpty() || !chapters.contains(currentChapterId)) {
        return nullptr;
    }
    return chapters[currentChapterId];
}

void MainWindow::onImportMarkdown()
{
    QString fileName = QFileDialog::getOpenFileName(this, "Import Markdown", "", "Markdown Files (*.md *.markdown);;All Files (*)");
    if (fileName.isEmpty()) {
        return;
    }
    
    QFile file(fileName);
    if (!file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QMessageBox::warning(this, "Import Error", "Could not open file for reading.");
        return;
    }
    
    QTextStream in(&file);
    QString markdown = in.readAll();
    file.close();
    
    writingPanel->setContent(markdown);
    
    QMessageBox::information(this, "Import Complete", "Markdown file imported successfully.");
}

void MainWindow::onExportMarkdown()
{
    QString markdown = writingPanel->getContent();
    if (markdown.isEmpty()) {
        QMessageBox::warning(this, "Export Error", "No content to export.");
        return;
    }
    
    QString fileName = QFileDialog::getSaveFileName(this, "Export Markdown", "", "Markdown Files (*.md);;All Files (*)");
    if (fileName.isEmpty()) {
        return;
    }
    
    QFile file(fileName);
    if (!file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QMessageBox::warning(this, "Export Error", "Could not open file for writing.");
        return;
    }
    
    QTextStream out(&file);
    out << markdown;
    file.close();
    
    QMessageBox::information(this, "Export Complete", "Content exported to Markdown successfully.");
}
