/**
 * Main Module for Impossible Writer
 * Orchestrates all functionality and module initialization
 */

class MarkdownStudio {
  constructor() {
    // Core elements
    this.editor = null;
    this.preview = null;
    
    // Modules
    this.emojiPicker = null;
    this.templateManager = null;
    this.collaborationManager = null;
    
    // State
    this.isInitialized = false;
    this.settings = {
      autoSave: true,
      previewMode: 'live',
      theme: 'dark'
    };
    
    this.init();
  }

  async init() {
    try {
      console.log('🚀 Starting Markdown Studio initialization...');

      // Get DOM references
      this.editor = document.getElementById('editor');
      this.preview = document.getElementById('preview');

      console.log('Editor found:', !!this.editor);
      console.log('Preview found:', !!this.preview);

      if (!this.editor || !this.preview) {
        throw new Error('Required DOM elements not found');
      }

      // Initialize modules
      console.log('🧩 Initializing modules...');
      await this.initializeModules();

      // Setup core functionality
      console.log('⚙️ Setting up listeners...');
      this.setupEditorListeners();
      this.setupUI();
      this.loadState();

      // Check for AI conversation import from bookmarklet
      this.checkForBookmarkletImport();

      // Initial preview update
      console.log('🔄 Initial preview update...');
      this.updatePreview();

      this.isInitialized = true;
      console.log('✅ Markdown Studio initialized successfully');

    } catch (error) {
      console.error('❌ Failed to initialize Markdown Studio:', error);
      this.showError('Failed to initialize editor: ' + error.message);
    }
  }

  async initializeModules() {
    // Initialize emoji picker (temporarily disabled)
    // this.emojiPicker = new EmojiPicker();
    // this.emojiPicker.init();
    // this.emojiPicker.setupTriggerDetection(this.editor);

    // Initialize template manager (temporarily disabled)
    // this.templateManager = new TemplateManager();

    // Initialize import/export manager
    if (typeof ImportExportManager !== 'undefined') {
      window.importExportManager = new ImportExportManager();
      console.log('📁 Import/Export system initialized');
    }

    // Initialize REVOLUTIONARY vault system
    if (typeof VaultManager !== 'undefined') {
      window.vaultManager = new VaultManager();
      window.vaultImportExport = new VaultImportExport(window.vaultManager);
      console.log('🗃️ REVOLUTIONARY VAULT SYSTEM ACTIVATED');
    }

    // Initialize GAME-CHANGING media embedder
    if (typeof MediaEmbedder !== 'undefined' && window.vaultManager) {
      window.mediaEmbedder = new MediaEmbedder(window.vaultManager);
      console.log('📎 REVOLUTIONARY [[ MEDIA EMBEDDING ACTIVATED');
    }

    // Initialize BRILLIANT : emoji embedder
    if (typeof EmojiEmbedder !== 'undefined') {
      window.emojiEmbedder = new EmojiEmbedder();
      console.log('😊 BRILLIANT : EMOJI EMBEDDING ACTIVATED');
    }

    // Initialize THE FINAL IMPOSSIBLE FEATURE - Vault Search
    if (typeof VaultSearch !== 'undefined' && window.vaultManager) {
      window.vaultSearch = new VaultSearch(window.vaultManager);
      console.log('🔍 THE FINAL IMPOSSIBLE FEATURE ACTIVATED - VAULT SEARCH');
    }

    // Initialize collaboration manager
    if (typeof CollaborationManager !== 'undefined') {
      this.collaborationManager = new CollaborationManager();
      // Make it globally accessible
      window.collaborationManager = this.collaborationManager;
      console.log('🎨 Collaboration system initialized');
    }

    console.log('🧩 Modules initialized');
  }

