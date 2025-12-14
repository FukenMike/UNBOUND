#pragma once

#include <QDockWidget>
#include <QTextEdit>

class PlanningPanel : public QDockWidget
{
    Q_OBJECT

public:
    explicit PlanningPanel(QWidget* parent = nullptr);

private:
    QTextEdit* notesEditor;
};
