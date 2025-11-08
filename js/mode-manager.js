/**
 * Mode Manager for Impossible Writer
 * Handles Write/Code modes, DIFF mode, and context-sensitive toggling
 */

class ModeManager {
  constructor() {
    this.currentMode = 'write'; // always in write mode now
    this.diffMode = false;
    this.diffVisualMode = false; // false = two-box, true = visual diff
    this.markdownView = true; // true = markdown, false = rich text
    
    this.init();
  }

  init() {
    this.setupDiffListeners();
    this.setupRichTextHandlers();
  }

  // Initialize write mode
  initWriteMode() {
    // Update placeholders and UI
    const editor = document.getElementById('editor');
    if (editor) {
      editor.placeholder = "# Start writing in Markdown...\n\nTry these:\n• **bold text**\n• *italic text*\n• [links](https://example.com)\n• ## headings\n• `code`\n\nPaste rich text to convert automatically!";
    }
    
    // Set initial mode button states
    this.updateModeButtons();
  }
  
  // Set Markdown mode
  setMarkdownMode() {
    if (this.markdownView) return; // Already in markdown mode
    
    this.markdownView = true;
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    if (editor && preview) {
      editor.style.display = 'block';
      preview.style.display = 'none';
    }
    
    this.updateModeButtons();
  }
  
  // Set Rich mode
  setRichMode() {
    if (!this.markdownView) return; // Already in rich mode
    
    this.markdownView = false;
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    if (editor && preview) {
      editor.style.display = 'none';
      preview.style.display = 'block';
      // Update preview via the main app
      if (window.markdownApp) {
        window.markdownApp.updatePreview();
      }
    }
    
    this.updateModeButtons();
  }
  
  // Set DIFF input mode (show two boxes)
  setDiffInputMode() {
    if (!this.diffMode) return;
    if (!this.diffVisualMode) return; // Already in input mode
    
    this.diffVisualMode = false;
    this.updateDiffView();
    this.updateModeButtons();
  }
  
  // Set DIFF output mode (show visual diff)
  setDiffOutputMode() {
    if (!this.diffMode) return;
    if (this.diffVisualMode) return; // Already in output mode
    
    this.diffVisualMode = true;
    this.updateDiffView();
    this.updateModeButtons();
  }
  
  // Update the DIFF view based on current mode
  updateDiffView() {
    const diffContainer = document.querySelector('.diff-container');
    const diffVisual = document.getElementById('diffVisual');
    const diffStatus = document.getElementById('diff-status');
    
    if (this.diffVisualMode) {
      // Show visual diff (output)
      if (diffContainer) diffContainer.style.display = 'none';
      if (diffVisual) diffVisual.style.display = 'block';
      if (diffStatus) diffStatus.textContent = 'Visual diff mode';
      
      this.generateVisualDiff();
    } else {
      // Show two-box mode (input)
      if (diffContainer) diffContainer.style.display = 'flex';
      if (diffVisual) diffVisual.style.display = 'none';
      if (diffStatus) diffStatus.textContent = 'Two-box mode';
    }
  }
  
