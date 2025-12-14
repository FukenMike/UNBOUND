#pragma once

#include <QWidget>
#include <QPlainTextEdit>
#include <QLabel>

class WritingPanel : public QWidget
{
    Q_OBJECT

public:
    explicit WritingPanel(QWidget* parent = nullptr);

    void setContent(const QString& content);
    QString getContent() const;
    void setTitle(const QString& title);

signals:
    void contentChanged(const QString& content);

private:
    QLabel* titleLabel;
    QPlainTextEdit* editor;
};
