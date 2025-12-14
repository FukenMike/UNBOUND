#include "StructurePanel.hpp"
#include <QVBoxLayout>
#include <QAbstractItemModel>
#include <QMimeData>

StructurePanel::StructurePanel(QWidget* parent)
    : QDockWidget("Structure", parent)
    , itemCounter(0)
{
    // Create main widget container
    auto* mainWidget = new QWidget(this);
    auto* layout = new QVBoxLayout(mainWidget);
    layout->setContentsMargins(0, 0, 0, 0);

    // Create tree widget
    tree = new QTreeWidget(this);
    tree->setHeaderHidden(true);
    tree->setSelectionMode(QAbstractItemView::SingleSelection);
    tree->setSelectionBehavior(QAbstractItemView::SelectItems);
    tree->setDragDropMode(QAbstractItemView::InternalMove);
    tree->setDefaultDropAction(Qt::MoveAction);
    tree->setColumnCount(1);

    // Build default structure
    buildDefaultStructure();

    // Connect selection changes
    connect(tree->selectionModel(), &QItemSelectionModel::selectionChanged,
            this, &StructurePanel::handleSelectionChanged);

    layout->addWidget(tree);

    // Create footer with word count
    wordCountLabel = new QLabel("Total Word Count: 0 words", this);
    wordCountLabel->setStyleSheet("color: #666; font-size: 11px; padding: 4px;");
    layout->addWidget(wordCountLabel);

    mainWidget->setLayout(layout);
    setWidget(mainWidget);
}

void StructurePanel::buildDefaultStructure()
{
    // Front Matter section (unchecked items)
    frontMatter = new QTreeWidgetItem(tree);
    frontMatter->setText(0, "Front Matter");
    frontMatter->setFlags(frontMatter->flags() & ~(Qt::ItemIsUserCheckable | Qt::ItemIsDragEnabled | Qt::ItemIsDropEnabled));
    frontMatter->setExpanded(true);

    QStringList frontItems = {
        "Copyright",
        "Dedication",
        "Epigraph",
        "Table of Contents",
        "Foreword",
        "Preface",
        "Acknowledgments"
    };
    for (const auto& itemName : frontItems) {
        auto* item = new QTreeWidgetItem(frontMatter);
        item->setText(0, itemName);
        item->setFlags(item->flags() | Qt::ItemIsUserCheckable | Qt::ItemIsEditable);
        item->setCheckState(0, Qt::Unchecked);
        item->setData(0, Qt::UserRole, QString("item_%1").arg(itemCounter++));
    }

    // Body section (checked items, supports drag-drop)
    body = new QTreeWidgetItem(tree);
    body->setText(0, "Body");
    body->setFlags(body->flags() & ~(Qt::ItemIsUserCheckable | Qt::ItemIsDragEnabled | Qt::ItemIsDropEnabled));
    body->setExpanded(true);

    QStringList bodyItems = {
        "Prologue",
        "Introduction",
        "Untitled Chapter",
        "Conclusion",
        "Epilogue",
        "Afterword"
    };
    for (const auto& itemName : bodyItems) {
        auto* item = new QTreeWidgetItem(body);
        item->setText(0, itemName);
        item->setFlags(item->flags() | Qt::ItemIsUserCheckable | Qt::ItemIsEditable | 
                       Qt::ItemIsDragEnabled | Qt::ItemIsDropEnabled);
        item->setCheckState(0, Qt::Checked);
        item->setData(0, Qt::UserRole, QString("item_%1").arg(itemCounter++));
    }

    // Back Matter section (checked items)
    backMatter = new QTreeWidgetItem(tree);
    backMatter->setText(0, "Back Matter");
    backMatter->setFlags(backMatter->flags() & ~(Qt::ItemIsUserCheckable | Qt::ItemIsDragEnabled | Qt::ItemIsDropEnabled));
    backMatter->setExpanded(true);

    QStringList backItems = {
        "Notes",
        "About the Author"
    };
    for (const auto& itemName : backItems) {
        auto* item = new QTreeWidgetItem(backMatter);
        item->setText(0, itemName);
        item->setFlags(item->flags() | Qt::ItemIsUserCheckable | Qt::ItemIsEditable);
        item->setCheckState(0, Qt::Checked);
        item->setData(0, Qt::UserRole, QString("item_%1").arg(itemCounter++));
    }
}

void StructurePanel::updateWordCount(int count)
{
    wordCountLabel->setText(QString("Total Word Count: %1 words").arg(count));
}

void StructurePanel::handleSelectionChanged()
{
    QList<QTreeWidgetItem*> selected = tree->selectedItems();
    if (!selected.isEmpty()) {
        QTreeWidgetItem* item = selected.first();
        // Don't emit signal for section headers
        if (item != frontMatter && item != body && item != backMatter) {
            QString id = item->data(0, Qt::UserRole).toString();
            emit itemSelected(id);
        }
    }
}
