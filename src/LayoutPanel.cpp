#include "LayoutPanel.hpp"
#include <QVBoxLayout>
#include <QFormLayout>
#include <QGroupBox>
#include <QHBoxLayout>

LayoutPanel::LayoutPanel(QWidget* parent)
    : QDockWidget("Layout", parent)
{
    auto* mainWidget = new QWidget(this);
    auto* layout = new QVBoxLayout(mainWidget);

    // Visual Settings Group
    auto* visualGroup = new QGroupBox("Visual Settings", this);
    auto* visualLayout = new QFormLayout(visualGroup);

    // Page tone
    pageToneCombo = new QComboBox(this);
    pageToneCombo->addItems({"Dark", "Neutral", "Light"});
    connect(pageToneCombo, QOverload<int>::of(&QComboBox::currentIndexChanged),
            this, &LayoutPanel::onSettingChanged);
    visualLayout->addRow("Page Tone:", pageToneCombo);

    // Line height
    lineHeightSlider = new QSlider(Qt::Horizontal, this);
    lineHeightSlider->setRange(12, 30);
    lineHeightSlider->setValue(18);
    lineHeightLabel = new QLabel("1.8", this);
    connect(lineHeightSlider, &QSlider::valueChanged, this, &LayoutPanel::onSettingChanged);
    auto* lineHeightLayout = new QHBoxLayout();
    lineHeightLayout->addWidget(lineHeightSlider);
    lineHeightLayout->addWidget(lineHeightLabel);
    visualLayout->addRow("Line Height:", lineHeightLayout);

    // Character spacing
    charSpacingSlider = new QSlider(Qt::Horizontal, this);
    charSpacingSlider->setRange(-5, 10);
    charSpacingSlider->setValue(0);
    charSpacingLabel = new QLabel("0.00", this);
    connect(charSpacingSlider, &QSlider::valueChanged, this, &LayoutPanel::onSettingChanged);
    auto* charSpacingLayout = new QHBoxLayout();
    charSpacingLayout->addWidget(charSpacingSlider);
    charSpacingLayout->addWidget(charSpacingLabel);
    visualLayout->addRow("Char Spacing:", charSpacingLayout);

    // Paragraph spacing
    paragraphSpacingSlider = new QSlider(Qt::Horizontal, this);
    paragraphSpacingSlider->setRange(0, 24);
    paragraphSpacingSlider->setValue(0);
    paragraphSpacingLabel = new QLabel("0", this);
    connect(paragraphSpacingSlider, &QSlider::valueChanged, this, &LayoutPanel::onSettingChanged);
    auto* paraSpacingLayout = new QHBoxLayout();
    paraSpacingLayout->addWidget(paragraphSpacingSlider);
    paraSpacingLayout->addWidget(paragraphSpacingLabel);
    visualLayout->addRow("Para Spacing:", paraSpacingLayout);

    // Page width
    pageWidthCombo = new QComboBox(this);
    pageWidthCombo->addItem("Narrow (600px)", 600);
    pageWidthCombo->addItem("Medium (800px)", 800);
    pageWidthCombo->addItem("Wide (1000px)", 1000);
    pageWidthCombo->addItem("Full Width", 0);
    pageWidthCombo->setCurrentIndex(2);
    connect(pageWidthCombo, QOverload<int>::of(&QComboBox::currentIndexChanged),
            this, &LayoutPanel::onSettingChanged);
    visualLayout->addRow("Page Width:", pageWidthCombo);

    layout->addWidget(visualGroup);
    layout->addStretch();
    mainWidget->setLayout(layout);
    setWidget(mainWidget);
}

void LayoutPanel::onSettingChanged()
{
    // Update labels to reflect slider values
    lineHeightLabel->setText(QString::number(lineHeightSlider->value() / 10.0, 'f', 1));
    charSpacingLabel->setText(QString::number(charSpacingSlider->value() / 100.0, 'f', 2));
    paragraphSpacingLabel->setText(QString::number(paragraphSpacingSlider->value()));

    emit layoutSettingsChanged();
}