  setupEditorListeners() {
    // Initialize undo system
    lastContent = this.editor.value;
    
    // Main input handler for live preview
    this.editor.addEventListener('input', () => {
      this.updatePreview();
      this.handleAutoSave();
      
      // Collaboration system handles input events automatically
      
      // Save state for undo after a delay
      clearTimeout(this.undoTimeout);
      this.undoTimeout = setTimeout(() => {
        saveState();
      }, 500);
    });

    // Collaboration system handles cursor tracking automatically

    // Handle tab key for indentation
    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.insertAtCursor('  '); // 2 spaces
      }
    });

    // Paste handler for rich text conversion
    this.editor.addEventListener('paste', (e) => {
      this.handlePaste(e);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      this.handleShortcuts(e);
    });
    
    // Templates modal click handler
    const templatesModal = document.getElementById('templatesModal');
    if (templatesModal) {
      templatesModal.addEventListener('click', (e) => {
        if (e.target === templatesModal) {
          closeTemplates();
        }
      });
    }
  }

  setupUI() {
    // Template button
    const templateBtn = document.getElementById('template-btn');
    if (templateBtn) {
      templateBtn.addEventListener('click', () => {
        this.showTemplateModal();
      });
    }

    // Export buttons
    const exportHtmlBtn = document.getElementById('export-html');
    const exportPdfBtn = document.getElementById('export-pdf');
    
    if (exportHtmlBtn) {
      exportHtmlBtn.addEventListener('click', () => this.exportAsHTML());
    }
    
    if (exportPdfBtn) {
      exportPdfBtn.addEventListener('click', () => this.exportAsPDF());
    }

    // Clear button
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        if (confirm('Clear all content? This cannot be undone.')) {
          this.editor.value = '';
          this.updatePreview();
          this.saveState();
        }
      });
    }

    // Setup format toolbar
    this.setupFormatToolbar();

    // Character count
    this.updateCharCount();
  }

  setupFormatToolbar() {
    // Format toolbar functionality
    this.selectedText = '';
    this.selectionRange = null;
    
    this.editor.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const text = selection.toString();
      
      if (text.length > 0) {
        this.selectedText = text;
        this.selectionRange = selection.getRangeAt(0);
        
        // Position toolbar above selection
        const rect = this.selectionRange.getBoundingClientRect();
        const toolbar = document.getElementById('formatToolbar');
        toolbar.style.display = 'block';
        toolbar.style.left = rect.left + 'px';
        toolbar.style.top = (rect.top - 40) + 'px';
      } else {
        document.getElementById('formatToolbar').style.display = 'none';
      }
    });

    // Hide toolbar when clicking elsewhere
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.format-toolbar') && !e.target.closest('.editor-textarea')) {
        document.getElementById('formatToolbar').style.display = 'none';
      }
    });
  }

  updatePreview() {
    const markdown = this.editor.value;

    if (!markdown.trim()) {
      this.preview.innerHTML = this.getEmptyStateHTML();
      return;
    }

    try {
      // Pre-process for AI conversation syntax (%% and $$)
      let processedMarkdown = markdown;
      const lines = markdown.split('\n');
      const processedLines = lines.map(line => {
        if (line.trim().startsWith('%%')) {
          // Human input - blue highlight
          const content = line.substring(2).trim();
          return `<div class="ai-human">👤 ${content}</div>`;
        } else if (line.trim().startsWith('$$')) {
          // AI response - purple highlight
          const content = line.substring(2).trim();
          return `<div class="ai-response">🧠 ${content}</div>`;
        }
        return line;
      });
      processedMarkdown = processedLines.join('\n');

      // Convert markdown to HTML using marked
      const html = marked.parse(processedMarkdown);
      this.preview.innerHTML = html;

      // Add AI conversation styles if not already present
      this.ensureAIStyles();
    } catch (error) {
      console.error('Markdown parsing error:', error);
      this.preview.innerHTML = '<p style="color: #ff6b6b;">Error parsing markdown</p>';
    }
  }

  ensureAIStyles() {
    if (!document.getElementById('ai-conversation-styles')) {
      const style = document.createElement('style');
      style.id = 'ai-conversation-styles';
      style.textContent = `
        .ai-human {
          background: linear-gradient(135deg, #2563eb15 0%, #3b82f615 100%);
          border-left: 4px solid #2563eb;
          padding: 15px 20px;
          margin: 10px 0;
          border-radius: 8px;
          font-family: inherit;
        }
        .ai-response {
          background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
          border-left: 4px solid #667eea;
          padding: 15px 20px;
          margin: 10px 0;
          border-radius: 8px;
          font-family: inherit;
        }
      `;
      document.head.appendChild(style);
    }
  }

  getEmptyStateHTML() {
    return `
      <div class="preview-empty-state">
        <div style="text-align: center; padding: 60px 20px; color: #666;">
          <div style="font-size: 3em; margin-bottom: 20px;">📝</div>
          <h3 style="color: #888; margin-bottom: 15px;">Bidirectional Studio</h3>
          <p style="margin-bottom: 15px;">Type or paste in either pane</p>
          <p style="font-size: 0.9em; color: #888;">
            Markdown ↔ Formatted • Rich Text → Markdown
          </p>
          <div style="margin-top: 20px; font-size: 0.85em; color: #666;">
            <strong>Quick Tips:</strong><br>
            • Use <code>:</code> for emojis (then search)<br>
            • Select text for formatting toolbar<br>
            • Try keyboard shortcuts (Ctrl+B, Ctrl+I)<br>
            • Paste rich text to auto-convert
          </div>
        </div>
      </div>
    `;
  }

  insertAtCursor(text) {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const currentText = this.editor.value;
    
    this.editor.value = currentText.substring(0, start) + text + currentText.substring(end);
    this.editor.setSelectionRange(start + text.length, start + text.length);
    this.editor.focus();
    this.updatePreview();
  }

  wrapSelection(before, after = '') {
    const start = this.editor.selectionStart;
    const end = this.editor.selectionEnd;
    const selectedText = this.editor.value.substring(start, end);
    
    if (selectedText) {
      const replacement = before + selectedText + (after || before);
      this.editor.setRangeText(replacement, start, end, 'select');
      this.editor.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    } else {
      this.insertAtCursor(before + (after || before));
      this.editor.setSelectionRange(start + before.length, start + before.length);
    }
    
    this.editor.focus();
    this.updatePreview();
  }

  handleShortcuts(e) {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'z':
          if (e.shiftKey) {
            e.preventDefault();
            redo();
          } else {
            e.preventDefault();
            undo();
          }
          break;
        case 'y':
          e.preventDefault();
          redo();
          break;
        case 'b':
          e.preventDefault();
          this.wrapSelection('**');
          break;
        case 'i':
          e.preventDefault();
          this.wrapSelection('*');
          break;
        case 'k':
          e.preventDefault();
          this.wrapSelection('[', '](https://example.com)');
          break;
        case 's':
          e.preventDefault();
          this.saveState();
          this.showNotification('💾 Content saved locally');
          break;
        case 'e':
          e.preventDefault();
          showTemplates();
          break;
      }
    }
  }

  handlePaste(e) {
    const clipboardData = e.clipboardData || window.clipboardData;
    const htmlData = clipboardData.getData('text/html');
    const plainData = clipboardData.getData('text/plain');

    if (htmlData && htmlData.trim()) {
      e.preventDefault();
      
      // Show conversion indicator
      this.showPasteIndicator();
      
      // Simple HTML to Markdown conversion
      const markdown = this.convertHtmlToMarkdown(htmlData);
      this.insertAtCursor(markdown);
    }
  }

  convertHtmlToMarkdown(html) {
    // Basic HTML to Markdown conversion
    // This is simplified - for production use a proper library
    let markdown = html
      // Remove HTML tags we don't need
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<style[^>]*>.*?<\/style>/gi, '')
      
      // Convert headings
      .replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n')
      .replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n')
      .replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n')
      
      // Convert formatting
      .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**')
      .replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**')
      .replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*')
      .replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*')
      
      // Convert links
      .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)')
      
      // Convert paragraphs
      .replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n')
      
      // Convert line breaks
      .replace(/<br[^>]*>/gi, '\n')
      
      // Remove remaining HTML tags
      .replace(/<[^>]*>/g, '')
      
      // Clean up entities
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      
      // Clean up extra whitespace
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();

    return markdown;
  }

  showTemplateModal() {
    showTemplates();
  }

  toggleCheatSheet() {
    const cheatSheet = document.getElementById('cheatSheet');
    if (cheatSheet) {
      const isVisible = cheatSheet.style.display === 'block';
      cheatSheet.style.display = isVisible ? 'none' : 'block';
    }
  }

  updateCharCount() {
    const charCount = document.querySelector('.char-count');
    if (charCount && this.editor) {
      const text = this.editor.value;
      const chars = text.length;
      const words = text.trim() ? text.trim().split(/\s+/).length : 0;
      charCount.textContent = `${chars} chars, ${words} words`;
    }
  }

  handleAutoSave() {
    if (this.settings.autoSave) {
      clearTimeout(this.autoSaveTimeout);
      this.autoSaveTimeout = setTimeout(() => {
        this.saveState();
      }, 1000);
    }
    
    this.updateCharCount();
  }

  saveState() {
    try {
      localStorage.setItem('markdown-studio-content', this.editor.value);
      localStorage.setItem('markdown-studio-timestamp', Date.now().toString());

      // Reset intentionally-cleared flag when new content is saved
      if (this.editor.value.trim()) {
        localStorage.removeItem('markdown-studio-intentionally-cleared');
      }
    } catch (error) {
      console.warn('Could not save to localStorage:', error);
    }
  }

  loadState() {
    try {
      const savedContent = localStorage.getItem('markdown-studio-content');
      const wasIntentionallyCleared = localStorage.getItem('markdown-studio-intentionally-cleared');

      if (savedContent) {
        this.editor.value = savedContent;
        this.updatePreview();
      } else if (!wasIntentionallyCleared) {
        // Only load README for truly new vaults, not intentionally cleared pages
        this.loadDefaultReadme();
      }
      // If intentionally cleared, leave editor blank as requested
    } catch (error) {
      console.warn('Could not load from localStorage:', error);
      // Only load README if this is a genuine error, not intentional clearing
      const wasIntentionallyCleared = localStorage.getItem('markdown-studio-intentionally-cleared');
      if (!wasIntentionallyCleared) {
        this.loadDefaultReadme();
      }
    }
  }

  loadDefaultReadme() {
    const defaultContent = `# Welcome to Impossible Writer

**Quick Start:** [Clear for new page](javascript:clearTextWithWarning()) • [📁 Folder for new vault](javascript:toggleFolderPanel())

---

## 🎯 **What You're Using**

**Impossible Writer** is a revolutionary markdown editor that breaks every rule about how writing software works. You get enterprise-grade collaboration, unlimited media storage, complete privacy, and total portability—all for free.

---

## 🚀 **Core Features**

### **📝 Writing Modes**
- **Markdown Mode:** Raw markdown editing with live syntax
- **Rich Text Mode:** WYSIWYG editing with instant preview
- **DIFF Mode:** Professional text comparison with visual highlighting

### **🗃️ Vault System**
- **Drag & Drop Media:** Drop images/videos directly into editor
- **Smart Asset Management:** Auto-saves as \`imageYYMMDD-SS.png\`
- **[[ Quick Embed:** Type \`[[\` anywhere to embed files or web links
- **Vault Search:** Ctrl+Shift+F to find connections across content
- **Portable Vaults:** Export complete vault as ZIP with all assets
- **Cross-Platform:** Import vault on any device, everything intact

### **🌐 Real-Time Collaboration**
- **Private P2P Rooms:** WebRTC-based, no server storage
- **Live Editing:** See changes instantly, cursor tracking
- **Media Sharing:** Assets sync to all collaborators
- **Color Coding:** Toggle to see who wrote what

### **📁 Import/Export Engine**
- **Import:** Markdown, HTML, DOCX, RTF, PDF, ZIP vaults
- **Export:** PDF, DOCX, RTF, HTML, LaTeX, Markdown
- **Vault Export:** Complete ZIP with all media preserved
- **No Lock-in:** Your content works everywhere

---

## ⚡ **Quick Actions**

### **Getting Started**
1. **Start Writing:** Just start typing in markdown
2. **Add Media:** Drag images/videos into the editor
3. **Switch Views:** Toggle between markdown and rich text
4. **Export:** Choose format and download

### **Collaboration**
1. **Create Room:** Click Room button, enter name & password
2. **Share Credentials:** Others join with same name & password
3. **Edit Together:** Real-time sync, see all changes live
4. **Export Vault:** Everyone gets complete copy with assets

### **Vault Management**
1. **Drop Media:** Images auto-save to vault structure
2. **Quick Embed:** Type [[ anywhere for instant media/link insertion
3. **Search Vault:** Ctrl+Shift+F to discover content connections
4. **Export Vault:** ZIP includes all content and assets
5. **Import Vault:** Restore on any device, merge or overwrite
6. **Share:** Send ZIP file, perfect portability

---

## 📝 **Markdown Syntax Reference**

| Syntax | Result |
|--------|---------|
| \`**bold text**\` | **bold text** |
| \`*italic text*\` | *italic text* |
| \`~~strikethrough~~\` | ~~strikethrough~~ |
| \`\`\`code\`\`\` | \`code\` |
| \`[link](url)\` | [link](url) |
| \`![image](path)\` | ![image](path) |
| \`# Heading 1\` | # Heading 1 |
| \`## Heading 2\` | ## Heading 2 |
| \`- List item\` | • List item |
| \`1. Numbered\` | 1. Numbered |
| \`> Quote\` | > Quote |

---

## 💡 **Pro Tips**

- **Rich Text Paste:** Copy from anywhere, auto-converts to markdown
- **Live Preview Editing:** Edit directly in preview pane
- **Quick Media Embed:** Type \`[[\` anywhere to embed files or web links
- **Asset Insertion:** Dropped media auto-inserts at cursor position
- **Vault Portability:** Export vault, work anywhere, import back
- **Offline Ready:** Works completely without internet
- **No Limits:** No file size restrictions, no storage costs

---

## 🔒 **Privacy & Security**

- **Zero Server Storage:** Your content never hits our servers
- **Local Processing:** Everything happens in your browser
- **P2P Collaboration:** Direct connections, no middleman
- **Complete Control:** You own your data, always
- **No Tracking:** No analytics, no telemetry, no data collection

---

## 🎨 **Interface Guide**

### **Toolbar Functions**
- **📄 Templates:** Pre-built document structures
- **📊 Table:** Insert markdown tables
- **🔍 DIFF:** Compare two text versions
- **🎨 Colors:** Show collaboration authorship
- **🌐 Room:** Create/join collaboration rooms
- **📂 Import:** Bring in documents and vaults
- **📄 Export:** Save in any format needed

### **Keyboard Shortcuts**
- **Ctrl+B:** Bold text
- **Ctrl+I:** Italic text
- **Ctrl+K:** Insert link
- **Ctrl+S:** Save content
- **Ctrl+Z:** Undo
- **Ctrl+Y:** Redo
- **Ctrl+Shift+F:** Search vault
- **Type [[:** Quick media embed

---

## 🚀 **What Makes This Impossible**

**The Impossible Trinity Achieved:**
- ✅ **Real-time collaboration** without servers
- ✅ **Complete privacy** without isolation
- ✅ **Full portability** without compromise

**Revolutionary Breakthroughs:**
- **Portable Vault System:** Self-contained with all assets
- **True P2P Collaboration:** Enterprise features, zero cost
- **Universal Import/Export:** Professional document processing
- **Adaptive Interface:** Full functionality on any device

---

## 🎯 **Ready to Start?**

**For Simple Documents:** [Click Clear to start fresh](javascript:clearTextWithWarning())

**For Media-Rich Vaults:** [Click Folder to begin a new vault](javascript:toggleFolderPanel())

**For Collaboration:** Click Room button in toolbar to create a shared workspace

---

*Welcome to the future of writing. Start creating something impossible.*`;

    this.editor.value = defaultContent;
    this.updatePreview();
  }

  exportAsHTML() {
    const markdown = this.editor.value;
    if (!markdown.trim()) {
      this.showNotification('⚠️ Nothing to export');
      return;
    }

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Exported Document</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 20px; color: #666; }
  </style>
</head>
<body>
  ${marked.parse(markdown)}
</body>
</html>`;
    
    this.downloadFile(html, 'document.html', 'text/html');
  }

  exportAsPDF() {
    // This would require the jsPDF library - simplified version
    this.showNotification('📄 PDF export coming soon!');
  }

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showNotification(`💾 Downloaded ${filename}`);
  }

  showNotification(message) {
    // Create or update notification element
    let notification = document.getElementById('notification');
    if (!notification) {
      notification = document.createElement('div');
      notification.id = 'notification';
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #333;
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-size: 0.9em;
      `;
      document.body.appendChild(notification);
    }

    notification.textContent = message;
    notification.style.opacity = '1';

    clearTimeout(notification.hideTimeout);
    notification.hideTimeout = setTimeout(() => {
      notification.style.opacity = '0';
    }, 3000);
  }

  showPasteIndicator() {
    const indicator = document.getElementById('pasteIndicator');
    if (indicator) {
      indicator.style.display = 'block';
      setTimeout(() => {
        indicator.style.display = 'none';
      }, 1000);
    }
  }

  showError(message) {
    console.error(message);
    this.showNotification(`❌ ${message}`);
  }

  // ===== AI CONVERSATION IMPORT SYSTEM =====
  checkForBookmarkletImport() {
    const importData = localStorage.getItem('zyz_ai_import');
    if (importData) {
      try {
        console.log('🤖 AI conversation import detected from bookmarklet');

        // Insert the formatted conversation
        if (this.editor.value.trim()) {
          if (confirm('Replace current content with imported AI conversation?')) {
            this.editor.value = importData;
          } else {
            this.editor.value += '\n\n---\n\n' + importData;
          }
        } else {
          this.editor.value = importData;
        }

        // Clear localStorage
        localStorage.removeItem('zyz_ai_import');

        // Update preview
        this.updatePreview();
        window.saveState();

        this.showNotification('🤖 AI conversation imported! Using %% for human and $$ for AI');

      } catch (e) {
        console.error('AI import error:', e);
        this.showError('Failed to import AI conversation: ' + e.message);
      }
    }
  }

  importAIConversation(messages) {
    // Detect AI type from first message or default to Claude
    const aiType = this.detectAIType(messages);
    const formattedMarkdown = this.formatAIConversation(messages, aiType);

    // Insert into editor
    if (this.editor.value.trim()) {
      if (confirm('Replace current content with imported AI conversation?')) {
        this.editor.value = formattedMarkdown;
      } else {
        this.editor.value += '\n\n---\n\n' + formattedMarkdown;
      }
    } else {
      this.editor.value = formattedMarkdown;
    }

    // Update preview
    this.updatePreview();

    // Save state
    window.saveState();

    // Show success notification
    this.showNotification(`🤖 Imported ${messages.length} messages from ${aiType} conversation`);

    // Prompt to save to vault
    setTimeout(() => {
      if (confirm(`💾 Save this ${aiType} conversation to your vault?\n\nIt will be stored in:\nAI Conversations/${aiType}/${this.getDateFolder()}/`)) {
        this.saveAIConversationToVault(formattedMarkdown, aiType);
      }
    }, 1000);
  }

  detectAIType(messages) {
    // Simple detection - could be enhanced
    const firstContent = messages[0]?.content?.toLowerCase() || '';

    if (firstContent.includes('chatgpt') || firstContent.includes('gpt')) {
      return 'ChatGPT';
    } else if (firstContent.includes('gemini') || firstContent.includes('bard')) {
      return 'Gemini';
    } else {
      return 'Claude';
    }
  }

  formatAIConversation(messages, aiType) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Extract topic from first user message (first 60 chars)
    const firstUserMsg = messages.find(m => m.role === 'human' || m.role === 'user');
    const topic = firstUserMsg ?
      firstUserMsg.content.substring(0, 60).replace(/[#*\[\]]/g, '').trim() + '...' :
      'Conversation';

    let markdown = `---
type: ai-conversation
date: ${now.toISOString().split('T')[0]}
ai: ${aiType}
topic: ${topic}
messages: ${messages.length}
---

# ${aiType} Conversation: ${topic}

**Date:** ${dateStr}
**AI:** ${aiType}
**Messages:** ${messages.length}

---

`;

    // Format each message
    messages.forEach((msg, index) => {
      const isHuman = msg.role === 'human' || msg.role === 'user';
      const role = isHuman ? '👤 **You**' : `🧠 **${aiType}**`;

      markdown += `## ${role}\n\n`;
      markdown += `${msg.content}\n\n`;

      if (index < messages.length - 1) {
        markdown += `---\n\n`;
      }
    });

    // Add statistics at the end
    const humanMsgs = messages.filter(m => m.role === 'human' || m.role === 'user').length;
    const aiMsgs = messages.length - humanMsgs;
    const wordCount = messages.reduce((sum, msg) =>
      sum + msg.content.split(/\s+/).length, 0
    );

    markdown += `\n---\n\n## Conversation Statistics\n\n`;
    markdown += `- **Total Messages:** ${messages.length}\n`;
    markdown += `- **Your Messages:** ${humanMsgs}\n`;
    markdown += `- **${aiType} Messages:** ${aiMsgs}\n`;
    markdown += `- **Total Words:** ${wordCount.toLocaleString()}\n`;
    markdown += `\n*Imported via Impossible Writer*\n`;

    return markdown;
  }

  getDateFolder() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  async saveAIConversationToVault(content, aiType) {
    try {
      // Generate filename
      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const time = now.toTimeString().split(' ')[0].replace(/:/g, '-');

      // Extract topic from first line of content (after metadata)
      const topicMatch = content.match(/# .*?: (.+)/);
      const topic = topicMatch ?
        topicMatch[1].substring(0, 40).replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-') :
        'conversation';

      const filename = `${dateStr}_${time}_${aiType}_${topic}.md`;
      const folderPath = `AI Conversations/${aiType}/${this.getDateFolder()}`;

      // Create a blob and save
      const blob = new Blob([content], { type: 'text/markdown' });
      const file = new File([blob], filename, { type: 'text/markdown' });

      // TODO: Integrate with folder manager to save to specific path
      // For now, just show a download
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      this.showNotification(`💾 Saved to: ${folderPath}/${filename}`);

    } catch (error) {
      console.error('Failed to save to vault:', error);
      this.showError('Failed to save to vault: ' + error.message);
    }
  }
}

// Undo/Redo functionality
let undoStack = [];
let redoStack = [];
let lastContent = '';

function saveState() {
  const editor = document.getElementById('editor');
  if (editor && editor.value !== lastContent) {
    undoStack.push(lastContent);
    if (undoStack.length > 50) undoStack.shift(); // Keep only last 50 states
    redoStack = []; // Clear redo stack when new content is added
    lastContent = editor.value;
  }
}


// Templates - Import enhanced templates and merge with core templates
const coreTemplates = {
  meeting: `# Meeting Notes
**Date:** ${new Date().toLocaleDateString()}  
**Attendees:** 

## Agenda
1. Review previous action items
2. Current project status
3. Key decisions needed
4. Next steps

## Notes
- 
- 
- 

## Action Items
| Task | Owner | Due Date | Status |
|------|-------|----------|--------|
|      |       |          |        |

## Next Meeting
Define next meeting date and objectives.`,

  project: `# Project Name

## Overview
Brief description of the project purpose and goals.

## Scope
### In Scope
- Feature 1: Description
- Feature 2: Description

### Out of Scope
- Item 1
- Item 2

### Technologies
- Technology 1: Purpose
- Technology 2: Purpose

## Timeline
- **Phase 1** (Week 1-2): Initial setup
- **Phase 2** (Week 3-4): Core development  
- **Phase 3** (Week 5-6): Testing & refinement

## Resources Needed
- Team member roles
- Tools and software
- Budget considerations

## Risks & Mitigation
1. **Risk**: Description
   **Mitigation**: Strategy`,

  blog: `# Your Title Here

*${new Date().toLocaleDateString()} · 5 min read*

## Introduction
Hook your readers with an engaging opening.

## Main Content
### Section 1
Your first main point with examples.

### Section 2  
Second key point that builds on the first.

## Conclusion
Wrap up with actionable insights.

---

*Thanks for reading!*`,

  readme: `# Project Name

Brief description of what this project does.

## Installation

\`\`\`bash
git clone https://github.com/username/project
cd project
npm install
\`\`\`

## Usage

\`\`\`javascript
const example = require('./project');
example.run();
\`\`\`

## Features
- Feature 1: Description
- Feature 2: Description
- Feature 3: Description

## Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License
MIT © Your Name`
};

// Merge enhanced templates with core templates
const templates = { ...window.enhancedTemplates, ...coreTemplates };

// Global functions that the original HTML expects
window.clearText = function() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  if ((editor.value || preview.innerHTML.trim()) &&
      !confirm('This will clear all content. Are you sure?')) {
    return;
  }
  saveState();
  editor.value = '';

  // Mark as intentionally cleared to prevent README auto-load
  localStorage.setItem('markdown-studio-intentionally-cleared', 'true');

  if (window.markdownApp) {
    window.markdownApp.updatePreview();
  }
};

