#pragma once

#include <QWidget>
#include <QTextEdit>
#include <QPlainTextEdit>
#include <QStackedWidget>
#include <QLabel>

class WritingPanel : public QWidget
{
    Q_OBJECT

public:
    enum EditorMode {
        MarkdownMode,
        RichTextMode
    };

    explicit WritingPanel(QWidget* parent = nullptr);

    // Content management (Markdown is source of truth)
    void setContentMarkdown(const QString& markdown);
    QString getContentMarkdown() const;
    void setTitle(const QString& title);
    
    // Mode switching
    void setEditorMode(EditorMode mode);
    EditorMode editorMode() const { return m_currentMode; }
    
    // Editor access for menu actions (only valid in RichTextMode)
    QTextEdit* richTextEditor() { return m_richTextEditor; }
    QPlainTextEdit* markdownEditor() { return m_markdownEditor; }
    
    // Statistics
    int wordCount() const;

signals:
    void contentChanged(const QString& content);
    void wordCountChanged(int count);
    void modeChanged(EditorMode mode);

private:
    QLabel* m_titleLabel;
    QStackedWidget* m_editorStack;
    QPlainTextEdit* m_markdownEditor;
    QTextEdit* m_richTextEditor;
    EditorMode m_currentMode;
    
    void setupMarkdownEditor();
    void setupRichTextEditor();
    void syncContentOnModeSwitch(EditorMode fromMode, EditorMode toMode);
};
