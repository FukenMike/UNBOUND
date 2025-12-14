#include "../model/Chapter.hpp"
#include <QRegularExpression>

Chapter::Chapter(QObject* parent)
    : QObject(parent)
{
}

void Chapter::setTitle(const QString& title)
{
    if (m_title != title) {
        m_title = title;
        emit titleChanged(title);
    }
}

void Chapter::setContent(const QString& content)
{
    if (m_content != content) {
        m_content = content;
        emit contentChanged(content);
    }
}

int Chapter::wordCount() const
{
    return m_content.split(QRegularExpression("\\s+"), Qt::SkipEmptyParts).size();
}
