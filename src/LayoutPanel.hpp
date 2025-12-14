#pragma once

#include <QDockWidget>
#include <QComboBox>
#include <QSlider>
#include <QLabel>

class LayoutPanel : public QDockWidget
{
    Q_OBJECT

public:
    explicit LayoutPanel(QWidget* parent = nullptr);

signals:
    void layoutSettingsChanged();

private slots:
    void onSettingChanged();

private:
    QComboBox* pageToneCombo;
    QSlider* lineHeightSlider;
    QLabel* lineHeightLabel;
    QSlider* charSpacingSlider;
    QLabel* charSpacingLabel;
    QSlider* paragraphSpacingSlider;
    QLabel* paragraphSpacingLabel;
    QComboBox* pageWidthCombo;
};
