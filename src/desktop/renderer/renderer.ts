/**
 * UNBOUND Desktop Renderer Process - Multi-Domain Architecture
 * 
 * This renderer implements a domain-aware, panel-based writing environment where
 * all major writing-related domains coexist without overwhelming the user:
 * 
 * DOMAINS:
 * 1. Structure: Left sidebar - always visible, document organization
 * 2. Writing: Center canvas - clean text editing, distraction-free
 * 3. Layout: Right sidebar - non-destructive visual controls (line width, spacing)
 * 4. Planning: Right sidebar - optional outlines and organizational tools
 * 5. Analysis: Right sidebar - read-only statistics and metrics
 * 6. Revision: Right sidebar - version comparison and change tracking
 * 7. Ingest: Menu-accessed - text import and normalization
 * 
 * Architecture:
 * - Menu bar provides top-level access to all domains
 * - Panels are dockable, resizable, and persist state across sessions
 * - No workflow assumptions; users move fluidly between domains
 * - Center canvas remains calm and uncluttered
 * - All functionality is organized by domain responsibility
 */

// Type definitions for Electron API
interface ElectronAPI {
  loadProjectFile: () => Promise<any>;
}

interface WindowWithElectron extends Window {
  electronAPI: ElectronAPI;
}

// ==============================================================================
// STATE MANAGEMENT
// ==============================================================================

let currentProject: any = null;
let currentChapter: any = null;
let currentChapterElement: HTMLElement | null = null;

// Panel state: which panels are visible
interface PanelState {
  structure: boolean;
  layout: boolean;
  planning: boolean;
  analysis: boolean;
  revision: boolean;
}

let panelState: PanelState = {
  structure: true,
  layout: false,
  planning: false,
  analysis: false,
  revision: false
};

// Panel sizes persist via localStorage
let panelSizes = {
  left: parseInt(localStorage.getItem('sidebar-left-width') || '320'),
  right: parseInt(localStorage.getItem('sidebar-right-width') || '320')
};

// Layout controls state
let layoutState = {
  wrapWidth: parseInt(localStorage.getItem('editor-wrap-width') || '1000'),
  lineHeight: parseFloat(localStorage.getItem('editor-line-height') || '1.8'),
  charSpacing: parseFloat(localStorage.getItem('editor-char-spacing') || '0'),
  paragraphSpacing: parseInt(localStorage.getItem('editor-paragraph-spacing') || '0'),
  pageTone: localStorage.getItem('editor-page-tone') || 'dark'
};

// ==============================================================================
// INITIALIZATION
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('UNBOUND renderer initialized - multi-domain architecture');
  
  // Restore panel state from localStorage
  restorePanelState();
  
  // Initialize subsystems
  initMenuBar();
  initDropdownMenus();
  initPanelControls();
  initPanelResizing();
  initStructureDomain();
  initWritingDomain();
  initLayoutDomain();
  initAnalysisDomain();
  
  console.log('UNBOUND: All domains initialized');
});

// ==============================================================================
// MENU BAR & COMMAND ACCESS LAYER
// ==============================================================================

/**
 * Initialize menu bar buttons to show/hide dropdown menus
 */
function initMenuBar() {
  const menuButtons = document.querySelectorAll('.menu-btn');
  
  menuButtons.forEach(btn => {
    btn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      const menuName = (btn as HTMLElement).dataset.menu;
      const menuEl = document.getElementById(`${menuName}-menu`);
      
      // Hide other menus
      document.querySelectorAll('.dropdown-menu').forEach(m => {
        if (m !== menuEl) (m as HTMLElement).style.display = 'none';
      });
      
      // Toggle this menu
      if (menuEl) {
        menuEl.style.display = menuEl.style.display === 'none' ? 'block' : 'none';
      }
    });
  });
  
  // Close menus when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu').forEach(m => {
      (m as HTMLElement).style.display = 'none';
    });
  });
}

/**
 * Initialize dropdown menu items and their actions
 */
function initDropdownMenus() {
  // File menu actions
  document.querySelector('[data-action="load-project"]')?.addEventListener('click', () => {
    loadProject();
  });
  
  document.querySelector('[data-action="ingest-text"]')?.addEventListener('click', () => {
    console.log('Ingest text: File import dialog (not yet implemented)');
  });
  
  document.querySelector('[data-action="export-json"]')?.addEventListener('click', () => {
    exportAsJSON();
  });
  
  document.querySelector('[data-action="export-markdown"]')?.addEventListener('click', () => {
    exportAsMarkdown();
  });
  
  // Project menu actions
  document.querySelector('[data-action="add-chapter"]')?.addEventListener('click', () => {
    addChapter();
  });
  
  // View menu: Panel toggles
  const toggleStructure = document.getElementById('toggle-structure') as HTMLInputElement;
  const toggleLayout = document.getElementById('toggle-layout') as HTMLInputElement;
  const togglePlanning = document.getElementById('toggle-planning') as HTMLInputElement;
  const toggleAnalysis = document.getElementById('toggle-analysis') as HTMLInputElement;
  const toggleRevision = document.getElementById('toggle-revision') as HTMLInputElement;
  
  toggleStructure?.addEventListener('change', () => {
    togglePanelVisibility('structure', toggleStructure.checked);
  });
  
  toggleLayout?.addEventListener('change', () => {
    togglePanelVisibility('layout', toggleLayout.checked);
  });
  
  togglePlanning?.addEventListener('change', () => {
    togglePanelVisibility('planning', togglePlanning.checked);
  });
  
  toggleAnalysis?.addEventListener('change', () => {
    togglePanelVisibility('analysis', toggleAnalysis.checked);
  });
  
  toggleRevision?.addEventListener('change', () => {
    togglePanelVisibility('revision', toggleRevision.checked);
  });
}

