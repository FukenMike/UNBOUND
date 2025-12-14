/**
 * UNBOUND Desktop Renderer Process
 * Handles UI interactions, panel resizing, and project structure rendering.
 */

// Type definitions for Electron API
interface ElectronAPI {
  loadProjectFile: () => Promise<any>;
}

interface WindowWithElectron extends Window {
  electronAPI: ElectronAPI;
}

// Proof of life: log immediately when module loads
console.log('UNBOUND renderer loaded');

let currentProject: any = null;
let currentChapter: any = null;
let currentChapterElement: HTMLElement | null = null;

let panelSizes = {
  structure: parseInt(localStorage.getItem('panel-structure-width') || '280'),
  tools: parseInt(localStorage.getItem('panel-tools-width') || '320')
};

let wrapWidth = parseInt(localStorage.getItem('editor-wrap-width') || '1000');

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOMContentLoaded fired - initializing UI');
  initPanelResizing();
  initCollapseButtons();
  initLoadButton();
  initPlannerActions();
  initEditor();
  initToolsRail();
  restorePanelSizes();
  restoreWrapWidth();
  console.log('UNBOUND initialization complete');
});

// Panel resizing
function initPanelResizing() {
  const resizers = document.querySelectorAll('.resizer');
  
  resizers.forEach(resizer => {
    let isResizing = false;
    let startX = 0;
    let startWidth = 0;
    let panel: HTMLElement | null = null;
    
    resizer.addEventListener('mousedown', (e: Event) => {
      const mouseEvent = e as MouseEvent;
      isResizing = true;
      startX = mouseEvent.clientX;
      
      const panelId = resizer.getAttribute('data-panel');
      panel = document.getElementById(panelId!);
      startWidth = panel!.offsetWidth;
      
      resizer.classList.add('resizing');
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    });
    
    document.addEventListener('mousemove', (e: Event) => {
      if (!isResizing || !panel) return;
      const mouseEvent = e as MouseEvent;
      
      const isLeftPanel = resizer.classList.contains('resizer-left');
      const delta = isLeftPanel ? (mouseEvent.clientX - startX) : (startX - mouseEvent.clientX);
      const newWidth = Math.max(200, Math.min(600, startWidth + delta));
      
      panel.style.width = `${newWidth}px`;
      
      // Save to state
      if (panel.id === 'structure-panel') {
        panelSizes.structure = newWidth;
      } else if (panel.id === 'tools-panel') {
        panelSizes.tools = newWidth;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        resizer.classList.remove('resizing');
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Persist sizes
        localStorage.setItem('panel-structure-width', panelSizes.structure.toString());
        localStorage.setItem('panel-tools-width', panelSizes.tools.toString());
      }
    });
  });
}

// Collapse functionality
function initCollapseButtons() {
  const collapseButtons = document.querySelectorAll('.collapse-btn');
  
  collapseButtons.forEach(button => {
    button.addEventListener('click', () => {
      const panelId = button.getAttribute('data-panel');
      const panel = document.getElementById(panelId!);
      
      if (panel) {
        panel.classList.toggle('collapsed');
        button.textContent = panel.classList.contains('collapsed') ? '+' : '−';
      }
    });
  });
}

// Load button
function initLoadButton() {
  const loadBtn = document.getElementById('load-project-btn');
  
  loadBtn?.addEventListener('click', async () => {
    try {
      const project = await (window as unknown as WindowWithElectron).electronAPI.loadProjectFile();
      if (project) {
        currentProject = project;
        renderProjectStructure(project);
      }
    } catch (err) {
      console.error('Failed to load project:', err);
    }
  });
}

function initPlannerActions() {
  const addBtn = document.getElementById('add-chapter-btn');
  addBtn?.addEventListener('click', () => {
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
      title: `Chapter ${nextOrder}`,
      scenes: [{ id: `scene_${Date.now()}`, order: 1, label: 'Scene 1', paragraphs: [] }]
    };
    body.chapters = body.chapters || [];
    body.chapters.push(newChapter);
    renderProjectStructure(currentProject);
  });
}

