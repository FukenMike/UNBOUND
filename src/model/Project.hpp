#pragma once

#include <QObject>
#include <QString>
#include <QVector>

// Forward declaration
class Chapter;

class Project : public QObject
{
    Q_OBJECT

public:
    explicit Project(QObject* parent = nullptr);

    QString title() const { return m_title; }
    void setTitle(const QString& title);

    int wordCount() const;

signals:
    void titleChanged(const QString& title);
    void structureChanged();

private:
    QString m_title;
    QVector<Chapter*> m_chapters;
};
