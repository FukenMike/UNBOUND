#pragma once

#include <QDockWidget>
#include <QTreeWidget>
#include <QLabel>

/**
 * StructurePanel: Left-side dockable panel for document structure.
 * 
 * Displays hierarchical organization:
 * - Front Matter (unchecked items)
 * - Body (checked items, supports drag-drop reordering)
 * - Back Matter (checked items)
 * 
 * Each item is checkable, selectable, and editable on double-click.
 * Only Body items support drag-and-drop reordering.
 */
class StructurePanel : public QDockWidget
{
    Q_OBJECT

public:
    explicit StructurePanel(QWidget* parent = nullptr);

    /**
     * Update the word count display in the footer.
     */
    void updateWordCount(int count);

signals:
    /**
     * Emitted when a structure item is selected.
     * id is the unique identifier of the selected item.
     */
    void itemSelected(const QString& id);

private slots:
    /**
     * Handle selection changes in the tree.
     */
    void handleSelectionChanged();

private:
    /**
     * Build the default document structure with all sections and items.
     */
    void buildDefaultStructure();

    // UI Components
    QTreeWidget* tree;
    QLabel* wordCountLabel;

    // Section headers
    QTreeWidgetItem* frontMatter;
    QTreeWidgetItem* body;
    QTreeWidgetItem* backMatter;

    // Item counter for generating unique IDs
    int itemCounter;
};