/**
 * Toggle domain panel visibility and persist state
 */
function togglePanelVisibility(domain: string, visible: boolean) {
  (panelState as any)[domain] = visible;
  localStorage.setItem(`panel-${domain}-visible`, visible.toString());
  
  const panelEl = document.getElementById(`panel-${domain}`);
  if (panelEl) {
    panelEl.style.display = visible ? 'flex' : 'none';
  }
  
  updateMenuCheckboxes();
}

/**
 * Restore panel visibility state from localStorage
 */
function restorePanelState() {
  Object.keys(panelState).forEach((domain: string) => {
    const visible = localStorage.getItem(`panel-${domain}-visible`) !== 'false';
    (panelState as any)[domain] = visible;
    
    // Apply to DOM
    const panelEl = document.getElementById(`panel-${domain}`);
    if (panelEl) {
      panelEl.style.display = visible ? 'flex' : 'none';
    }
  });
  
  updateMenuCheckboxes();
}

/**
 * Update menu checkboxes to reflect current panel state
 */
function updateMenuCheckboxes() {
  const checkboxes: Record<string, string> = {
    structure: '#toggle-structure',
    layout: '#toggle-layout',
    planning: '#toggle-planning',
    analysis: '#toggle-analysis',
    revision: '#toggle-revision'
  };
  
  Object.keys(panelState).forEach((domain: string) => {
    const checkbox = document.querySelector(checkboxes[domain]) as HTMLInputElement;
    if (checkbox) {
      checkbox.checked = (panelState as any)[domain];
    }
  });
}

// ==============================================================================
// PANEL MANAGEMENT
// ==============================================================================

/**
 * Initialize close buttons on domain panels
 */
function initPanelControls() {
  document.querySelectorAll('.panel-close-btn').forEach(btn => {
    btn.addEventListener('click', (e: Event) => {
      e.stopPropagation();
      const panelId = (btn as HTMLElement).dataset.panel;
      const panelEl = document.getElementById(panelId!);
      if (panelEl) {
        panelEl.style.display = 'none';
        
        // Update panel state
        const domain = panelEl.dataset.domain;
        if (domain) {
          (panelState as any)[domain] = false;
          localStorage.setItem(`panel-${domain}-visible`, 'false');
          updateMenuCheckboxes();
        }
      }
    });
  });
}

/**
 * Initialize resizable sidebars
 */
function initPanelResizing() {
  const resizers = document.querySelectorAll('.resizer');
  
  resizers.forEach(resizer => {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let sidebar: HTMLElement | null = null;
    
    resizer.addEventListener('mousedown', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isResizing = true;
      startX = mouseEvent.clientX;
      
      // Determine which sidebar to resize
      const isLeftResizer = resizer.classList.contains('resizer-left');
      sidebar = isLeftResizer ? document.getElementById('sidebar-left') : document.getElementById('sidebar-right');
      
      if (sidebar) {
        startWidth = sidebar.offsetWidth;
        (resizer as HTMLElement).classList.add('resizing');
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
      }
    });
    
    document.addEventListener('mousemove', (e: Event) => {
      if (!isResizing || !sidebar) return;
      
      const mouseEvent = e as MouseEvent;
      const isLeftResizer = resizer.classList.contains('resizer-left');
      const delta = isLeftResizer ? (mouseEvent.clientX - startX) : (startX - mouseEvent.clientX);
      const newWidth = Math.max(200, Math.min(600, startWidth + delta));
      
      (sidebar as HTMLElement).style.width = `${newWidth}px`;
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing && sidebar) {
        isResizing = false;
        (resizer as HTMLElement).classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Persist sidebar widths
        const isLeftResizer = resizer.classList.contains('resizer-left');
        if (isLeftResizer) {
          panelSizes.left = (sidebar as HTMLElement).offsetWidth;
          localStorage.setItem('sidebar-left-width', panelSizes.left.toString());
        } else {
          panelSizes.right = (sidebar as HTMLElement).offsetWidth;
          localStorage.setItem('sidebar-right-width', panelSizes.right.toString());
        }
      }
    });
  });
  
  // Apply persisted sizes
  const sidebarLeft = document.getElementById('sidebar-left') as HTMLElement;
  const sidebarRight = document.getElementById('sidebar-right') as HTMLElement;
  
  if (sidebarLeft) sidebarLeft.style.width = `${panelSizes.left}px`;
  if (sidebarRight) sidebarRight.style.width = `${panelSizes.right}px`;
}

