#include "PlanningPanel.hpp"
#include <QVBoxLayout>
#include <QLabel>

PlanningPanel::PlanningPanel(QWidget* parent)
    : QDockWidget("Planning", parent)
{
    auto* mainWidget = new QWidget(this);
    auto* layout = new QVBoxLayout(mainWidget);

    auto* label = new QLabel("Planning Notes", this);
    layout->addWidget(label);

    notesEditor = new QTextEdit(this);
    notesEditor->setPlaceholderText("Write your planning notes here...");
    layout->addWidget(notesEditor);

    mainWidget->setLayout(layout);
    setWidget(mainWidget);
}
