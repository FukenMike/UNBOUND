#include "MainWindow.hpp"
#include "WritingPanel.hpp"
#include "StructurePanel.hpp"
#include "LayoutPanel.hpp"
#include "AnalysisPanel.hpp"
#include "PlanningPanel.hpp"
#include "RevisionPanel.hpp"
#include "model/Chapter.hpp"
#include "core/MarkdownConverter.hpp"
#include <QMenuBar>
#include <QMenu>
#include <QAction>
#include <QVBoxLayout>
#include <QFileDialog>
#include <QMessageBox>
#include <QFile>
#include <QTextStream>
#include <QFontDatabase>
#include <QColorDialog>

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
    
    // Text formatting
    QAction* boldAction = formatMenu->addAction("&Bold");
    boldAction->setShortcut(QKeySequence::Bold);
    connect(boldAction, &QAction::triggered, [this]() {
        QTextCharFormat fmt;
        fmt.setFontWeight(writingPanel->editor()->fontWeight() == QFont::Bold ? QFont::Normal : QFont::Bold);
        writingPanel->editor()->mergeCurrentCharFormat(fmt);
    });
    
    QAction* italicAction = formatMenu->addAction("&Italic");
    italicAction->setShortcut(QKeySequence::Italic);
    connect(italicAction, &QAction::triggered, [this]() {
        QTextCharFormat fmt;
        fmt.setFontItalic(!writingPanel->editor()->fontItalic());
        writingPanel->editor()->mergeCurrentCharFormat(fmt);
    });
    
    QAction* underlineAction = formatMenu->addAction("&Underline");
    underlineAction->setShortcut(QKeySequence::Underline);
    connect(underlineAction, &QAction::triggered, [this]() {
        QTextCharFormat fmt;
        fmt.setFontUnderline(!writingPanel->editor()->fontUnderline());
        writingPanel->editor()->mergeCurrentCharFormat(fmt);
    });
    
    QAction* strikethroughAction = formatMenu->addAction("&Strikethrough");
    strikethroughAction->setShortcut(QKeySequence("Ctrl+Shift+X"));
    connect(strikethroughAction, &QAction::triggered, [this]() {
        QTextCharFormat fmt = writingPanel->editor()->currentCharFormat();
        fmt.setFontStrikeOut(!fmt.fontStrikeOut());
        writingPanel->editor()->mergeCurrentCharFormat(fmt);
    });
    
    formatMenu->addSeparator();
    
    // Font family submenu
    QMenu* fontMenu = formatMenu->addMenu("Font &Family");
    QStringList fonts = {"Arial", "Times New Roman", "Courier New", "Georgia", "Verdana"};
    for (const QString& font : fonts) {
        QAction* fontAction = fontMenu->addAction(font);
        connect(fontAction, &QAction::triggered, [this, font]() {
            QTextCharFormat fmt;
            fmt.setFontFamily(font);
            writingPanel->editor()->mergeCurrentCharFormat(fmt);
        });
    }
    
    // Font size submenu
    QMenu* sizeMenu = formatMenu->addMenu("Font &Size");
    QList<int> sizes = {8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 72};
    for (int size : sizes) {
        QAction* sizeAction = sizeMenu->addAction(QString::number(size));
        connect(sizeAction, &QAction::triggered, [this, size]() {
            QTextCharFormat fmt;
            fmt.setFontPointSize(size);
            writingPanel->editor()->mergeCurrentCharFormat(fmt);
        });
    }
    
    formatMenu->addSeparator();
    
    // Text color
    QAction* textColorAction = formatMenu->addAction("Text &Color...");
    connect(textColorAction, &QAction::triggered, [this]() {
        QColor color = QColorDialog::getColor(writingPanel->editor()->textColor(), this, "Select Text Color");
        if (color.isValid()) {
            writingPanel->editor()->setTextColor(color);
        }
    });
    
    // Highlight color
    QAction* highlightAction = formatMenu->addAction("&Highlight Color...");
    connect(highlightAction, &QAction::triggered, [this]() {
        QColor color = QColorDialog::getColor(Qt::yellow, this, "Select Highlight Color");
        if (color.isValid()) {
            QTextCharFormat fmt;
            fmt.setBackground(color);
            writingPanel->editor()->mergeCurrentCharFormat(fmt);
        }
    });
    
    formatMenu->addSeparator();
    
    // Alignment submenu
    QMenu* alignMenu = formatMenu->addMenu("&Alignment");
    
    QAction* alignLeftAction = alignMenu->addAction("Align &Left");
    alignLeftAction->setShortcut(QKeySequence("Ctrl+L"));
    connect(alignLeftAction, &QAction::triggered, [this]() {
        writingPanel->editor()->setAlignment(Qt::AlignLeft);
    });
    
    QAction* alignCenterAction = alignMenu->addAction("Align &Center");
    alignCenterAction->setShortcut(QKeySequence("Ctrl+E"));
    connect(alignCenterAction, &QAction::triggered, [this]() {
        writingPanel->editor()->setAlignment(Qt::AlignCenter);
    });
    
    QAction* alignRightAction = alignMenu->addAction("Align &Right");
    alignRightAction->setShortcut(QKeySequence("Ctrl+R"));
    connect(alignRightAction, &QAction::triggered, [this]() {
        writingPanel->editor()->setAlignment(Qt::AlignRight);
    });
    
    QAction* alignJustifyAction = alignMenu->addAction("&Justify");
    alignJustifyAction->setShortcut(QKeySequence("Ctrl+J"));
    connect(alignJustifyAction, &QAction::triggered, [this]() {
        writingPanel->editor()->setAlignment(Qt::AlignJustify);
    });
    
    formatMenu->addSeparator();
    
    // Lists submenu
    QMenu* listMenu = formatMenu->addMenu("&Lists");
    
    QAction* bulletListAction = listMenu->addAction("&Bullet List");
    bulletListAction->setShortcut(QKeySequence("Ctrl+Shift+B"));
    connect(bulletListAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        QTextListFormat listFormat;
        listFormat.setStyle(QTextListFormat::ListDisc);
        cursor.createList(listFormat);
    });
    
    QAction* numberedListAction = listMenu->addAction("&Numbered List");
    numberedListAction->setShortcut(QKeySequence("Ctrl+Shift+N"));
    connect(numberedListAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        QTextListFormat listFormat;
        listFormat.setStyle(QTextListFormat::ListDecimal);
        cursor.createList(listFormat);
    });
    
    formatMenu->addSeparator();
    
    // Indent
    QAction* increaseIndentAction = formatMenu->addAction("&Increase Indent");
    increaseIndentAction->setShortcut(QKeySequence("Ctrl+]"));
    connect(increaseIndentAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        QTextBlockFormat fmt = cursor.blockFormat();
        fmt.setIndent(fmt.indent() + 1);
        cursor.setBlockFormat(fmt);
    });
    
    QAction* decreaseIndentAction = formatMenu->addAction("&Decrease Indent");
    decreaseIndentAction->setShortcut(QKeySequence("Ctrl+["));
    connect(decreaseIndentAction, &QAction::triggered, [this]() {
        QTextCursor cursor = writingPanel->editor()->textCursor();
        QTextBlockFormat fmt = cursor.blockFormat();
        if (fmt.indent() > 0) {
            fmt.setIndent(fmt.indent() - 1);
            cursor.setBlockFormat(fmt);
        }
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
    
    // Load chapter content
    Chapter* chapter = chapters[id];
    writingPanel->setTitle(chapter->title());
    writingPanel->setContentHtml(chapter->content());
}

void MainWindow::saveCurrentChapter()
{
    if (currentChapterId.isEmpty() || !chapters.contains(currentChapterId)) {
        return;
    }
    
    Chapter* chapter = chapters[currentChapterId];
    chapter->setContent(writingPanel->getContentHtml());
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
    
    QString html = MarkdownConverter::markdownToHtml(markdown);
    writingPanel->setContentHtml(html);
    
    QMessageBox::information(this, "Import Complete", "Markdown file imported successfully.");
}

void MainWindow::onExportMarkdown()
{
    if (writingPanel->getContentPlain().isEmpty()) {
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
    
    QString html = writingPanel->getContentHtml();
    QString markdown = MarkdownConverter::htmlToMarkdown(html);
    
    QTextStream out(&file);
    out << markdown;
    file.close();
    
    QMessageBox::information(this, "Export Complete", "Content exported to Markdown successfully.");
}