// ==============================================================================
// DOMAIN: STRUCTURE
// ==============================================================================

/**
 * Initialize Structure domain - document organization and navigation
 */
function initStructureDomain() {
  // Will be bound when project is loaded
}

/**
 * Load project via Electron dialog
 */
async function loadProject() {
  try {
    const project = await (window as unknown as WindowWithElectron).electronAPI.loadProjectFile();
    if (project) {
      currentProject = project;
      renderProjectStructure(project);
      updateProjectInfo(project);
    }
  } catch (err) {
    console.error('Failed to load project:', err);
  }
}

/**
 * Update project title and stats in menu bar
 */
function updateProjectInfo(project: any) {
  const titleEl = document.getElementById('project-title');
  const statsEl = document.getElementById('project-stats');
  
  if (titleEl) titleEl.textContent = project.title || 'Untitled';
  if (statsEl) {
    const totalWords = computeProjectWordCount();
    statsEl.textContent = `${totalWords} words`;
  }
}

/**
 * Render the document structure tree in the Structure panel
 */
function renderProjectStructure(project: any) {
  const treeContainer = document.getElementById('structure-tree');
  if (!treeContainer) return;
  
  treeContainer.innerHTML = '';
  
  // Project root node
  const projectNode = createTreeItem('📄', project.title || 'Untitled', 'project');
  treeContainer.appendChild(projectNode);
  
  // Sections
  if (project.sections && project.sections.length > 0) {
    project.sections.forEach((section: any) => {
      const sectionNode = createTreeItem(
        getSectionIcon(section.kind),
        section.title || capitalizeKind(section.kind),
        'section',
        `${computeSectionWordCount(section)} words`
      );
      
      const sectionContainer = document.createElement('div');
      sectionContainer.className = 'tree-node';
      
      // Chapters
      if (section.chapters && section.chapters.length > 0) {
        section.chapters
          .filter((chapter: any) => isItemVisible(chapter))
          .forEach((chapter: any) => {
          const chapterNode = createTreeItem(
            '📖',
            chapter.title || `Item ${chapter.order}`,
            'chapter',
            `${chapterWordCount(chapter)} words`,
            chapter
          );
          
          const chapterContainer = document.createElement('div');
          chapterContainer.className = 'tree-node';
          
          // Scenes (if present)
          if (chapter.scenes && chapter.scenes.length > 0) {
            chapter.scenes.forEach((scene: any) => {
              const sceneNode = createTreeItem(
                '✦',
                scene.label || `Scene ${scene.order}`,
                'scene',
                `${scene.paragraphs?.length || 0}¶`
              );
              
              sceneNode.classList.add('scene-item');
              sceneNode.setAttribute('draggable', 'true');
              (sceneNode as any).dataset.sceneId = scene.id;
              (sceneNode as any).dataset.chapterId = chapter.id;
              
              // Scene drag handlers
              sceneNode.addEventListener('dragstart', (ev) => {
                ev.dataTransfer?.setData('text/scene', JSON.stringify({ sceneId: scene.id, chapterId: chapter.id }));
              });
              sceneNode.addEventListener('dragover', (ev) => {
                ev.preventDefault();
                sceneNode.classList.add('drag-over');
              });
              sceneNode.addEventListener('dragleave', () => sceneNode.classList.remove('drag-over'));
              sceneNode.addEventListener('drop', (ev) => {
                ev.preventDefault();
                sceneNode.classList.remove('drag-over');
                const dataStr = ev.dataTransfer?.getData('text/scene');
                if (!dataStr) return;
                try {
                  const { sceneId: srcId, chapterId: srcChap } = JSON.parse(dataStr);
                  const dstId = (sceneNode as any).dataset.sceneId;
                  const dstChap = (sceneNode as any).dataset.chapterId;
                  if (srcId && dstId && srcChap === dstChap) {
                    reorderSceneByIds(dstChap, srcId, dstId);
                  }
                } catch {}
              });
              
              chapterContainer.appendChild(sceneNode);
            });
          }
          
          sectionContainer.appendChild(chapterNode);
          sectionContainer.appendChild(chapterContainer);
          });
      }
      
      treeContainer.appendChild(sectionNode);
      treeContainer.appendChild(sectionContainer);
    });
  }
  
  // Update structure metadata
  updateStructureMeta();
  renderLayoutChapterList();
}

/**
 * Update structure panel footer with metadata
 */