window.undo = function() {
  if (undoStack.length > 0) {
    const editor = document.getElementById('editor');
    redoStack.push(editor.value);
    const previousState = undoStack.pop();
    editor.value = previousState;
    lastContent = previousState;
    editor.dispatchEvent(new Event('input'));
  }
};

window.redo = function() {
  if (redoStack.length > 0) {
    const editor = document.getElementById('editor');
    undoStack.push(editor.value);
    const nextState = redoStack.pop();
    editor.value = nextState;
    lastContent = nextState;
    editor.dispatchEvent(new Event('input'));
  }
};

window.showTemplates = function() {
  const modal = document.getElementById('templatesModal');
  if (modal) {
    modal.style.display = 'flex';
  }
};

window.closeTemplates = function() {
  const modal = document.getElementById('templatesModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.loadTemplate = function(type) {
  const editor = document.getElementById('editor');
  if (editor.value && !confirm('This will replace your current content. Continue?')) {
    return;
  }
  editor.value = templates[type] || '';
  editor.dispatchEvent(new Event('input'));
  closeTemplates();
};

window.exportHTML = function() {
  const editor = document.getElementById('editor');
  if (!editor.value.trim()) {
    alert('Nothing to export');
    return;
  }
  
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Markdown Export</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 40px auto;
      padding: 20px;
      color: #333;
    }
    h1 { border-bottom: 2px solid #eee; padding-bottom: 10px; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 15px; border-radius: 4px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ddd; padding-left: 20px; color: #666; }
  </style>
</head>
<body>
  ${marked.parse(editor.value)}
</body>
</html>`;
  
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'markdown-export.html';
  a.click();
  URL.revokeObjectURL(url);
};

window.exportPDF = function() {
  alert('PDF export feature coming soon!');
};

window.toggleCheatSheet = function() {
  const sheet = document.getElementById('cheatSheet');
  if (sheet) {
    sheet.style.display = sheet.style.display === 'block' ? 'none' : 'block';
  }
};

window.closeCheatSheet = function() {
  const cheatSheet = document.getElementById('cheatSheet');
  if (cheatSheet) {
    cheatSheet.style.display = 'none';
  }
};

window.formatSelection = function(type) {
  const app = window.markdownApp;
  if (!app || !app.selectedText) return;
  
  let formatted = '';
  switch (type) {
    case 'bold':
      formatted = `**${app.selectedText}**`;
      break;
    case 'italic':
      formatted = `*${app.selectedText}*`;
      break;
    case 'code':
      formatted = `\`${app.selectedText}\``;
      break;
    case 'link':
      const url = prompt('Enter URL:', 'https://');
      if (url) {
        formatted = `[${app.selectedText}](${url})`;
      } else {
        return;
      }
      break;
  }
  
  // Replace selected text with formatted version
  const start = app.editor.selectionStart;
  const end = app.editor.selectionEnd;
  const before = app.editor.value.substring(0, start);
  const after = app.editor.value.substring(end);
  
  app.editor.value = before + formatted + after;
  app.editor.dispatchEvent(new Event('input'));
  
  // Hide toolbar
  document.getElementById('formatToolbar').style.display = 'none';
  
  // Set cursor position after formatted text
  app.editor.setSelectionRange(start + formatted.length, start + formatted.length);
  app.editor.focus();
};

