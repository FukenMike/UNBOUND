#include "WritingPanel.hpp"
#include <QVBoxLayout>
#include <QPlainTextEdit>

WritingPanel::WritingPanel(QWidget* parent)
    : QWidget(parent)
{
    auto* layout = new QVBoxLayout(this);

    titleLabel = new QLabel("Select an item to edit", this);
    titleLabel->setStyleSheet("font-size: 16px; font-weight: bold; padding: 8px;");
    layout->addWidget(titleLabel);

    editor = new QPlainTextEdit(this);
    editor->setPlaceholderText("Select an item from the Structure panel to begin editing...");
    layout->addWidget(editor);

    connect(editor, &QPlainTextEdit::textChanged, this, [this]() {
        emit contentChanged(editor->toPlainText());
    });

    setLayout(layout);
}

void WritingPanel::setContent(const QString& content)
{
    editor->setPlainText(content);
}

QString WritingPanel::getContent() const
{
    return editor->toPlainText();
}

void WritingPanel::setTitle(const QString& title)
{
    titleLabel->setText(title);
}
