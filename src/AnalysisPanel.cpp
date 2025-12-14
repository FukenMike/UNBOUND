#include "AnalysisPanel.hpp"
#include <QVBoxLayout>
#include <QFormLayout>
#include <QGroupBox>
#include <QRegularExpression>

AnalysisPanel::AnalysisPanel(QWidget* parent)
    : QDockWidget("Analysis", parent)
{
    auto* mainWidget = new QWidget(this);
    auto* layout = new QVBoxLayout(mainWidget);

    auto* statsGroup = new QGroupBox("Statistics", this);
    auto* statsLayout = new QFormLayout(statsGroup);

    wordCountLabel = new QLabel("0", this);
    charCountLabel = new QLabel("0", this);
    paragraphCountLabel = new QLabel("0", this);

    statsLayout->addRow("Words:", wordCountLabel);
    statsLayout->addRow("Characters:", charCountLabel);
    statsLayout->addRow("Paragraphs:", paragraphCountLabel);

    layout->addWidget(statsGroup);
    layout->addStretch();
    mainWidget->setLayout(layout);
    setWidget(mainWidget);
}

void AnalysisPanel::updateStats(const QString& text)
{
    QStringList words = text.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts);
    int wordCount = words.size();
    int charCount = text.length();
    
    QString textNoSpaces = text;
    int charCountNoSpaces = textNoSpaces.remove(QRegularExpression("\\s+")).length();

    QStringList paragraphs = text.split(QRegularExpression("\\n\\s*\\n"), Qt::SkipEmptyParts);
    int paragraphCount = paragraphs.size();

    double avgWordsPerParagraph = paragraphCount > 0 ? static_cast<double>(wordCount) / paragraphCount : 0;

    wordCountLabel->setText(QString::number(wordCount));
    charCountLabel->setText(QString("%1 (%2)").arg(charCount).arg(charCountNoSpaces));
    paragraphCountLabel->setText(QString("%1 (avg %2 words)").arg(paragraphCount).arg(avgWordsPerParagraph, 0, 'f', 1));
}
