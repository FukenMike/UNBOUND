#pragma once

#include <QWidget>
#include <QPlainTextEdit>
#include <QLabel>

/**
 * WritingPanel: Clean, distraction-free Markdown editor.
 * 
 * Features:
 * - Plain text Markdown editing
 * - Monospace font for consistency
 * - Real-time word count
 * - Auto-save to Chapter model
 * - Menu-driven formatting via Markdown syntax
 */
class WritingPanel : public QWidget
{
    Q_OBJECT

public:
    explicit WritingPanel(QWidget* parent = nullptr);

    // Content management (plain Markdown text)
    void setContent(const QString& markdown);
    QString getContent() const;
    void setTitle(const QString& title);
    
    // Editor access for menu actions
    QPlainTextEdit* editor() { return m_editor; }
    
    // Statistics
    int wordCount() const;

signals:
    void contentChanged(const QString& content);
    void wordCountChanged(int count);

private:
    QLabel* m_titleLabel;
    QPlainTextEdit* m_editor;
};