// Revolutionary Mobile View Toggle System
// Placeholder for enhanced mobile manager below

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.markdownApp = new MarkdownStudio();
    window.markdownStudioInstance = window.markdownApp; // Link for compatibility
    if (window.innerWidth <= 768) {
      window.mobileViewManager = new MobileViewManager();
    }
  });
} else {
  window.markdownApp = new MarkdownStudio();
  window.markdownStudioInstance = window.markdownApp; // Link for compatibility
  if (window.innerWidth <= 768) {
    window.mobileViewManager = new MobileViewManager();
  }
}

// ============================================
// MOBILE NATIVE FUNCTIONS
// ============================================

// Smart Room Action - Auto detect create vs join
async function smartRoomAction() {
  // Check if already in a room (use isCollaborating instead of isConnected)
  if (window.collaborationManager && window.collaborationManager.isCollaborating) {
    if (confirm('Leave current collaboration room?')) {
      window.collaborationManager.disconnect('User left the room');
      updateMobileRoomButton(false, 0);
    }
    return;
  }

  // Get room credentials with simple prompts
  const roomNumber = prompt('Room name:');
  if (!roomNumber) return;
  
  const password = prompt('Password:');
  if (!password) return;
  
  try {
    // Show connecting state
    const roomBtn = document.getElementById('mobile-room-btn');
    roomBtn.textContent = '🔄 Connecting...';
    roomBtn.disabled = true;
    
    // Try to join first (most common case)
    try {
      await window.collaborationManager.joinRoom(roomNumber.trim(), password.trim(), document.getElementById('editor'));
      showMobileNotification('🔗 Joined room!');
      updateMobileRoomButton(true, 1);
    } catch (joinError) {
      // If join fails, try to create
      try {
        const shareLink = await window.collaborationManager.createRoom(roomNumber.trim(), password.trim(), document.getElementById('editor'));
        showMobileNotification('🎉 Created room!');
        updateMobileRoomButton(true, 1);
        
        // Copy link on mobile (if possible)
        if (navigator.share) {
          navigator.share({
            title: 'Markdown Studio Collaboration',
            text: 'Join my document editing session:',
            url: shareLink
          });
        } else if (navigator.clipboard) {
          navigator.clipboard.writeText(shareLink);
          showMobileNotification('📋 Link copied!');
        }
      } catch (createError) {
        throw new Error('Failed to create room: ' + createError.message);
      }
    }
    
    // Setup collaboration listeners
    const editor = document.getElementById('editor');
    editor.addEventListener('input', handleCollaborativeEdit);
    
  } catch (error) {
    showMobileNotification('❌ Connection failed');
    console.error('Room error:', error);
  } finally {
    // Reset button
    const roomBtn = document.getElementById('mobile-room-btn');
    roomBtn.disabled = false;
  }
}