  // Update mode button states
  updateModeButtons() {
    const mdButtons = document.querySelectorAll('#desktop-md-mode-btn, #mobile-md-mode-btn');
    const richButtons = document.querySelectorAll('#desktop-rich-mode-btn, #mobile-rich-mode-btn');
    
    if (this.diffMode) {
      // In DIFF mode, update input/output states
      mdButtons.forEach(btn => {
        if (!this.diffVisualMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      richButtons.forEach(btn => {
        if (this.diffVisualMode) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    } else {
      // In write mode, update md/rich states
      mdButtons.forEach(btn => {
        if (this.markdownView) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
      
      richButtons.forEach(btn => {
        if (!this.markdownView) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    }
  }


  // Toggle DIFF mode
  toggleDiffMode() {
    this.diffMode = !this.diffMode;
    this.diffVisualMode = false; // Reset to two-box mode
    
    const diffButtons = document.querySelectorAll('#diff-mode-btn, #desktop-diff-mode-btn');
    const unifiedEditor = document.getElementById('unifiedEditor');
    const diffInterface = document.getElementById('diffInterface');
    const diffStatus = document.getElementById('diff-status');
    const mdRichBtn = document.getElementById('desktop-md-rich-btn');
    const mobileMdRichBtn = document.getElementById('mobile-md-rich-btn');
    
    if (this.diffMode) {
      // Show DIFF interface
      if (unifiedEditor) unifiedEditor.style.display = 'none';
      if (diffInterface) diffInterface.style.display = 'block';
      if (diffStatus) diffStatus.textContent = 'Two-box mode';
      
      // Update button labels for DIFF mode (no active class)
      diffButtons.forEach(btn => {
        btn.textContent = '✍️ Write';
        btn.classList.remove('active'); // Remove turquoise color
      });
      
      // Change mode toggle buttons to Input/Output and update handlers
      const mdButtons = document.querySelectorAll('#desktop-md-mode-btn, #mobile-md-mode-btn');
      const richButtons = document.querySelectorAll('#desktop-rich-mode-btn, #mobile-rich-mode-btn');
      
      mdButtons.forEach(btn => {
        btn.textContent = 'input';
        btn.onclick = () => this.setDiffInputMode();
      });
      richButtons.forEach(btn => {
        btn.textContent = 'output';
        btn.onclick = () => this.setDiffOutputMode();
      });
      
      // Ensure we start in input mode
      this.diffVisualMode = false;
      this.updateModeButtons();
    } else {
      // Show normal editor interface
      if (unifiedEditor) unifiedEditor.style.display = 'block';
      if (diffInterface) diffInterface.style.display = 'none';
      
      // Reset button labels
      diffButtons.forEach(btn => {
        btn.textContent = '🔍 DIFF';
        btn.classList.remove('active');
      });
      
      // Reset mode toggle buttons to md/rich and restore handlers
      const mdButtons = document.querySelectorAll('#desktop-md-mode-btn, #mobile-md-mode-btn');
      const richButtons = document.querySelectorAll('#desktop-rich-mode-btn, #mobile-rich-mode-btn');
      
      mdButtons.forEach(btn => {
        btn.textContent = 'md';
        btn.onclick = () => this.setMarkdownMode();
      });
      richButtons.forEach(btn => {
        btn.textContent = 'rich';
        btn.onclick = () => this.setRichMode();
      });
      
      // Update active states
      this.updateModeButtons();
      
      // Force layout recalculation after switching back from diff mode
      setTimeout(() => {
        if (unifiedEditor) {
          // Force browser to recalculate layout
          unifiedEditor.style.height = '';
          unifiedEditor.style.width = '';
          const editor = document.getElementById('editor');
          const preview = document.getElementById('preview');
          
          if (editor) {
            editor.style.height = '';
            editor.style.width = '';
            // Trigger reflow
            editor.offsetHeight;
            editor.offsetWidth;
          }
          if (preview) {
            preview.style.height = '';
            preview.style.width = '';
            // Trigger reflow
            preview.offsetHeight;
            preview.offsetWidth;
          }
          
          // Force main content to recalculate
          const mainContent = document.querySelector('.main-content');
          if (mainContent) {
            mainContent.offsetHeight;
          }
        }
      }, 10);
    }
  }

  // Context-sensitive toggle behavior
  contextToggle() {
    if (this.diffMode) {
      this.toggleDiffVisual();
    } else {
      this.toggleMarkdownRich();
    }
  }

  // Toggle between two-box and visual diff
  toggleDiffVisual() {
    if (!this.diffMode) return;
    
    this.diffVisualMode = !this.diffVisualMode;
    this.updateDiffView();
    this.updateModeButtons();
  }

  // Toggle between markdown and rich text
  toggleMarkdownRich() {
    // Only works in write mode, not in DIFF mode
    if (this.diffMode) {
      // In DIFF mode, toggle between input boxes and diff output
      this.toggleDiffVisual();
      return;
    }
    
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    const mdRichBtn = document.getElementById('desktop-md-rich-btn');
    const mobileMdRichBtn = document.getElementById('mobile-md-rich-btn');
    
    if (!editor || !preview) return;
    
    this.markdownView = !this.markdownView;
    
    if (this.markdownView) {
      // Show markdown editor
      editor.style.display = 'block';
      preview.style.display = 'none';
      if (mdRichBtn) mdRichBtn.textContent = '📝 MD';
      if (mobileMdRichBtn) mobileMdRichBtn.textContent = '📝 MD';
    } else {
      // Show rich preview
      editor.style.display = 'none';
      preview.style.display = 'block';
      this.updatePreview();
      if (mdRichBtn) mdRichBtn.textContent = '🎨 Rich';
      if (mobileMdRichBtn) mobileMdRichBtn.textContent = '🎨 Rich';
    }
  }


  // Code detection removed - moved to /code folder for future Impossible Coder

  // Setup diff mode event listeners
  setupDiffListeners() {
    const diffOriginal = document.getElementById('diff-original');
    const diffModified = document.getElementById('diff-modified');
    
    if (!diffOriginal || !diffModified) return;
    
    let diffTimeout;
    const updateDiffVisual = () => {
      if (this.diffMode && this.diffVisualMode) {
        clearTimeout(diffTimeout);
        diffTimeout = setTimeout(() => {
          this.generateVisualDiff();
        }, 500);
      }
    };
    
    diffOriginal.addEventListener('input', updateDiffVisual);
    diffModified.addEventListener('input', updateDiffVisual);
  }

  // Setup rich text handlers for bi-directional conversion
  setupRichTextHandlers() {
    const preview = document.getElementById('preview');
    const editor = document.getElementById('editor');
    
    if (!preview || !editor) return;
    
    // Handle paste in preview pane
    preview.addEventListener('paste', (e) => {
      if (this.currentMode === 'write' && preview.style.display !== 'none') {
        e.preventDefault();
        
        // Get HTML content
        const html = e.clipboardData.getData('text/html') || e.clipboardData.getData('text/plain');
        
        if (html) {
          // Convert to markdown
          const markdown = this.htmlToMarkdown(html);
          editor.value = markdown;
          
          // Show success indicator
          this.showPasteIndicator();
          
          // Switch back to editor view
          setTimeout(() => {
            this.toggleMarkdownRich();
          }, 1000);
        }
      }
    });
    
    // Handle input in preview pane (for direct editing)
    preview.addEventListener('input', () => {
      if (this.currentMode === 'write' && preview.style.display !== 'none') {
        // Convert current HTML to markdown
        const html = preview.innerHTML;
        const markdown = this.htmlToMarkdown(html);
        editor.value = markdown;
      }
    });
  }

  // Show paste success indicator
  showPasteIndicator() {
    const indicator = document.getElementById('pasteIndicator');
    if (indicator) {
      indicator.style.display = 'block';
      indicator.style.opacity = '1';
      
      setTimeout(() => {
        indicator.style.opacity = '0';
        setTimeout(() => {
          indicator.style.display = 'none';
        }, 300);
      }, 1500);
    }
  }

  // Convert HTML to Markdown
  htmlToMarkdown(html) {
    // Create a temporary div to parse HTML
    const temp = document.createElement('div');
    temp.innerHTML = html;
    
    let markdown = '';
    
    // Process each element
    const processNode = (node, listLevel = 0) => {
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      
      if (node.nodeType !== Node.ELEMENT_NODE) {
        return '';
      }
      
      const tag = node.tagName.toLowerCase();
      let content = '';
      
      // Process children first
      for (const child of node.childNodes) {
        content += processNode(child, listLevel);
      }
      
      // Convert based on tag
      switch (tag) {
        case 'h1': return `# ${content}\n\n`;
        case 'h2': return `## ${content}\n\n`;
        case 'h3': return `### ${content}\n\n`;
        case 'h4': return `#### ${content}\n\n`;
        case 'h5': return `##### ${content}\n\n`;
        case 'h6': return `###### ${content}\n\n`;
        case 'p': return `${content}\n\n`;
        case 'br': return '\n';
        case 'strong':
        case 'b': return `**${content}**`;
        case 'em':
        case 'i': return `*${content}*`;
        case 'code': return `\`${content}\``;
        case 'pre': return `\`\`\`\n${content}\n\`\`\`\n\n`;
        case 'blockquote': return `> ${content.trim().replace(/\n/g, '\n> ')}\n\n`;
        case 'a': return `[${content}](${node.href || '#'})`;
        case 'img': return `![${node.alt || ''}](${node.src || ''})`;
        case 'ul':
        case 'ol': 
          let listContent = '';
          let index = 1;
          for (const child of node.children) {
            if (child.tagName.toLowerCase() === 'li') {
              const prefix = tag === 'ul' ? '-' : `${index}.`;
              const indent = '  '.repeat(listLevel);
              listContent += `${indent}${prefix} ${processNode(child, listLevel + 1).trim()}\n`;
              index++;
            }
          }
          return listContent + '\n';
        case 'li': return content;
        case 'hr': return '---\n\n';
        case 'del':
        case 's': return `~~${content}~~`;
        default: return content;
      }
    };
    
    // Process all top-level nodes
    for (const child of temp.childNodes) {
      markdown += processNode(child);
    }
    
    // Clean up extra newlines
    return markdown.trim().replace(/\n{3,}/g, '\n\n');
  }

  // Update preview based on current mode
  updatePreview() {
    if (this.currentMode === 'write') {
      this.updateMarkdownPreview();
    } else if (this.currentMode === 'code') {
      this.updateCodePreview();
    }
  }

  // Update markdown preview
  updateMarkdownPreview() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    if (!editor || !preview) return;
    
    const markdown = editor.value;
    
    if (!markdown.trim()) {
      preview.innerHTML = `
        <div class="preview-empty">
          <div>📝</div>
          <h3>Preview appears here</h3>
          <p>Type markdown in the editor to see formatted output</p>
        </div>
      `;
      return;
    }
    
    try {
      if (typeof marked !== 'undefined') {
        preview.innerHTML = marked.parse(markdown);
      } else {
        preview.innerHTML = '<p>Markdown parser not loaded</p>';
      }
    } catch (error) {
      preview.innerHTML = `<p>Error rendering markdown: ${error.message}</p>`;
    }
  }

  // Update code preview
  updateCodePreview() {
    const editor = document.getElementById('editor');
    const preview = document.getElementById('preview');
    
    if (!editor || !preview) return;
    
    const code = editor.value.trim();
    
    if (!code) {
      preview.innerHTML = `
        <div class="preview-empty">
          <div>💻</div>
          <h3>Code preview appears here</h3>
          <p>Enter code to see live preview or language detection</p>
        </div>
      `;
      return;
    }
    
    this.detectCodeLanguage();
    
    if (this.detectedLanguage === 'HTML') {
      // Live HTML preview
      preview.innerHTML = `
        <div class="code-preview-header">
          <strong>Live HTML Preview</strong>
          <span class="language-badge">HTML 5.0</span>
        </div>
        <div class="html-preview-container">
          <iframe srcdoc="${code.replace(/"/g, '&quot;')}" 
                  style="width: 100%; height: 400px; border: 1px solid #333; border-radius: 8px;">
          </iframe>
        </div>
      `;
    } else if (this.detectedLanguage && this.detectedLanguage !== 'Unknown') {
      // Language detection display
      preview.innerHTML = `
        <div class="language-detection">
          <div class="language-icon">💻</div>
          <h3>Language Detected</h3>
          <div class="language-info">
            <span class="language-name">${this.detectedLanguage}</span>
            ${this.detectedVersion ? `<span class="language-version">${this.detectedVersion}</span>` : ''}
          </div>
          <p>Code syntax recognized. Use Toggle to return to editor.</p>
          <div class="syntax-note">
            <strong>Security Note:</strong> Code is displayed only, not executed for your safety.
          </div>
        </div>
      `;
    } else {
      // Unknown code type
      preview.innerHTML = `
        <div class="language-detection">
          <div class="language-icon">📄</div>
          <h3>Text Content</h3>
          <p>Language not detected. Code is displayed safely without execution.</p>
        </div>
      `;
    }
  }

  // Generate visual diff from two text boxes
  generateVisualDiff() {
    const originalText = document.getElementById('diff-original')?.value || '';
    const modifiedText = document.getElementById('diff-modified')?.value || '';
    const visualContent = document.getElementById('diffVisualContent');
    
    if (!visualContent) return;
    
    if (!originalText && !modifiedText) {
      visualContent.innerHTML = `
        <div class="diff-empty">
          <div>🔍</div>
          <h3>Visual Diff</h3>
          <p>Add content to both text boxes, then toggle to see differences highlighted.</p>
        </div>
      `;
      return;
    }
    
    // Simple diff implementation (can be enhanced with a proper diff library)
    const diff = this.simpleDiff(originalText, modifiedText);
    visualContent.innerHTML = diff;
  }

  // Professional diff algorithm with word-level precision
  simpleDiff(original, modified) {
    // Check if diff library is available
    if (typeof Diff === 'undefined') {
      return this.fallbackDiff(original, modified);
    }

    try {
      // Enhanced approach: detect line modifications and apply word-level diff
      const lineDiff = Diff.diffLines(original, modified);

      let result = '<div class="diff-result">';

      // Group consecutive removed/added lines to detect modifications
      let i = 0;
      while (i < lineDiff.length) {
        const part = lineDiff[i];

        if (!part.added && !part.removed) {
          // Unchanged lines
          const lines = part.value.split('\n').filter(line => line !== '');
          lines.forEach(line => {
            result += `<div class="diff-line unchanged">  ${this.escapeHtml(line)}</div>`;
          });
          i++;
        } else if (part.removed && i + 1 < lineDiff.length && lineDiff[i + 1].added) {
          // This is a modification (removed followed by added)
          const removedLines = part.value.split('\n').filter(line => line !== '');
          const addedLines = lineDiff[i + 1].value.split('\n').filter(line => line !== '');

          // Apply word-level diff for line modifications
          const maxLines = Math.max(removedLines.length, addedLines.length);

          for (let j = 0; j < maxLines; j++) {
            const originalLine = removedLines[j] || '';
            const modifiedLine = addedLines[j] || '';

            if (originalLine && modifiedLine) {
              // Both lines exist - show word-level diff
              result += this.generateWordLevelDiff(originalLine, modifiedLine);
            } else if (originalLine) {
              // Only original line - pure removal
              result += `<div class="diff-line removed">- ${this.escapeHtml(originalLine)}</div>`;
            } else if (modifiedLine) {
              // Only modified line - pure addition
              result += `<div class="diff-line added">+ ${this.escapeHtml(modifiedLine)}</div>`;
            }
          }

          i += 2; // Skip both removed and added parts
        } else {
          // Pure addition or removal
          const lines = part.value.split('\n').filter(line => line !== '');
          lines.forEach(line => {
            if (part.added) {
              result += `<div class="diff-line added">+ ${this.escapeHtml(line)}</div>`;
            } else if (part.removed) {
              result += `<div class="diff-line removed">- ${this.escapeHtml(line)}</div>`;
            }
          });
          i++;
        }
      }

      result += '</div>';
      return result;

    } catch (error) {
      console.error('Diff library error:', error);
      return this.fallbackDiff(original, modified);
    }
  }

  // Generate word-level diff for modified lines
  generateWordLevelDiff(originalLine, modifiedLine) {
    if (!originalLine && !modifiedLine) return '';

    try {
      // Use word-level diff if available
      if (typeof Diff !== 'undefined' && Diff.diffWords) {
        const wordDiff = Diff.diffWords(originalLine, modifiedLine);

        let removedContent = '';
        let addedContent = '';

        wordDiff.forEach(part => {
          if (part.removed) {
            removedContent += `<span class="word-removed">${this.escapeHtml(part.value)}</span>`;
          } else if (part.added) {
            addedContent += `<span class="word-added">${this.escapeHtml(part.value)}</span>`;
          } else {
            // Unchanged words
            removedContent += this.escapeHtml(part.value);
            addedContent += this.escapeHtml(part.value);
          }
        });

        return `
          <div class="diff-line removed">- ${removedContent}</div>
          <div class="diff-line added">+ ${addedContent}</div>
        `;
      }
    } catch (error) {
      console.error('Word diff error:', error);
    }

    // Fallback to simple line diff
    return `
      <div class="diff-line removed">- ${this.escapeHtml(originalLine)}</div>
      <div class="diff-line added">+ ${this.escapeHtml(modifiedLine)}</div>
    `;
  }

  // Fallback diff algorithm if library isn't available
  fallbackDiff(original, modified) {
    const originalLines = original.split('\n');
    const modifiedLines = modified.split('\n');
    
    let result = '<div class="diff-result">';
    
    const maxLines = Math.max(originalLines.length, modifiedLines.length);
    
    for (let i = 0; i < maxLines; i++) {
      const origLine = originalLines[i] || '';
      const modLine = modifiedLines[i] || '';
      
      if (origLine === modLine) {
        // Unchanged line
        result += `<div class="diff-line unchanged">  ${this.escapeHtml(origLine)}</div>`;
      } else if (!origLine) {
        // Added line
        result += `<div class="diff-line added">+ ${this.escapeHtml(modLine)}</div>`;
      } else if (!modLine) {
        // Removed line
        result += `<div class="diff-line removed">- ${this.escapeHtml(origLine)}</div>`;
      } else {
        // Modified line - show both
        result += `<div class="diff-line removed">- ${this.escapeHtml(origLine)}</div>`;
        result += `<div class="diff-line added">+ ${this.escapeHtml(modLine)}</div>`;
      }
    }
    
    result += '</div>';
    return result;
  }

  // Escape HTML for safe display
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Global mode manager instance
let modeManager;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  modeManager = new ModeManager();
  window.modeManager = modeManager; // Make it globally accessible
  
  // Initialize write mode
  modeManager.initWriteMode();
});

// Global functions for buttons
window.toggleDiffMode = () => modeManager?.toggleDiffMode();
window.setMarkdownMode = () => modeManager?.setMarkdownMode();
window.setRichMode = () => modeManager?.setRichMode();
window.contextToggle = () => modeManager?.contextToggle();