function updateStructureMeta() {
  const metaEl = document.getElementById('structure-meta');
  if (metaEl && currentProject) {
    const total = computeProjectWordCount();
    metaEl.textContent = `${total} words total`;
  }
}

/**
 * Create a tree item (project, section, chapter, or scene)
 */
function createTreeItem(icon: string, label: string, type: string, meta?: string, data?: any): HTMLElement {
  const item = document.createElement('div');
  item.className = 'tree-item';
  item.dataset.type = type;
  
  if (type === 'chapter' && data?.id) {
    item.setAttribute('draggable', 'true');
    item.dataset.chapterId = data.id;
    
    // Chapter drag handlers
    item.addEventListener('dragstart', (ev) => {
      ev.dataTransfer?.setData('text/plain', data.id);
    });
    item.addEventListener('dragover', (ev) => {
      ev.preventDefault();
      item.classList.add('drag-over');
    });
    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));
    item.addEventListener('drop', (ev) => {
      ev.preventDefault();
      item.classList.remove('drag-over');
      const srcId = ev.dataTransfer?.getData('text/plain');
      const dstId = item.dataset.chapterId;
      if (srcId && dstId && srcId !== dstId) {
        reorderChapterByIds(srcId, dstId);
      }
    });
  }
  
  // Icon
  const iconSpan = document.createElement('span');
  iconSpan.className = 'tree-icon';
  iconSpan.textContent = icon;
  
  // Label
  const labelSpan = document.createElement('span');
  labelSpan.className = 'tree-label';
  labelSpan.textContent = label;
  
  // Double-click to rename (chapters only)
  if (type === 'chapter' && data) {
    labelSpan.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      const input = document.createElement('input');
      input.type = 'text';
      input.value = data.title || label;
      input.className = 'tree-label';
      item.replaceChild(input, labelSpan);
      input.focus();
      
      const commit = () => {
        const newVal = input.value.trim();
        if (newVal) data.title = newVal;
        labelSpan.textContent = data.title || label;
        item.replaceChild(labelSpan, input);
        if (currentProject) renderProjectStructure(currentProject);
      };
      
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => {
        const k = e as KeyboardEvent;
        if (k.key === 'Enter') commit();
        else if (k.key === 'Escape') item.replaceChild(labelSpan, input);
      });
    });
  }
  
  item.appendChild(iconSpan);
  item.appendChild(labelSpan);
  
  // Metadata
  if (meta) {
    const metaSpan = document.createElement('span');
    metaSpan.className = 'tree-meta';
    metaSpan.textContent = meta;
    item.appendChild(metaSpan);
  }
  
  // Chapter action buttons
  if (type === 'chapter' && data) {
    const actions = document.createElement('div');
    actions.className = 'tree-actions';
    
    const btnUp = document.createElement('button');
    btnUp.className = 'tree-action-btn';
    btnUp.title = 'Move up';
    btnUp.textContent = '↑';
    btnUp.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveChapter(data, -1);
    });
    
    const btnDown = document.createElement('button');
    btnDown.className = 'tree-action-btn';
    btnDown.title = 'Move down';
    btnDown.textContent = '↓';
    btnDown.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveChapter(data, +1);
    });
    
    const btnRename = document.createElement('button');
    btnRename.className = 'tree-action-btn';
    btnRename.title = 'Rename';
    btnRename.textContent = '✎';
    btnRename.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const newName = prompt('Rename item', data.title || 'Item');
      if (newName && currentProject) {
        data.title = newName;
        renderProjectStructure(currentProject);
      }
    });
    
    const btnAddScene = document.createElement('button');
    btnAddScene.className = 'tree-action-btn';
    btnAddScene.title = 'Add scene';
    btnAddScene.textContent = '+';
    btnAddScene.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!currentProject) return;
      data.scenes = data.scenes || [];
      const nextOrder = data.scenes.length + 1;
      data.scenes.push({ 
        id: `scene_${Date.now()}`, 
        order: nextOrder, 
        label: `Scene ${nextOrder}`, 
        paragraphs: [] 
      });
      renderProjectStructure(currentProject);
    });
    
    actions.appendChild(btnUp);
    actions.appendChild(btnDown);
    actions.appendChild(btnRename);
    actions.appendChild(btnAddScene);
    item.appendChild(actions);
  }
  
  // Chapter selection
  if (type === 'chapter' && data) {
    item.addEventListener('click', () => {
      if (currentChapterElement) {
        currentChapterElement.classList.remove('active');
      }
      item.classList.add('active');
      currentChapterElement = item;
      loadChapterContent(data);
      updateAnalytics();
    });
  }
  
  return item;
}

/**
 * Move chapter up or down
 */