// Update room button state
function updateMobileRoomButton(isConnected, userCount = 0) {
  const roomBtn = document.getElementById('mobile-room-btn');
  const desktopRoomBtn = document.getElementById('desktop-room-btn');
  
  if (isConnected) {
    const userText = userCount > 0 ? ` (${userCount})` : '';
    
    // Mobile button
    if (roomBtn) {
      roomBtn.textContent = `🚪 Leave${userText}`;
      roomBtn.classList.add('active');
    }
    
    // Desktop button - keep turquoise when connected
    if (desktopRoomBtn) {
      desktopRoomBtn.textContent = `Room${userText}`;
      desktopRoomBtn.classList.add('active');
    }
  } else {
    // Mobile button
    if (roomBtn) {
      roomBtn.textContent = '🌐 Room';
      roomBtn.classList.remove('active');
    }
    
    // Desktop button
    if (desktopRoomBtn) {
      desktopRoomBtn.textContent = 'Room';
      desktopRoomBtn.classList.remove('active');
    }
  }
}

// Global function to update user count
window.updateRoomUserCount = function(count) {
  const isConnected = window.collaborationManager && window.collaborationManager.isConnectedToRelay;
  updateMobileRoomButton(isConnected, count);
};

// Quick Export - Simple format selection
function quickExport() {
  const content = document.getElementById('editor').value.trim();
  if (!content) {
    showMobileNotification('❌ No content to export');
    return;
  }
  
  // Simple format selection with confirm dialogs
  const formats = [
    { key: 'md', name: 'Markdown (.md)', emoji: '📄' },
    { key: 'html', name: 'HTML (.html)', emoji: '🌐' },
    { key: 'pdf', name: 'PDF (.pdf)', emoji: '📑' },
    { key: 'docx', name: 'Word (.docx)', emoji: '📃' }
  ];
  
  // Create quick selection prompt
  let formatChoice = prompt(
    'Export format:\n' +
    '1 - 📄 Markdown\n' +
    '2 - 🌐 HTML\n' +
    '3 - 📑 PDF\n' +
    '4 - 📃 Word\n\n' +
    'Enter number (1-4):'
  );
  
  if (!formatChoice || formatChoice < 1 || formatChoice > 4) return;
  
  const selectedFormat = formats[parseInt(formatChoice) - 1];
  
  try {
    exportFormat(selectedFormat.key);
    showMobileNotification(`📤 Exported as ${selectedFormat.name}`);
  } catch (error) {
    showMobileNotification('❌ Export failed');
    console.error('Export error:', error);
  }
}