// Restore panel sizes from localStorage
function restorePanelSizes() {
  const structurePanel = document.getElementById('structure-panel');
  const toolsPanel = document.getElementById('tools-panel');
  
  if (structurePanel) {
    structurePanel.style.width = `${panelSizes.structure}px`;
  }
  
  if (toolsPanel) {
    toolsPanel.style.width = `${panelSizes.tools}px`;
  }
}

// Initialize editor and wrap controls
function initEditor() {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const wrapControl = document.getElementById('wrap-control');
  const editorContainer = document.getElementById('editor-container');
  const emptyState = document.getElementById('editor-empty');
  
  if (!editor) return;
  
  // Handle clean paste (strip formatting, preserve plain text only)
  editor.addEventListener('paste', (e: Event) => {
    const clipboardEvent = e as ClipboardEvent;
    e.preventDefault();
    
    // Extract plain text only, no formatting injection
    const text = clipboardEvent.clipboardData?.getData('text/plain') || '';
    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);
    
    editor.value = before + text + after;
    
    // Restore cursor position after paste (stable cursor)
    const newPosition = start + text.length;
    editor.selectionStart = editor.selectionEnd = newPosition;
    
    // Update model
    updateChapterContent(editor.value);
  });
  
  // Handle content changes (typing, deletions, etc.)
  editor.addEventListener('input', () => {
    updateChapterContent(editor.value);
    updateWordCount(editor.value);
  });
  
  // Wrap width presets
  const presets = document.querySelectorAll('.wrap-preset');
  presets.forEach(preset => {
    preset.addEventListener('click', () => {
      const width = parseInt(preset.getAttribute('data-width') || '1000');
      setWrapWidth(width);
      
      // Update active state
      presets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
    });
  });
}

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