function moveChapter(chapter: any, delta: number) {
  if (!currentProject) return;
  const body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body || !Array.isArray(body.chapters)) return;
  
  const idx = body.chapters.findIndex((c: any) => c.id === chapter.id);
  if (idx < 0) return;
  
  const target = idx + delta;
  if (target < 0 || target >= body.chapters.length) return;
  
  // Swap
  const tmp = body.chapters[idx];
  body.chapters[idx] = body.chapters[target];
  body.chapters[target] = tmp;
  
  // Reassign orders
  body.chapters.forEach((c: any, i: number) => c.order = i + 1);
  renderProjectStructure(currentProject);
}

/**
 * Reorder scenes within a chapter
 */
function reorderSceneByIds(chapterId: string, srcSceneId: string, dstSceneId: string) {
  if (!currentProject) return;
  const body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body) return;
  
  const chapter = body.chapters?.find((c: any) => c.id === chapterId);
  if (!chapter || !Array.isArray(chapter.scenes)) return;
  
  const srcIdx = chapter.scenes.findIndex((s: any) => s.id === srcSceneId);
  const dstIdx = chapter.scenes.findIndex((s: any) => s.id === dstSceneId);
  if (srcIdx < 0 || dstIdx < 0) return;
  
  const [moved] = chapter.scenes.splice(srcIdx, 1);
  chapter.scenes.splice(dstIdx, 0, moved);
  chapter.scenes.forEach((s: any, i: number) => s.order = i + 1);
  
  renderProjectStructure(currentProject);
}

/**
 * Reorder chapters
 */
function reorderChapterByIds(srcId: string, dstId: string) {
  if (!currentProject) return;
  const body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body || !Array.isArray(body.chapters)) return;
  
  const srcIdx = body.chapters.findIndex((c: any) => c.id === srcId);
  const dstIdx = body.chapters.findIndex((c: any) => c.id === dstId);
  if (srcIdx < 0 || dstIdx < 0) return;
  
  const [moved] = body.chapters.splice(srcIdx, 1);
  body.chapters.splice(dstIdx, 0, moved);
  body.chapters.forEach((c: any, i: number) => c.order = i + 1);
  
  renderProjectStructure(currentProject);
}

/**
 * Add a new chapter to the body section
 */
function addChapter() {
  if (!currentProject) return;
  
  let body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body) {
    body = { kind: 'body', title: 'Body', chapters: [] };
    currentProject.sections = currentProject.sections || [];
    currentProject.sections.push(body);
  }
  
  const nextOrder = (body.chapters?.length || 0) + 1;
  const newChapter = {
    id: `chap_${Date.now()}`,
    order: nextOrder,
    title: `Item ${nextOrder}`,
    scenes: [{ id: `scene_${Date.now()}`, order: 1, label: 'Scene 1', paragraphs: [] }]
  };
  
  body.chapters = body.chapters || [];
  body.chapters.push(newChapter);
  renderProjectStructure(currentProject);
  renderLayoutChapterList();
}

// ==============================================================================
// LAYOUT TOGGLES: Add / Hide / Delete items
// ==============================================================================

/**
 * Handle layout toggle for book composition items.
 * Key format: "front:copyright", "body:prologue", "back:about"
 */
function handleLayoutToggle(key: string, enabled: boolean) {
  if (!currentProject) return;
  const [sectionKind, itemKind] = key.split(':');
  ensureSection(sectionKind);
  const section = currentProject.sections.find((s: any) => s.kind === mapSectionKind(sectionKind));
  if (!section) return;

  // Find existing item by title convention
  const title = getLayoutItemTitle(sectionKind, itemKind);
  section.chapters = section.chapters || [];
  const existing = section.chapters.find((c: any) => c.title === title);

  if (enabled) {
    // Create if missing
    if (!existing) {
      const newItem = {
        id: `item_${sectionKind}_${itemKind}_${Date.now()}`,
        order: (section.chapters.length || 0) + 1,
        title,
        paragraphs: []
      };
      section.chapters.push(newItem);
    } else {
      // Unhide if previously hidden
      setItemHidden(existing.id, false);
    }
    renderProjectStructure(currentProject);
    renderLayoutChapterList();
  } else {
    if (!existing) return;
    // Ask user: Hide (keep) or Delete (destroy)
    const choice = confirm(`Turn off "${title}"?\nOK = Hide (keep for later)\nCancel = Remove permanently`);
    if (choice) {
      // Hide
      setItemHidden(existing.id, true);
    } else {
      // Remove permanently
      const idx = section.chapters.findIndex((c: any) => c.id === existing.id);
      if (idx >= 0) section.chapters.splice(idx, 1);
    }
    renderProjectStructure(currentProject);
    renderLayoutChapterList();
  }
}

/**
 * Render the chapter list in Layout panel (Body section)
 */
function renderLayoutChapterList() {
  const list = document.getElementById('layout-chapter-list');
  if (!list) return;
  list.innerHTML = '';
  if (!currentProject) return;
  const body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body || !Array.isArray(body.chapters)) return;
  const chapters = body.chapters.filter((c: any) => isItemVisible(c));
  chapters.forEach((c: any) => {
    const row = document.createElement('div');
    row.className = 'toggle-row';
    row.textContent = c.title || 'Item';
    list.appendChild(row);
  });
}