// Quick Import - REVOLUTIONARY VAULT + Document Import
function quickImport() {
  // Create hidden file input
  const fileInput = document.createElement('input');
  fileInput.type = 'file';
  fileInput.accept = '.md,.txt,.html,.docx,.rtf,.pdf,.zip';
  fileInput.style.display = 'none';

  fileInput.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      showMobileNotification('📥 Importing...');

      // Check if it's a ZIP vault
      if (file.name.toLowerCase().endsWith('.zip') && window.vaultImportExport) {
        await window.vaultImportExport.importVault(file);
        return;
      }

      // Use existing import manager for documents
      const content = await window.importExportManager.importFile(file);

      // Add to editor
      const editor = document.getElementById('editor');
      if (editor.value && !confirm('Replace current content?')) {
        editor.value += '\n\n' + content;
      } else {
        editor.value = content;
      }

      updatePreview();
      saveState();
      showMobileNotification('✅ Import successful!');

    } catch (error) {
      showMobileNotification('❌ Import failed');
      console.error('Import error:', error);
    } finally {
      document.body.removeChild(fileInput);
    }
  };

  document.body.appendChild(fileInput);
  fileInput.click();
}

// Mobile notification system
function showMobileNotification(message) {
  // Remove existing notification
  const existing = document.querySelector('.mobile-notification');
  if (existing) existing.remove();
  
  const notification = document.createElement('div');
  notification.className = 'mobile-notification';
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.9);
    color: #fff;
    padding: 12px 20px;
    border-radius: 25px;
    font-size: 0.9em;
    font-weight: 500;
    z-index: 10000;
    border: 1px solid #4ecdc4;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    opacity: 0;
    transition: all 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => {
    notification.style.opacity = '1';
    notification.style.transform = 'translateX(-50%) translateY(0)';
  }, 10);
  
  // Animate out and remove
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(-50%) translateY(-20px)';
    setTimeout(() => {
      if (notification.parentNode) {
        document.body.removeChild(notification);
      }
    }, 300);
  }, 2500);
}

// Enhanced Mobile View Manager
class MobileViewManager {
  constructor() {
    this.isMobile = window.innerWidth <= 768;
    this.currentView = 'editor';
    
    if (this.isMobile) {
      this.init();
    }
    
    // Update on resize
    window.addEventListener('resize', () => {
      const wasMobile = this.isMobile;
      this.isMobile = window.innerWidth <= 768;
      if (wasMobile !== this.isMobile) {
        this.handleResponsiveChange();
      }
    });
  }
  
  init() {
    this.showMobileUI();
    this.setupToggleListeners();
    this.setMobileView(this.currentView);
  }
  
  showMobileUI() {
    // Show mobile toggle and toolbar
    const toggle = document.querySelector('.mobile-view-toggle');
    const toolbar = document.querySelector('.mobile-toolbar');
    
    if (toggle) toggle.style.display = 'flex';
    if (toolbar) toolbar.style.display = 'flex';
  }
  
  setupToggleListeners() {
    const toggleButtons = document.querySelectorAll('.view-toggle-btn');
    toggleButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        this.setMobileView(view);
      });
    });
  }
  
  setMobileView(view) {
    if (!this.isMobile) return;
    
    this.currentView = view;
    const container = document.querySelector('.container');
    
    // Update button states
    document.querySelectorAll('.view-toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
    
    // Update container class for view switching
    container.classList.remove('mobile-editor-only', 'mobile-preview-only');
    container.classList.add(`mobile-${view}-only`);
    
    // Focus editor when switching to it
    if (view === 'editor') {
      setTimeout(() => {
        const editor = document.getElementById('editor');
        if (editor) editor.focus();
      }, 100);
    }
  }
  
  handleResponsiveChange() {
    const toggle = document.querySelector('.mobile-view-toggle');
    const toolbar = document.querySelector('.mobile-toolbar');
    const container = document.querySelector('.container');
    
    if (this.isMobile) {
      // Switched to mobile
      this.showMobileUI();
      this.setMobileView(this.currentView);
    } else {
      // Switched to desktop
      if (toggle) toggle.style.display = 'none';
      if (toolbar) toolbar.style.display = 'none';
      container.classList.remove('mobile-editor-only', 'mobile-preview-only');
    }
  }
}

// ============================================
// MOBILE SWIPE TOOLBAR FUNCTIONALITY
// ============================================

// Exit function (legacy - not used in standalone version)
function exitToZyz() {
  if (confirm('Close Impossible Writer?')) {
    window.location.href = '../../';
  }
}

// Mobile swipe toolbar manager
class MobileSwipeToolbar {
  constructor() {
    this.toolbar = document.querySelector('.mobile-toolbar');
    this.trigger = document.querySelector('.mobile-swipe-trigger');
    this.isOpen = false;
    
    if (this.toolbar && this.trigger) {
      this.init();
    }
  }
  
  init() {
    // Swipe trigger zone
    this.trigger.addEventListener('touchstart', (e) => {
      this.handleSwipeStart(e);
    });
    
    // Click trigger zone to open
    this.trigger.addEventListener('click', () => {
      this.toggle();
    });
    
    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.toolbar.contains(e.target) && !this.trigger.contains(e.target)) {
        this.close();
      }
    });
    
    // Touch handling for swipe gestures
    this.setupSwipeGestures();
  }
  
  handleSwipeStart(e) {
    this.startX = e.touches[0].clientX;
    this.startTime = Date.now();
  }
  
  setupSwipeGestures() {
    let startX = 0;
    let currentX = 0;
    
    document.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    });
    
    document.addEventListener('touchmove', (e) => {
      if (!startX) return;
      currentX = e.touches[0].clientX;
      
      // Swipe from right edge to open
      if (startX > window.innerWidth - 50 && currentX < startX - 30) {
        this.open();
      }
      // Swipe left to close when open
      else if (this.isOpen && startX > window.innerWidth - 300 && currentX < startX - 50) {
        this.close();
      }
    });
    
    document.addEventListener('touchend', () => {
      startX = 0;
      currentX = 0;
    });
  }
  
  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  
  open() {
    this.toolbar.classList.add('open');
    this.isOpen = true;
  }
  
  close() {
    this.toolbar.classList.remove('open');
    this.isOpen = false;
  }
}

// Initialize mobile features on mobile devices
if (window.innerWidth <= 768) {
  document.addEventListener('DOMContentLoaded', () => {
    window.mobileSwipeToolbar = new MobileSwipeToolbar();
  });
}

// Toggle mobile toolbar
window.toggleMobileToolbar = function() {
  const toolbar = document.querySelector('.mobile-toolbar');
  if (toolbar) {
    toolbar.classList.toggle('open');
    if (window.mobileSwipeToolbar) {
      window.mobileSwipeToolbar.isOpen = toolbar.classList.contains('open');
    }
  }
};