function exportAsMarkdown() {
  if (!currentProject) return;
  let md = `# ${currentProject.title || 'Untitled'}\n\n`;
  if (currentProject.metadata?.author) md += `**Author:** ${currentProject.metadata.author}\n\n`;
  
  currentProject.sections?.forEach((section: any) => {
    md += `## ${section.title || section.kind}\n\n`;
    md += `*${computeSectionWordCount(section)} words*\n\n`;
    section.chapters?.forEach((chapter: any) => {
      md += `### ${chapter.title || `Chapter ${chapter.order}`}\n\n`;
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

function initToolsRail() {
  const toolsContent = document.getElementById('tools-content');
  const rail = document.querySelectorAll('.tool-btn');
  rail.forEach((btn) => {
    btn.addEventListener('click', () => {
      const action = (btn as HTMLElement).dataset.action;
      switch (action) {
        case 'search':
          if (toolsContent) {
            const panel = document.getElementById('search-panel');
            if (panel) panel.style.display = 'flex';
          }
          break;
        case 'wrap':
          toolsContent && (toolsContent.textContent = 'Use Wrap presets above the editor.');
          const wc = document.getElementById('wrap-control');
          if (wc) wc.style.display = 'flex';
          break;
        case 'stats':
          const text = (document.getElementById('editor') as HTMLTextAreaElement)?.value || '';
          toolsContent && (toolsContent.textContent = `Words: ${countWords(text)} | Characters: ${text.length}`);
          break;
        case 'export':
          if (toolsContent) {
            toolsContent.innerHTML = `
              <div style="display:flex;flex-direction:column;gap:8px;">
                <button id="export-json-btn" style="width:100%;">Export as JSON</button>
                <button id="export-md-btn" style="width:100%;">Export as Markdown</button>
              </div>
            `;
            const jsonBtn = document.getElementById('export-json-btn');
            const mdBtn = document.getElementById('export-md-btn');
            jsonBtn?.addEventListener('click', exportAsJSON);
            mdBtn?.addEventListener('click', exportAsMarkdown);
          }
          break;
      }
    });
  });
}

// Simple in-text search navigation for textarea
let searchMatches: number[] = [];
let currentMatchIndex = -1;

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('search-input') as HTMLInputElement | null;
  const prevBtn = document.getElementById('search-prev');
  const nextBtn = document.getElementById('search-next');
  const status = document.getElementById('search-status');
  const editor = document.getElementById('editor') as HTMLTextAreaElement | null;
  function recomputeMatches() {
    if (!input || !editor) return;
    const q = input.value.trim();
    searchMatches = [];
    currentMatchIndex = -1;
    if (!q) { status && (status.textContent = ''); return; }
    const text = editor.value;
    let idx = 0;
    const lowerText = text.toLowerCase();
    const lowerQ = q.toLowerCase();
    while ((idx = lowerText.indexOf(lowerQ, idx)) !== -1) {
      searchMatches.push(idx);
      idx += lowerQ.length;
    }
    status && (status.textContent = `${searchMatches.length} match${searchMatches.length === 1 ? '' : 'es'}`);
  }
  function jumpTo(offsetIndex: number) {
    if (!editor || searchMatches.length === 0) return;
    currentMatchIndex = (offsetIndex + searchMatches.length) % searchMatches.length;
    const pos = searchMatches[currentMatchIndex];
    editor.focus();
    editor.selectionStart = pos;
    editor.selectionEnd = pos + (input?.value.length || 0);
    editor.scrollTop = editor.scrollHeight * (pos / (editor.value.length || 1));
    status && (status.textContent = `${currentMatchIndex + 1}/${searchMatches.length}`);
  }
  input?.addEventListener('input', () => { recomputeMatches(); });
  prevBtn?.addEventListener('click', () => { if (searchMatches.length) jumpTo(currentMatchIndex - 1); });
  nextBtn?.addEventListener('click', () => { if (searchMatches.length) jumpTo(currentMatchIndex + 1); });
});

function countWords(text: string): number {
  const tokens = text.trim().split(/\s+/).filter(t => t.length > 0);
  return tokens.length;
}

function updateWordCount(text: string) {
  const wcEl = document.getElementById('word-count');
  if (wcEl) {
    const current = countWords(text);
    const total = computeProjectWordCount();
    wcEl.textContent = `${current} words | ${total} total`;
  }
}

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

function computeSectionWordCount(section: any): number {
  let total = 0;
  section.chapters?.forEach((chapter: any) => {
    total += chapterWordCount(chapter);
  });
  return total;
}

// Set wrap width (visual only, does NOT alter content or insert line breaks)
function setWrapWidth(width: number) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  if (!editor) return;
  
  wrapWidth = width;
  
  if (width === 0) {
    // Full width
    editor.style.maxWidth = '100%';
  } else {
    editor.style.maxWidth = `${width}px`;
  }
  
  localStorage.setItem('editor-wrap-width', width.toString());
}

function restoreWrapWidth() {
  setWrapWidth(wrapWidth);
  
  // Set active preset button
  const presets = document.querySelectorAll('.wrap-preset');
  presets.forEach(preset => {
    const width = parseInt(preset.getAttribute('data-width') || '1000');
    if (width === wrapWidth) {
      preset.classList.add('active');
    } else {
      preset.classList.remove('active');
    }
  });
}

// Update chapter content in memory (no persistence yet)
function updateChapterContent(text: string) {
  if (!currentChapter) return;
  
  // Split text into paragraphs by double newlines
  const paragraphs = text
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0)
    .map((content, idx) => ({
      id: currentChapter.paragraphs?.[idx]?.id || `para_${Date.now()}_${idx}`,
      order: idx + 1,
      content
    }));
  
  // Update chapter with new paragraph structure
  if (currentChapter.scenes) {
    // If chapter has scenes, update first scene for simplicity (v0)
    if (currentChapter.scenes[0]) {
      currentChapter.scenes[0].paragraphs = paragraphs;
    }
  } else {
    currentChapter.paragraphs = paragraphs;
  }
}

// Load chapter content into editor
function loadChapterContent(chapter: any) {
  const editor = document.getElementById('editor') as HTMLTextAreaElement;
  const wrapControl = document.getElementById('wrap-control');
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
    // Flatten scenes into paragraphs, separated by double newlines
    text = chapter.scenes
      .map((scene: any) => 
        scene.paragraphs?.map((p: any) => p.content).join('\n\n') || ''
      )
      .join('\n\n---\n\n'); // Scene break marker
  } else if (chapter.paragraphs && chapter.paragraphs.length > 0) {
    text = chapter.paragraphs.map((p: any) => p.content).join('\n\n');
  }
  
  // Load into editor without triggering input event
  editor.value = text;
  // Header info
  if (header && titleEl && numberEl) {
    const number = chapter.order ?? '';
    const title = chapter.title || `Chapter ${number}`;
    numberEl.textContent = number ? String(number) : '';
    titleEl.textContent = title;
    header.style.display = 'block';
  }
  
  // Show editor, hide empty state
  if (editorContainer && emptyState && wrapControl) {
    editorContainer.style.display = 'flex';
    emptyState.style.display = 'none';
    wrapControl.style.display = 'flex';
  }
  
  // Focus editor for immediate writing
  editor.focus();
}

