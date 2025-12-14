#include "WritingPanel.hpp"
#include <QVBoxLayout>
#include <QTextEdit>
#include <QRegularExpression>

WritingPanel::WritingPanel(QWidget* parent)
    : QWidget(parent)
{
    auto* layout = new QVBoxLayout(this);
    layout->setContentsMargins(0, 0, 0, 0);
    layout->setSpacing(0);

    m_titleLabel = new QLabel("Select an item to edit", this);
    m_titleLabel->setStyleSheet("font-size: 16px; font-weight: bold; padding: 8px; background-color: #f5f5f5;");
    layout->addWidget(m_titleLabel);

    m_editor = new QTextEdit(this);
    m_editor->setPlaceholderText("Select an item from the Structure panel to begin editing...");
    m_editor->setAcceptRichText(true);
    m_editor->setAutoFormatting(QTextEdit::AutoAll);
    layout->addWidget(m_editor);

    connect(m_editor, &QTextEdit::textChanged, this, [this]() {
        emit contentChanged(m_editor->toPlainText());
        emit wordCountChanged(wordCount());
    });

    setLayout(layout);
}

void WritingPanel::setContentHtml(const QString& html)
{
    m_editor->setHtml(html);
}

void WritingPanel::setContentPlain(const QString& text)
{
    m_editor->setPlainText(text);
}

QString WritingPanel::getContentHtml() const
{
    return m_editor->toHtml();
}

QString WritingPanel::getContentPlain() const
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
