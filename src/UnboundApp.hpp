#pragma once

#include <QApplication>

class UnboundApp : public QApplication
{
    Q_OBJECT

public:
    UnboundApp(int argc, char* argv[]);
    int run();

private:
    class MainWindow* m_mainWindow;
};
