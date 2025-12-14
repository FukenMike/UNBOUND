#include "UnboundApp.hpp"
#include "MainWindow.hpp"

UnboundApp::UnboundApp(int argc, char* argv[])
    : QApplication(argc, argv)
    , m_mainWindow(nullptr)
{
}

int UnboundApp::run()
{
    m_mainWindow = new MainWindow();
    m_mainWindow->show();
    return exec();
}
