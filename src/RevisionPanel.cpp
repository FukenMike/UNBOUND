#include "RevisionPanel.hpp"
#include <QVBoxLayout>
#include <QLabel>

RevisionPanel::RevisionPanel(QWidget* parent)
    : QDockWidget("Revision", parent)
{
    auto* mainWidget = new QWidget(this);
    auto* layout = new QVBoxLayout(mainWidget);

    auto* label = new QLabel("Revision History", this);
    layout->addWidget(label);

    revisionList = new QListWidget(this);
    revisionList->addItem("No revisions yet");
    layout->addWidget(revisionList);

    mainWidget->setLayout(layout);
    setWidget(mainWidget);
}