function ensureSection(sectionKey: string) {
  const kind = mapSectionKind(sectionKey);
  if (!currentProject) return;
  currentProject.sections = currentProject.sections || [];
  let section = currentProject.sections.find((s: any) => s.kind === kind);
  if (!section) {
    section = { kind, title: capitalizeKind(kind), chapters: [] };
    currentProject.sections.push(section);
  }
}

function mapSectionKind(sectionKey: string): string {
  switch (sectionKey) {
    case 'front': return 'frontMatter';
    case 'body': return 'body';
    case 'back': return 'backMatter';
    default: return sectionKey;
  }
}

function getLayoutItemTitle(sectionKey: string, itemKey: string): string {
  const titles: Record<string, string> = {
    'front:copyright': 'Copyright',
    'front:dedication': 'Dedication',
    'front:epigraph': 'Epigraph',
    'front:toc': 'Table of Contents',
    'front:foreword': 'Foreword',
    'front:preface': 'Preface',
    'front:acknowledgments': 'Acknowledgments',
    'body:prologue': 'Prologue',
    'body:introduction': 'Introduction',
    'back:notes': 'Notes',
    'back:about': 'About the Author'
  };
  return titles[`${sectionKey}:${itemKey}`] || itemKey;
}

// Hidden items persistence via localStorage
function setItemHidden(id: string, hidden: boolean) {
  const key = 'layout-hidden-map';
  const map = JSON.parse(localStorage.getItem(key) || '{}');
  map[id] = hidden;
  localStorage.setItem(key, JSON.stringify(map));
}

function isItemVisible(chapter: any): boolean {
  const key = 'layout-hidden-map';
  const map = JSON.parse(localStorage.getItem(key) || '{}');
  if (chapter && chapter.id && map[chapter.id] === true) return false;
  return true;
}

/**
 * Get icon for section kind
 */
function getSectionIcon(kind: string): string {
  switch (kind) {
    case 'frontMatter': return '📑';
    case 'body': return '📚';
    case 'backMatter': return '📋';
    default: return '📄';
  }
}

/**
 * Capitalize section kind for display
 */
function capitalizeKind(kind: string): string {
  const words: Record<string, string> = {
    'frontMatter': 'Front Matter',
    'body': 'Body',
    'backMatter': 'Back Matter'
  };
  return words[kind] || kind;
}

// ==============================================================================
// DOMAIN: WRITING
// ==============================================================================

/**
 * Initialize Writing domain - clean text editing interface
 */
function initWritingDomain() {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  
  if (!editor) return;
  
  // Handle paste events: strip formatting, preserve plain text
  editor.addEventListener('paste', (e: Event) => {
    const clipboardEvent = e as ClipboardEvent;
    e.preventDefault();
    
    const text = clipboardEvent.clipboardData?.getData('text/plain') || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);
    editor.value = before + text + after;
    
    // Restore cursor
    const newPosition = start + text.length;
    editor.selectionStart = editor.selectionEnd = newPosition;
    
    updateChapterContent(editor.value);
    updateAnalytics();
  });
  
  // Handle content changes
  editor.addEventListener('input', () => {
    updateChapterContent(editor.value);
    updateAnalytics();
  });
}

/**
 * Load chapter content into editor
 */
function loadChapterContent(chapter: any) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const editorContainer = document.getElementById('editor-container');
  const emptyState = document.getElementById('editor-empty');
  const header = document.getElementById('editor-header');
  const titleEl = document.getElementById('editor-title');
  const numberEl = document.getElementById('editor-number');
  
  if (!editor) return;
  
  currentChapter = chapter;
  
  // Extract text from chapter (scenes or paragraphs)
  let text = '';
  if (chapter.scenes && chapter.scenes.length > 0) {
    text = chapter.scenes
      .map((scene: any) => 
        scene.paragraphs?.map((p: any) => p.content).join('\n\n') || ''
      )
      .join('\n\n---\n\n');
  } else if (chapter.paragraphs && chapter.paragraphs.length > 0) {
    text = chapter.paragraphs.map((p: any) => p.content).join('\n\n');
  }
  
  editor.value = text;
  
  // Update header
  if (header && titleEl && numberEl) {
    const number = chapter.order ?? '';
    const title = chapter.title || `Item ${number}`;
    numberEl.textContent = number ? String(number) : '';
    titleEl.textContent = title;
    header.style.display = 'block';
  }
  
  // Show editor, hide empty state
  if (editorContainer && emptyState) {
    editorContainer.style.display = 'flex';
    emptyState.style.display = 'none';
  }
  
  editor.focus();
}

/**
 * Update chapter content in memory from editor
 */
