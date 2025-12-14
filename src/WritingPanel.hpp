#pragma once

#include <QWidget>
#include <QTextEdit>
#include <QLabel>

class WritingPanel : public QWidget
{
    Q_OBJECT

public:
    explicit WritingPanel(QWidget* parent = nullptr);

    // Content management
    void setContentHtml(const QString& html);
    void setContentPlain(const QString& text);
    QString getContentHtml() const;
    QString getContentPlain() const;
    void setTitle(const QString& title);
    
    // Editor access for menu actions
    QTextEdit* editor() { return m_editor; }
    
    // Statistics
    int wordCount() const;

signals:
    void contentChanged(const QString& content);
    void wordCountChanged(int count);

private:
    QLabel* m_titleLabel;
    QTextEdit* m_editor;
};
