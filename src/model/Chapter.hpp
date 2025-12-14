#pragma once

#include <QObject>
#include <QString>

class Chapter : public QObject
{
    Q_OBJECT

public:
    explicit Chapter(QObject* parent = nullptr);

    QString title() const { return m_title; }
    void setTitle(const QString& title);

    QString content() const { return m_content; }
    void setContent(const QString& content);

    int wordCount() const;

signals:
    void titleChanged(const QString& title);
    void contentChanged(const QString& content);

private:
    QString m_title;
    QString m_content;
};