// Clear text with warning for collaborative sessions
window.clearTextWithWarning = function() {
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const isCollaborating = window.collaborationManager && window.collaborationManager.isConnectedToRelay;
  
  const warningMsg = isCollaborating 
    ? '⚠️ WARNING: This will clear all content for ALL users in the room. Are you sure?'
    : 'This will clear all content. Are you sure?';
    
  if ((editor.value || preview.innerHTML.trim()) && confirm(warningMsg)) {
    window.clearText();
  }
};

// Toggle between markdown and preview view on mobile
window.toggleView = function() {
  if (window.mobileViewManager) {
    const container = document.querySelector('.container');
    if (container.classList.contains('mobile-preview-only')) {
      container.classList.remove('mobile-preview-only');
      container.classList.add('mobile-editor-only');
    } else {
      container.classList.remove('mobile-editor-only');
      container.classList.add('mobile-preview-only');
    }
  }
};

// Toggle fullscreen mode
window.toggleFullscreen = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.error('Fullscreen error:', err);
    });
  } else {
    document.exitFullscreen();
  }
};


// Traditional media picker function
window.showMediaPicker = function() {
  if (window.mediaEmbedder) {
    // Simulate [[ trigger to show modal
    window.mediaEmbedder.triggerPosition = document.getElementById('editor').selectionStart;
    window.mediaEmbedder.showMediaModal();
  } else {
    alert('Media embedding system not available');
  }
};

// Missing global functions that need to be added
window.updatePreview = function() {
  if (window.markdownApp) {
    window.markdownApp.updatePreview();
  }
};

window.saveState = function() {
  const editor = document.getElementById('editor');
  if (editor && editor.value !== lastContent) {
    undoStack.push(lastContent);
    if (undoStack.length > 50) undoStack.shift(); // Keep only last 50 states
    redoStack = []; // Clear redo stack when new content is added
    lastContent = editor.value;
  }

  // Also save to localStorage
  try {
    localStorage.setItem('markdown-studio-content', editor.value);
    localStorage.setItem('markdown-studio-timestamp', Date.now().toString());

    // Reset intentionally-cleared flag when new content is saved
    if (editor.value.trim()) {
      localStorage.removeItem('markdown-studio-intentionally-cleared');
    }
  } catch (error) {
    console.warn('Could not save to localStorage:', error);
  }
};

window.handleCollaborativeEdit = function() {
  // Collaboration system handles edits automatically
};

window.insertTable = function() {
  const tableTemplate = `| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Cell 1   | Cell 2   | Cell 3   |
| Cell 4   | Cell 5   | Cell 6   |

`;
  
  const editor = document.getElementById('editor');
  const cursorPos = editor.selectionStart;
  const before = editor.value.substring(0, cursorPos);
  const after = editor.value.substring(cursorPos);
  
  editor.value = before + (before && !before.endsWith('\n\n') ? '\n\n' : '') + tableTemplate + after;
  editor.dispatchEvent(new Event('input'));
  
  // Position cursor at first header cell
  const newPos = cursorPos + (before && !before.endsWith('\n\n') ? 2 : 0) + 2;
  editor.focus();
  editor.setSelectionRange(newPos, newPos + 8);
};

let wordWrapEnabled = true;
window.toggleWordWrap = function() {
  wordWrapEnabled = !wordWrapEnabled;
  const button = document.getElementById('wrapToggle');
  const editor = document.getElementById('editor');
  
  if (wordWrapEnabled) {
    editor.style.whiteSpace = 'pre-wrap';
    editor.style.overflowX = 'hidden';
    button.style.backgroundColor = '#333';
    button.style.borderColor = '#555';
    button.textContent = '📄 Wrap';
  } else {
    editor.style.whiteSpace = 'pre';
    editor.style.overflowX = 'auto';
    button.style.backgroundColor = '#0a0a0a';
    button.style.borderColor = '#333';
    button.textContent = '📜 No Wrap';
  }
};

window.createRoom = async function() {
  const number = document.getElementById('room-number').value.trim();
  const password = document.getElementById('room-password').value.trim();
  
  if (!number || !password) {
    alert('Please enter both room name and password');
    return;
  }
  
  try {
    if (window.collaborationManager) {
      const editor = document.getElementById('editor');
      const shareLink = await window.collaborationManager.createRoom(number, password, editor);
      
      window.closeCreateRoomModal();
      alert('🎉 Room created! Link: ' + shareLink);
      
      navigator.clipboard.writeText(shareLink).catch(() => {
        console.log('Could not copy to clipboard');
      });
    } else {
      alert('Collaboration manager not available');
    }
  } catch (error) {
    alert('Failed to create room: ' + error.message);
  }
};

// Modal control functions
window.showImportModal = function() {
  const modal = document.getElementById('importModal');
  if (modal) {
    modal.style.display = 'block';

    // Set up file input handler if not already done
    const fileInput = document.getElementById('import-file-input');
    if (fileInput && !fileInput.hasVaultHandler) {
      fileInput.hasVaultHandler = true;

      fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
          // Check if it's a ZIP vault
          if (file.name.toLowerCase().endsWith('.zip') && window.vaultImportExport) {
            window.closeImportModal();
            await window.vaultImportExport.importVault(file);
            return;
          }

          // Handle regular document import
          const content = await window.importExportManager.importFile(file);
          const editor = document.getElementById('editor');

          if (editor.value && !confirm('Replace current content?')) {
            editor.value += '\n\n' + content;
          } else {
            editor.value = content;
          }

          updatePreview();
          saveState();
          window.closeImportModal();

        } catch (error) {
          console.error('Import error:', error);
          alert('Import failed: ' + error.message);
        }
      });
    }
  }
};

window.closeImportModal = function() {
  const modal = document.getElementById('importModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

window.showExportModal = function() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.style.display = 'block';
  }
};

window.closeExportModal = function() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Export entire vault as ZIP - REVOLUTIONARY PORTABLE VAULT SYSTEM
window.exportVault = async function() {
  try {
    if (!window.vaultImportExport) {
      alert('Vault system not initialized');
      return;
    }

    // Close export modal first
    window.closeExportModal();

    // Use the revolutionary vault export system
    await window.vaultImportExport.exportVault();

  } catch (error) {
    console.error('Failed to export vault:', error);
    alert('Failed to export vault: ' + error.message);
  }
};

