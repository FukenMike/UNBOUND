#include "../model/Project.hpp"

Project::Project(QObject* parent)
    : QObject(parent)
    , m_title("Untitled Project")
{
}

void Project::setTitle(const QString& title)
{
    if (m_title != title) {
        m_title = title;
        emit titleChanged(title);
    }
}

int Project::wordCount() const
{
    int total = 0;
    for (const Chapter* chapter : m_chapters) {
        // TODO: accumulate word counts
    }
    return total;
}