// Render project structure tree
function renderProjectStructure(project: any) {
  const treeContainer = document.getElementById('structure-tree');
  if (!treeContainer) return;
  
  treeContainer.innerHTML = '';
  
  // Update footer with project totals
  const wcEl = document.getElementById('word-count');
  if (wcEl) wcEl.textContent = `${computeProjectWordCount()} total words`;
  
  // Project root
  const projectNode = createTreeItem('📄', project.title || 'Untitled Project', 'project');
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
        section.chapters.forEach((chapter: any) => {
          const chapterNode = createTreeItem(
            '📖',
            chapter.title || `Chapter ${chapter.order}`,
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
              // Scene DnD
              sceneNode.classList.add('scene-item');
              sceneNode.setAttribute('draggable', 'true');
              (sceneNode as any).dataset.sceneId = scene.id;
              (sceneNode as any).dataset.chapterId = chapter.id;
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
}

function createTreeItem(icon: string, label: string, type: string, meta?: string, data?: any): HTMLElement {
  const item = document.createElement('div');
  item.className = 'tree-item';
  item.dataset.type = type;
  if (type === 'chapter' && data?.id) {
    item.setAttribute('draggable', 'true');
    item.dataset.chapterId = data.id;
    // Drag handlers
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
  
  const iconSpan = document.createElement('span');
  iconSpan.className = 'tree-icon';
  iconSpan.textContent = icon;
  
  const labelSpan = document.createElement('span');
  labelSpan.className = 'tree-label';
  labelSpan.textContent = label;
  // Inline rename on double-click for chapters
  if (type === 'chapter' && data) {
    labelSpan.addEventListener('dblclick', (ev) => {
      ev.stopPropagation();
      const input = document.createElement('input');
      input.type = 'text';
      input.value = data.title || labelSpan.textContent || '';
      input.className = 'tree-label';
      item.replaceChild(input, labelSpan);
      input.focus();
      const commit = () => {
        const newVal = input.value.trim();
        if (newVal) {
          data.title = newVal;
        }
        // restore label
        labelSpan.textContent = data.title || label;
        item.replaceChild(labelSpan, input);
        if (currentProject) renderProjectStructure(currentProject);
      };
      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => {
        const k = e as KeyboardEvent;
        if (k.key === 'Enter') {
          commit();
        } else if (k.key === 'Escape') {
          item.replaceChild(labelSpan, input);
        }
      });
    });
  }
  
  item.appendChild(iconSpan);
  item.appendChild(labelSpan);
  
  if (meta) {
    const metaSpan = document.createElement('span');
    metaSpan.className = 'tree-meta';
    metaSpan.textContent = meta;
    item.appendChild(metaSpan);
  }

  // Inline planner actions for chapters
  if (type === 'chapter') {
    const actions = document.createElement('div');
    actions.className = 'tree-actions';
    const btnUp = document.createElement('button');
    btnUp.className = 'tree-action-btn';
    btnUp.title = 'Move up';
    btnUp.textContent = '↑';
    const btnDown = document.createElement('button');
    btnDown.className = 'tree-action-btn';
    btnDown.title = 'Move down';
    btnDown.textContent = '↓';
    const btnRename = document.createElement('button');
    btnRename.className = 'tree-action-btn';
    btnRename.title = 'Rename';
    btnRename.textContent = '✎';
    const btnAddScene = document.createElement('button');
    btnAddScene.className = 'tree-action-btn';
    btnAddScene.title = 'Add scene';
    btnAddScene.textContent = '+';
    actions.appendChild(btnUp);
    actions.appendChild(btnDown);
    actions.appendChild(btnRename);
    actions.appendChild(btnAddScene);
    item.appendChild(actions);

    btnUp.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveChapter(data, -1);
    });
    btnDown.addEventListener('click', (ev) => {
      ev.stopPropagation();
      moveChapter(data, +1);
    });
    btnRename.addEventListener('click', (ev) => {
      ev.stopPropagation();
      const newName = prompt('Rename chapter', data.title || 'Chapter');
      if (newName && currentProject) {
        data.title = newName;
        renderProjectStructure(currentProject);
      }
    });
    btnAddScene.addEventListener('click', (ev) => {
      ev.stopPropagation();
      if (!currentProject) return;
      data.scenes = data.scenes || [];
      const nextOrder = data.scenes.length + 1;
      data.scenes.push({ id: `scene_${Date.now()}`, order: nextOrder, label: `Scene ${nextOrder}`, paragraphs: [] });
      renderProjectStructure(currentProject);
    });
  }
  
  // Chapter selection handling
  if (type === 'chapter' && data) {
    item.addEventListener('click', () => {
      // Remove active state from previous selection
      if (currentChapterElement) {
        currentChapterElement.classList.remove('active');
      }
      
      // Set active state
      item.classList.add('active');
      currentChapterElement = item;
      
      // Load chapter content into editor
      loadChapterContent(data);
    });
  }
  
  return item;
}

function moveChapter(chapter: any, delta: number) {
  if (!currentProject) return;
  const body = currentProject.sections?.find((s: any) => s.kind === 'body');
  if (!body || !Array.isArray(body.chapters)) return;
  const idx = body.chapters.findIndex((c: any) => c.id === chapter.id);
  if (idx < 0) return;
  const target = idx + delta;
  if (target < 0 || target >= body.chapters.length) return;
  // swap positions
  const tmp = body.chapters[idx];
  body.chapters[idx] = body.chapters[target];
  body.chapters[target] = tmp;
  // reassign order values
  body.chapters.forEach((c: any, i: number) => c.order = i + 1);
  renderProjectStructure(currentProject);
}

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

function getSectionIcon(kind: string): string {
  switch (kind) {
    case 'frontMatter': return '📑';
    case 'body': return '📚';
    case 'backMatter': return '📋';
    default: return '📄';
  }
}

function capitalizeKind(kind: string): string {
  const words: Record<string, string> = {
    'frontMatter': 'Front Matter',
    'body': 'Body',
    'backMatter': 'Back Matter'
  };
  return words[kind] || kind;
}

function getChapterMeta(chapter: any): string {
  if (chapter.scenes) {
    return `${chapter.scenes.length} scenes`;
  } else if (chapter.paragraphs) {
    return `${chapter.paragraphs.length}¶`;
  }
  return '';
}

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