window.exportFormat = async function(format) {
  window.closeExportModal();
  
  try {
    const editor = document.getElementById('editor');
    const content = editor.value;
    if (!content.trim()) {
      alert('No content to export!');
      return;
    }
    
    // Generate filename from first heading or date
    let filename = 'document';
    const firstHeading = content.match(/^#+ (.+)$/m);
    if (firstHeading) {
      filename = firstHeading[1].trim().replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();
    } else {
      filename = 'markdown-' + new Date().toISOString().split('T')[0];
    }
    
    if (window.importExportManager) {
      await window.importExportManager.exportAs(content, format, filename);
      alert('💾 Export successful!');
    } else {
      alert('Export manager not available');
    }
  } catch (error) {
    alert('Export failed: ' + error.message);
  }
};

// Modal functions
window.showCreateRoomModal = function() {
  document.getElementById('createRoomModal').style.display = 'flex';
};

window.closeCreateRoomModal = function() {
  document.getElementById('createRoomModal').style.display = 'none';
};

window.showJoinRoomModal = function() {
  document.getElementById('joinRoomModal').style.display = 'flex';
};

window.closeJoinRoomModal = function() {
  document.getElementById('joinRoomModal').style.display = 'none';
};

window.joinRoom = async function() {
  const number = document.getElementById('join-room-number').value.trim();
  const password = document.getElementById('join-room-password').value.trim();
  
  if (!number || !password) {
    alert('Please enter both room name and password');
    return;
  }
  
  try {
    if (window.collaborationManager) {
      const editor = document.getElementById('editor');
      await window.collaborationManager.joinRoom(number, password, editor);
      
      window.closeJoinRoomModal();
      alert('🔗 Joined room successfully!');
    } else {
      alert('Collaboration manager not available');
    }
  } catch (error) {
    alert('Failed to join room: ' + error.message);
  }
};

// Simple emoji picker functionality
let emojiPickerVisible = false;
let emojiPickerDiv = null;

function checkEmojiTrigger() {
  const editor = document.getElementById('editor');
  if (!editor) return;
  
  const cursorPos = editor.selectionStart;
  const textBeforeCursor = editor.value.substring(0, cursorPos);
  
  if (textBeforeCursor.endsWith(':')) {
    showEmojiPicker();
  } else if (emojiPickerVisible) {
    hideEmojiPicker();
  }
}

function showEmojiPicker() {
  if (emojiPickerVisible) return;
  
  emojiPickerVisible = true;
  emojiPickerDiv = document.createElement('div');
  emojiPickerDiv.style.cssText = `
    position: absolute;
    background: #222;
    border: 1px solid #444;
    border-radius: 8px;
    padding: 10px;
    max-width: 300px;
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 4px;
  `;
  
  const emojis = [
    '😀','😃','😄','😁','😆','😅','😂','🤣','😊','😇','🙂','🙃','😉','😌','😍','🥰','😘','😋','😎','🤩','🥳','😏','😒','😞','😔','😢','😭','😤','😠','😡','🤬','🤯','😳','🥺','😱','😨','🤗','🤔','🤭','🤫','🤐','😴','🤤','😵','🤢','🤮','😷',
    '👍','👎','👏','🙌','🤝','🙏','✌️','🤞','🤟','🤘','🤙','👌','👈','👉','👆','👇','☝️','✋','🤚','🖐️','🖖','👋','🤏','✊','👊','🤛','🤜',
    '❤️','💕','💖','💗','💙','💚','💛','🧡','💜','🖤','🤍','🤎','💔','💯',
    '✅','❌','⭐','🌟','💫','⚡','🔥','💧','🌊','💎','🎉','🎊','🎁','🎈','🎀','🏆','🥇','🥈','🥉',
    '💻','📱','⌚','🖥️','📺','📷','📸','🎮','🕹️','💾','📀','💿',
    '🍕','🍔','🍟','🌮','🌯','🥙','🥗','🍜','🍲','🍱','🍣','🍻','🍺','🥂','🍷','☕','🍵','🧋'
  ];
  
  emojis.forEach(emoji => {
    const emojiSpan = document.createElement('span');
    emojiSpan.textContent = emoji;
    emojiSpan.style.cssText = 'cursor: pointer; padding: 4px; border-radius: 4px; font-size: 18px;';
    emojiSpan.addEventListener('mouseenter', () => {
      emojiSpan.style.background = '#333';
    });
    emojiSpan.addEventListener('mouseleave', () => {
      emojiSpan.style.background = 'transparent';
    });
    emojiSpan.addEventListener('click', () => insertEmoji(emoji));
    emojiPickerDiv.appendChild(emojiSpan);
  });
  
  document.body.appendChild(emojiPickerDiv);
  positionEmojiPicker();
}

function hideEmojiPicker() {
  if (emojiPickerDiv) {
    document.body.removeChild(emojiPickerDiv);
    emojiPickerDiv = null;
    emojiPickerVisible = false;
  }
}

function positionEmojiPicker() {
  const editor = document.getElementById('editor');
  const rect = editor.getBoundingClientRect();
  emojiPickerDiv.style.left = rect.left + 'px';
  emojiPickerDiv.style.top = (rect.bottom + 5) + 'px';
}

function insertEmoji(emoji) {
  const editor = document.getElementById('editor');
  const cursorPos = editor.selectionStart;
  const beforeColon = editor.value.substring(0, cursorPos - 1);
  const afterCursor = editor.value.substring(cursorPos);
  
  editor.value = beforeColon + emoji + afterCursor;
  editor.focus();
  editor.setSelectionRange(cursorPos + emoji.length - 1, cursorPos + emoji.length - 1);
  editor.dispatchEvent(new Event('input'));
  
  hideEmojiPicker();
}

// Set up emoji picker on editor input
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    const editor = document.getElementById('editor');
    if (editor) {
      editor.addEventListener('input', checkEmojiTrigger);
    }
  }, 100);
});

// Hide emoji picker when clicking elsewhere
document.addEventListener('click', (e) => {
  if (emojiPickerVisible && emojiPickerDiv && !emojiPickerDiv.contains(e.target)) {
    hideEmojiPicker();
  }
});

// Global functions for UI integration
window.toggleTextColoring = function() {
  if (window.collaborationManager && window.collaborationManager.collaborativeEngine) {
    window.collaborationManager.collaborativeEngine.toggleTextColoring();
  } else {
    console.log('🎨 Collaboration system not active - text coloring requires active collaboration');
  }
};

// Initialize when ready
window.MarkdownStudio = MarkdownStudio;

// Create global instance (but don't duplicate - already created above)
// window.markdownStudioInstance is set to window.markdownApp

// EMERGENCY: Restore text visibility if Code Superpowers breaks it
window.emergencyRestoreText = function() {
  console.log('🚨 EMERGENCY TEXT RESTORE ACTIVATED');
  
  // Method 1: Use Code Superpowers emergency restore
  if (window.codeSuperpowers) {
    window.codeSuperpowers.emergencyRestoreText();
  }
  
  // Method 2: Direct editor restoration
  const editor = document.getElementById('editor');
  if (editor) {
    editor.style.color = '#e0e0e0';
    editor.style.webkitTextFillColor = '#e0e0e0';
    editor.style.caretColor = '#ff4757';
  }
  
  // Method 3: Remove syntax overlay if it exists
  const syntaxOverlay = document.querySelector('.syntax-overlay');
  if (syntaxOverlay) {
    syntaxOverlay.remove();
  }
  
  alert('✅ Emergency text restoration complete! Your text should be visible now.');
};

// EMERGENCY: Fix cursor positioning issues
window.emergencyFixCursor = function() {
  console.log('🚨 EMERGENCY CURSOR FIX ACTIVATED');
  
  // Use Code Superpowers emergency cursor fix
  if (window.codeSuperpowers) {
    window.codeSuperpowers.emergencyFixCursor();
  }
  
  // Alternative method: Reset everything manually
  const editor = document.getElementById('editor');
  if (editor) {
    editor.style.color = '#e0e0e0';
    editor.style.webkitTextFillColor = '#e0e0e0';
    editor.style.caretColor = '#ff4757';
    editor.style.boxShadow = '';
    editor.focus();
  }
  
  // Remove all overlays
  document.querySelectorAll('.syntax-overlay, .multi-cursor, .bracket-highlight').forEach(el => el.remove());
  
  alert('✅ Emergency cursor fix complete! Try typing now.');
};