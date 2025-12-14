#include "WritingPanel.hpp"
#include <QVBoxLayout>
#include <QPlainTextEdit>
#include <QRegularExpression>
#include <QFont>

WritingPanel::WritingPanel(QWidget* parent)
    : QWidget(parent)
{
    auto* layout = new QVBoxLayout(this);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);

    m_titleLabel = new QLabel("Select an item to edit", this);
    m_titleLabel->setStyleSheet("font-size: 16px; font-weight: bold; padding: 8px; background-color: #f5f5f5;");
    layout->addWidget(m_titleLabel);

    m_editor = new QPlainTextEdit(this);
    m_editor->setPlaceholderText("Select an item from the Structure panel to begin editing...\n\nWrite in Markdown. Use Format menu to insert Markdown syntax.");
    
    // Set a monospace font for Markdown consistency
    QFont monoFont("Courier New", 11);
    m_editor->setFont(monoFont);
    
    connect(m_editor, &QPlainTextEdit::textChanged, this, [this]() {
        emit contentChanged(m_editor->toPlainText());
        emit wordCountChanged(wordCount());
    });
    
    layout->addWidget(m_editor);
    setLayout(layout);
}

void WritingPanel::setContent(const QString& markdown)
{
    m_editor->setPlainText(markdown);
}

QString WritingPanel::getContent() const
{
    return m_editor->toPlainText();
}

void WritingPanel::setTitle(const QString& title)
{
    m_titleLabel->setText(title);
}

int WritingPanel::wordCount() const
{
    QString text = m_editor->toPlainText();
    return text.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts).size();
}
