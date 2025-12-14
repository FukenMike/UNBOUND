#pragma once

#include <QDockWidget>
#include <QLabel>

class AnalysisPanel : public QDockWidget
{
    Q_OBJECT

public:
    explicit AnalysisPanel(QWidget* parent = nullptr);
    void updateStats(const QString& text);

private:
    QLabel* wordCountLabel;
    QLabel* charCountLabel;
    QLabel* paragraphCountLabel;
};