function updateChapterContent(text: string) {
  if (!currentChapter) return;
  
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map((content, idx) => ({
      id: currentChapter.paragraphs?.[idx]?.id || `para_${Date.now()}_${idx}`,
      order: idx + 1,
      content
    }));
  
  if (currentChapter.scenes) {
    if (currentChapter.scenes[0]) {
      currentChapter.scenes[0].paragraphs = paragraphs;
    }
  } else {
    currentChapter.paragraphs = paragraphs;
  }
}

// ==============================================================================
// DOMAIN: LAYOUT
// ==============================================================================

/**
 * Initialize Layout domain - non-destructive visual controls
 */
function initLayoutDomain() {
  // Line width presets
  document.querySelectorAll('.layout-preset').forEach(preset => {
    preset.addEventListener('click', () => {
      const width = parseInt(preset.getAttribute('data-width') || '1000');
      setWrapWidth(width);
      
      // Update active state
      document.querySelectorAll('.layout-preset').forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
    });
  });
  
  // Line height slider
  const lineHeightSlider = document.getElementById('line-height-slider-panel') as HTMLInputElement;
  const lineHeightDisplay = document.getElementById('line-height-display');
  
  lineHeightSlider?.addEventListener('input', () => {
    const value = parseFloat(lineHeightSlider.value);
    setLineHeight(value);
    if (lineHeightDisplay) lineHeightDisplay.textContent = value.toFixed(1);
  });
  
  // Paragraph spacing slider (visual intent; textarea limitation acknowledged)
  const paraSlider = document.getElementById('paragraph-spacing-slider') as HTMLInputElement;
  const paraDisplay = document.getElementById('paragraph-spacing-display');
  paraSlider?.addEventListener('input', () => {
    const value = parseInt(paraSlider.value);
    setParagraphSpacing(value);
    if (paraDisplay) paraDisplay.textContent = value.toString();
  });

  // Character spacing slider
  const charSpacingSlider = document.getElementById('char-spacing-slider') as HTMLInputElement;
  const charSpacingDisplay = document.getElementById('char-spacing-display');
  
  charSpacingSlider?.addEventListener('input', () => {
    const value = parseFloat(charSpacingSlider.value);
    setCharSpacing(value);
    if (charSpacingDisplay) charSpacingDisplay.textContent = value.toFixed(2);
  });
  
  // Page tone presets
  document.querySelectorAll('.tone-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const tone = (btn as HTMLElement).dataset.tone || 'dark';
      setPageTone(tone);
    });
  });

  // Book composition toggles
  document.querySelectorAll('[data-layout-toggle]').forEach(t => {
    t.addEventListener('change', (ev) => {
      const checkbox = ev.target as HTMLInputElement;
      const key = (checkbox.dataset.layoutToggle || '').trim(); // e.g., front:copyright
      handleLayoutToggle(key, checkbox.checked);
    });
  });

  // Add chapter button
  const addChapterBtn = document.getElementById('layout-add-chapter');
  addChapterBtn?.addEventListener('click', () => {
    addChapter();
  });

  // Restore layout state
  restoreLayoutState();
}

/**
 * Set editor wrap width (non-destructive)
 */
function setWrapWidth(width: number) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  
  layoutState.wrapWidth = width;
  
  if (width === 0) {
    editor.style.maxWidth = '100%';
  } else {
    editor.style.maxWidth = `${width}px`;
  }
  
  localStorage.setItem('editor-wrap-width', width.toString());
}

/**
 * Set editor line height (non-destructive)
 */
function setLineHeight(value: number) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  
  layoutState.lineHeight = value;
  editor.style.lineHeight = value.toString();
  
  localStorage.setItem('editor-line-height', value.toString());
}

/**
 * Set editor character spacing (non-destructive)
 */
function setCharSpacing(value: number) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  
  layoutState.charSpacing = value;
  editor.style.letterSpacing = `${value}em`;
  
  localStorage.setItem('editor-char-spacing', value.toString());
}

/**
 * Set paragraph spacing (visual intent; limited effect with textarea)
 */
function setParagraphSpacing(px: number) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  layoutState.paragraphSpacing = px;
  // Approximate via extra padding to reduce perceived density
  editor.style.paddingTop = `${px}px`;
  editor.style.paddingBottom = `${px}px`;
  localStorage.setItem('editor-paragraph-spacing', px.toString());
}

/**
 * Set page tone (dark/neutral/light) using body data attribute
 */
function setPageTone(tone: string) {
  layoutState.pageTone = tone;
  document.body.dataset.pageTone = tone;
  localStorage.setItem('editor-page-tone', tone);
}

/**
 * Restore layout state from localStorage
 */
