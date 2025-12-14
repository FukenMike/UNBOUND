#pragma once

#include <QDockWidget>
#include <QListWidget>

class RevisionPanel : public QDockWidget
{
    Q_OBJECT

public:
    explicit RevisionPanel(QWidget* parent = nullptr);

private:
    QListWidget* revisionList;
};
