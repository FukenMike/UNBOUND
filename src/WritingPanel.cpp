#include "WritingPanel.hpp"
#include "core/MarkdownConverter.hpp"
#include <QVBoxLayout>
#include <QTextEdit>
#include <QPlainTextEdit>
#include <QStackedWidget>
#include <QRegularExpression>
#include <QFont>

WritingPanel::WritingPanel(QWidget* parent)
    : QWidget(parent)
    , m_currentMode(MarkdownMode)
{
    auto* layout = new QVBoxLayout(this);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);

    m_titleLabel = new QLabel("Select an item to edit", this);
    m_titleLabel->setStyleSheet("font-size: 16px; font-weight: bold; padding: 8px; background-color: #f5f5f5;");
    layout->addWidget(m_titleLabel);

    m_editorStack = new QStackedWidget(this);
    
    setupMarkdownEditor();
    setupRichTextEditor();
    
    m_editorStack->addWidget(m_markdownEditor);
    m_editorStack->addWidget(m_richTextEditor);
    m_editorStack->setCurrentWidget(m_markdownEditor);
    
    layout->addWidget(m_editorStack);
    setLayout(layout);
}

void WritingPanel::setupMarkdownEditor()
{
    m_markdownEditor = new QPlainTextEdit(this);
    m_markdownEditor->setPlaceholderText("Select an item from the Structure panel to begin editing...\n\nMarkdown Mode: Write using plain text with Markdown syntax.");
    
    // Set a monospace font for Markdown
    QFont monoFont("Courier New", 11);
    m_markdownEditor->setFont(monoFont);
    
    connect(m_markdownEditor, &QPlainTextEdit::textChanged, this, [this]() {
        emit contentChanged(m_markdownEditor->toPlainText());
        emit wordCountChanged(wordCount());
    });
}

void WritingPanel::setupRichTextEditor()
{
    m_richTextEditor = new QTextEdit(this);
    m_richTextEditor->setPlaceholderText("Select an item from the Structure panel to begin editing...\n\nRich Text Mode: Use Format menu for styling.");
    m_richTextEditor->setAcceptRichText(true);
    m_richTextEditor->setAutoFormatting(QTextEdit::AutoAll);
    
    connect(m_richTextEditor, &QTextEdit::textChanged, this, [this]() {
        emit contentChanged(m_richTextEditor->toPlainText());
        emit wordCountChanged(wordCount());
    });
}

void WritingPanel::setContentMarkdown(const QString& markdown)
{
    if (m_currentMode == MarkdownMode) {
        m_markdownEditor->setPlainText(markdown);
    } else {
        // Convert Markdown to HTML for rich text display
        QString html = MarkdownConverter::markdownToHtml(markdown);
        m_richTextEditor->setHtml(html);
    }
}

QString WritingPanel::getContentMarkdown() const
{
    if (m_currentMode == MarkdownMode) {
        return m_markdownEditor->toPlainText();
    } else {
        // Convert HTML back to Markdown
        QString html = m_richTextEditor->toHtml();
        return MarkdownConverter::htmlToMarkdown(html);
    }
}

void WritingPanel::setTitle(const QString& title)
{
    m_titleLabel->setText(title);
}

void WritingPanel::setEditorMode(EditorMode mode)
{
    if (m_currentMode == mode) {
        return;
    }
    
    EditorMode oldMode = m_currentMode;
    m_currentMode = mode;
    
    // Sync content between editors
    syncContentOnModeSwitch(oldMode, mode);
    
    // Switch the visible editor
    if (mode == MarkdownMode) {
        m_editorStack->setCurrentWidget(m_markdownEditor);
    } else {
        m_editorStack->setCurrentWidget(m_richTextEditor);
    }
    
    emit modeChanged(mode);
}

void WritingPanel::syncContentOnModeSwitch(EditorMode fromMode, EditorMode toMode)
{
    if (fromMode == MarkdownMode && toMode == RichTextMode) {
        // Markdown → Rich Text: Convert Markdown to HTML
        QString markdown = m_markdownEditor->toPlainText();
        QString html = MarkdownConverter::markdownToHtml(markdown);
        m_richTextEditor->setHtml(html);
    } else if (fromMode == RichTextMode && toMode == MarkdownMode) {
        // Rich Text → Markdown: Convert HTML to Markdown
        QString html = m_richTextEditor->toHtml();
        QString markdown = MarkdownConverter::htmlToMarkdown(html);
        m_markdownEditor->setPlainText(markdown);
    }
}

int WritingPanel::wordCount() const
{
    QString text;
    if (m_currentMode == MarkdownMode) {
        text = m_markdownEditor->toPlainText();
    } else {
        text = m_richTextEditor->toPlainText();
    }
    return text.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts).size();
}