function restoreLayoutState() {
  setWrapWidth(layoutState.wrapWidth);
  setLineHeight(layoutState.lineHeight);
  setCharSpacing(layoutState.charSpacing);
  setParagraphSpacing(layoutState.paragraphSpacing);
  setPageTone(layoutState.pageTone);
  
  // Update sliders
  const lineHeightSlider = document.getElementById('line-height-slider-panel') as HTMLInputElement;
  const lineHeightDisplay = document.getElementById('line-height-display');
  if (lineHeightSlider) lineHeightSlider.value = layoutState.lineHeight.toString();
  if (lineHeightDisplay) lineHeightDisplay.textContent = layoutState.lineHeight.toFixed(1);
  
  const charSpacingSlider = document.getElementById('char-spacing-slider') as HTMLInputElement;
  const charSpacingDisplay = document.getElementById('char-spacing-display');
  if (charSpacingSlider) charSpacingSlider.value = layoutState.charSpacing.toString();
  if (charSpacingDisplay) charSpacingDisplay.textContent = layoutState.charSpacing.toFixed(2);

  const paraSlider = document.getElementById('paragraph-spacing-slider') as HTMLInputElement;
  const paraDisplay = document.getElementById('paragraph-spacing-display');
  if (paraSlider) paraSlider.value = layoutState.paragraphSpacing.toString();
  if (paraDisplay) paraDisplay.textContent = layoutState.paragraphSpacing.toString();
}

// ==============================================================================
// DOMAIN: ANALYSIS
// ==============================================================================

/**
 * Initialize Analysis domain - read-only statistics
 */
function initAnalysisDomain() {
  // Analytics update happens on editor input via updateAnalytics()
}

/**
 * Update analytics display
 */
function updateAnalytics() {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  
  const text = editor.value;
  const words = countWords(text);
  const chars = text.length;
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0).length;
  const avgLine = paragraphs > 0 ? Math.round(chars / paragraphs) : 0;
  
  const statsWords = document.getElementById('stat-words');
  const statsChars = document.getElementById('stat-chars');
  const statsParagraphs = document.getElementById('stat-paragraphs');
  const statsAvgLine = document.getElementById('stat-avg-line');
  
  if (statsWords) statsWords.textContent = words.toString();
  if (statsChars) statsChars.textContent = chars.toString();
  if (statsParagraphs) statsParagraphs.textContent = paragraphs.toString();
  if (statsAvgLine) statsAvgLine.textContent = avgLine.toString();
  
  updateProjectInfo(currentProject);
}

/**
 * Count words in text
 */
function countWords(text: string): number {
  const tokens = text.trim().split(/\s+/).filter(t => t.length > 0);
  return tokens.length;
}

// ==============================================================================
// EXPORT FUNCTIONS
// ==============================================================================

/**
 * Export project as JSON
 */
function exportAsJSON() {
  if (!currentProject) return;
  const json = JSON.stringify(currentProject, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProject.title || 'manuscript'}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export project as Markdown
 */
function exportAsMarkdown() {
  if (!currentProject) return;
  
  let md = `# ${currentProject.title || 'Untitled'}\n\n`;
  if (currentProject.metadata?.author) md += `**Author:** ${currentProject.metadata.author}\n\n`;
  
  currentProject.sections?.forEach((section: any) => {
    md += `## ${section.title || section.kind}\n\n`;
    md += `*${computeSectionWordCount(section)} words*\n\n`;
    
    section.chapters?.forEach((chapter: any) => {
      md += `### ${chapter.title || `Item ${chapter.order}`}\n\n`;
      md += `*${chapterWordCount(chapter)} words*\n\n`;
      
      if (chapter.scenes?.length) {
        chapter.scenes.forEach((scene: any) => {
          md += `#### ${scene.label || `Scene ${scene.order}`}\n\n`;
          scene.paragraphs?.forEach((p: any) => {
            md += `${p.content}\n\n`;
          });
        });
      } else if (chapter.paragraphs?.length) {
        chapter.paragraphs.forEach((p: any) => {
          md += `${p.content}\n\n`;
        });
      }
    });
  });
  
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${currentProject.title || 'manuscript'}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

// ==============================================================================
// UTILITY FUNCTIONS
// ==============================================================================

/**
 * Compute total word count for project
 */
function computeProjectWordCount(): number {
  if (!currentProject) return 0;
  let total = 0;
  currentProject.sections?.forEach((section: any) => {
    section.chapters?.forEach((chapter: any) => {
      total += chapterWordCount(chapter);
    });
  });
  return total;
}

/**
 * Compute word count for section
 */
function computeSectionWordCount(section: any): number {
  let total = 0;
  section.chapters?.forEach((chapter: any) => {
    total += chapterWordCount(chapter);
  });
  return total;
}

/**
 * Compute word count for chapter
 */
function chapterWordCount(chapter: any): number {
  let text = '';
  if (chapter.scenes && chapter.scenes.length > 0) {
    text = chapter.scenes
      .map((scene: any) => scene.paragraphs?.map((p: any) => p.content).join('\n\n') || '')
      .join('\n\n');
  } else if (chapter.paragraphs && chapter.paragraphs.length > 0) {
    text = chapter.paragraphs.map((p: any) => p.content).join('\n\n');
  }
  return countWords(text);
}
