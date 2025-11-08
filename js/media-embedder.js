/**
 * Revolutionary [[ Media Embedding System
 * Game-changing UX that triggers on [[ and supports files + web links
 * The innovation that makes Impossible Writer unforgettable
 */

class MediaEmbedder {
  constructor(vaultManager) {
    this.vaultManager = vaultManager;
    this.editor = null;
    this.isActive = false;
    this.triggerPosition = -1;
    this.modal = null;
    this.hasShownTip = localStorage.getItem('media-embed-tip-shown') === 'true';

    this.init();
  }

  init() {
    console.log('📎 Initializing Revolutionary Media Embedding System...');
    this.editor = document.getElementById('editor');
    if (!this.editor) return;

    this.setupTriggerDetection();
    this.createModalHTML();
    console.log('✅ [[ Media Embedding System Ready');
  }

  setupTriggerDetection() {
    this.editor.addEventListener('input', (e) => {
      this.detectDoubleBracket(e);
    });

    this.editor.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isActive) {
        this.dismissModal();
      }
    });
  }

  detectDoubleBracket(e) {
    const cursorPos = this.editor.selectionStart;
    const textBeforeCursor = this.editor.value.substring(0, cursorPos);

    // Check if we just typed the second [
    if (textBeforeCursor.endsWith('[[') && !this.isActive) {
      this.triggerPosition = cursorPos - 2; // Position of first [
      this.showMediaModal();

      // Show tip for first-time users
      if (!this.hasShownTip) {
        this.showFirstTimeTip();
        localStorage.setItem('media-embed-tip-shown', 'true');
        this.hasShownTip = true;
      }
    }
  }

  showMediaModal() {
    this.isActive = true;

    // Remove the [[ from editor
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition + 2);
    this.editor.value = before + after;
    this.editor.setSelectionRange(this.triggerPosition, this.triggerPosition);

    // Position and show modal
    this.positionModal();
    this.modal.style.display = 'block';
    this.modal.classList.add('active');

    // Focus first option
    const firstInput = this.modal.querySelector('input');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  }

  positionModal() {
    if (!this.modal) return;

    const cursorCoords = this.getCursorPosition();
    const modalRect = this.modal.getBoundingClientRect();
    const editorRect = this.editor.getBoundingClientRect();

    // Position modal near cursor
    let left = cursorCoords.x;
    let top = cursorCoords.y + 30; // Below cursor

    // Keep modal in viewport
    if (left + modalRect.width > window.innerWidth) {
      left = window.innerWidth - modalRect.width - 20;
    }
    if (top + modalRect.height > window.innerHeight) {
      top = cursorCoords.y - modalRect.height - 10; // Above cursor
    }

    this.modal.style.left = left + 'px';
    this.modal.style.top = top + 'px';
  }

  getCursorPosition() {
    // Simple approximation for cursor position
    const editorRect = this.editor.getBoundingClientRect();
    const style = getComputedStyle(this.editor);
    const lineHeight = parseInt(style.lineHeight) || 20;

    // Estimate based on character position
    const textBeforeCursor = this.editor.value.substring(0, this.triggerPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;

    return {
      x: editorRect.left + 10 + (charInLine * 8), // Rough char width
      y: editorRect.top + 10 + (currentLine * lineHeight)
    };
  }

  createModalHTML() {
    this.modal = document.createElement('div');
    this.modal.className = 'media-embed-modal';
    this.modal.style.cssText = `
      position: fixed;
      display: none;
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 2px solid #4ecdc4;
      border-radius: 12px;
      padding: 20px;
      min-width: 320px;
      max-width: 400px;
      z-index: 10000;
      box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3), 0 5px 15px rgba(0,0,0,0.5);
      color: white;
      font-family: 'Inter', sans-serif;
      animation: embedModalSlide 0.2s ease;
    `;

    this.modal.innerHTML = `
      <div class="embed-header">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
          <span style="font-size: 24px;">📎</span>
          <h3 style="margin: 0; color: #4ecdc4; font-size: 18px;">Embed Media</h3>
          <button class="embed-close" onclick="window.mediaEmbedder?.dismissModal()" style="
            background: none;
            border: none;
            color: #888;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
          ">×</button>
        </div>
      </div>

      <div class="embed-tabs">
        <button class="embed-tab active" data-tab="file" onclick="window.mediaEmbedder?.switchTab('file')">
          📁 Upload File
        </button>
        <button class="embed-tab" data-tab="web" onclick="window.mediaEmbedder?.switchTab('web')">
          🌐 Web Link
        </button>
      </div>

      <!-- File Upload Tab -->
      <div class="embed-tab-content" id="file-tab">
        <div class="embed-options">
          <input type="file" id="embed-file-input" accept="image/*,video/*,audio/*,.pdf,.txt,.md" style="display: none;">

          <button class="embed-option" onclick="window.mediaEmbedder?.selectFile('image/*')">
            <span class="embed-icon">🖼️</span>
            <div>
              <div class="embed-title">Image</div>
              <div class="embed-desc">PNG, JPG, GIF, SVG</div>
            </div>
          </button>

          <button class="embed-option" onclick="window.mediaEmbedder?.selectFile('video/*')">
            <span class="embed-icon">🎥</span>
            <div>
              <div class="embed-title">Video</div>
              <div class="embed-desc">MP4, WebM, MOV</div>
            </div>
          </button>

          <button class="embed-option" onclick="window.mediaEmbedder?.selectFile('audio/*')">
            <span class="embed-icon">🎵</span>
            <div>
              <div class="embed-title">Audio</div>
              <div class="embed-desc">MP3, WAV, OGG</div>
            </div>
          </button>

          <button class="embed-option" onclick="window.mediaEmbedder?.selectFile('.pdf,.txt,.md')">
            <span class="embed-icon">📄</span>
            <div>
              <div class="embed-title">Document</div>
              <div class="embed-desc">PDF, TXT, MD</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Web Link Tab -->
      <div class="embed-tab-content" id="web-tab" style="display: none;">
        <div class="web-embed-form">
          <input type="url" id="web-url-input" placeholder="https://example.com/image.jpg" style="
            width: 100%;
            padding: 12px;
            border: 1px solid #444;
            border-radius: 6px;
            background: #333;
            color: white;
            font-size: 14px;
            margin-bottom: 15px;
          ">

          <div class="web-embed-options">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer;">
              <input type="radio" name="web-type" value="auto" checked style="accent-color: #4ecdc4;">
              <span>🎯 Auto-detect type</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer;">
              <input type="radio" name="web-type" value="webpage" style="accent-color: #4ecdc4;">
              <span>🌐 Webpage/Article</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer;">
              <input type="radio" name="web-type" value="image" style="accent-color: #4ecdc4;">
              <span>🖼️ Force as image</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; cursor: pointer;">
              <input type="radio" name="web-type" value="video" style="accent-color: #4ecdc4;">
              <span>🎥 Force as video</span>
            </label>
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px; cursor: pointer;">
              <input type="radio" name="web-type" value="link" style="accent-color: #4ecdc4;">
              <span>🔗 Simple link</span>
            </label>
          </div>

          <button class="embed-action-btn" onclick="window.mediaEmbedder?.embedWebLink()" style="
            width: 100%;
            background: linear-gradient(135deg, #4ecdc4, #44a08d);
            color: white;
            border: none;
            padding: 12px;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
          ">
            📎 Embed Link
          </button>
        </div>
      </div>

      <div class="embed-footer">
        <div style="font-size: 11px; color: #666; text-align: center; margin-top: 15px;">
          Press Esc to cancel • Type [[ anywhere to embed media
        </div>
      </div>
    `;

    // Add CSS for the modal
    this.addModalStyles();

    document.body.appendChild(this.modal);

    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.dismissModal();
      }
    });

    // Setup file input handler
    const fileInput = this.modal.querySelector('#embed-file-input');
    fileInput.addEventListener('change', (e) => {
      this.handleFileSelect(e.target.files[0]);
    });
  }

  addModalStyles() {
    const styleId = 'media-embed-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes embedModalSlide {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .embed-tabs {
        display: flex;
        gap: 5px;
        margin-bottom: 15px;
        background: #333;
        border-radius: 6px;
        padding: 3px;
      }

      .embed-tab {
        flex: 1;
        background: none;
        border: none;
        color: #888;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        transition: all 0.2s ease;
        font-size: 13px;
        font-weight: 500;
      }

      .embed-tab.active {
        background: #4ecdc4;
        color: #000;
      }

      .embed-options {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }

      .embed-option {
        background: linear-gradient(135deg, #333, #444);
        border: 1px solid #555;
        border-radius: 8px;
        padding: 15px 10px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        min-height: 80px;
      }

      .embed-option:hover {
        border-color: #4ecdc4;
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        transform: translateY(-2px);
      }

      .embed-icon {
        font-size: 24px;
      }

      .embed-title {
        font-weight: 600;
        font-size: 13px;
      }

      .embed-desc {
        font-size: 10px;
        opacity: 0.8;
        text-align: center;
      }

      .embed-action-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
      }

      @media (max-width: 768px) {
        .media-embed-modal {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: calc(100vw - 40px) !important;
          max-width: 350px !important;
        }

        .embed-options {
          grid-template-columns: 1fr;
          gap: 8px;
        }

        .embed-option {
          flex-direction: row;
          text-align: left;
          min-height: auto;
          padding: 12px;
        }

        .embed-icon {
          font-size: 20px;
        }
      }
    `;

    document.head.appendChild(style);
  }

  switchTab(tabName) {
    // Update tab buttons
    this.modal.querySelectorAll('.embed-tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    // Update tab content
    this.modal.querySelectorAll('.embed-tab-content').forEach(content => {
      content.style.display = content.id === `${tabName}-tab` ? 'block' : 'none';
    });

    // Focus appropriate input
    if (tabName === 'web') {
      const urlInput = this.modal.querySelector('#web-url-input');
      setTimeout(() => urlInput?.focus(), 100);
    }
  }

  selectFile(accept) {
    const fileInput = this.modal.querySelector('#embed-file-input');
    fileInput.accept = accept;
    fileInput.click();
  }

  async handleFileSelect(file) {
    if (!file) return;

    try {
      this.showProcessing('Uploading to vault...');

      // Add file to vault
      const result = await this.vaultManager.addAsset(file, true);

      // Insert markdown at trigger position
      this.insertMediaAtPosition(result.markdownLink);

      this.dismissModal();
      this.showSuccess(`📎 ${file.name} added to vault`);

    } catch (error) {
      console.error('File embed error:', error);
      this.showError('Failed to add file to vault');
    }
  }

  embedWebLink() {
    const urlInput = this.modal.querySelector('#web-url-input');
    const typeInputs = this.modal.querySelectorAll('input[name="web-type"]');

    const url = urlInput.value.trim();
    if (!url) {
      this.showError('Please enter a URL');
      return;
    }

    let selectedType = 'auto';
    typeInputs.forEach(input => {
      if (input.checked) selectedType = input.value;
    });

    const markdown = this.generateWebLinkMarkdown(url, selectedType);
    this.insertMediaAtPosition(markdown);
    this.dismissModal();
    this.showSuccess('🔗 Web link embedded');
  }

  generateWebLinkMarkdown(url, type) {
    // Extract filename for alt text
    const filename = url.split('/').pop().split('?')[0] || 'media';
    const extension = filename.split('.').pop().toLowerCase();

    // Generate smart title for webpages
    const pageTitle = this.generatePageTitle(url);

    if (type === 'webpage') {
      return `[${pageTitle}](${url})`;
    }

    if (type === 'link') {
      return `[${pageTitle}](${url})`;
    }

    if (type === 'image' || (type === 'auto' && ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension))) {
      return `![${filename}](${url})`;
    }

    if (type === 'video' || (type === 'auto' && ['mp4', 'webm', 'mov', 'avi'].includes(extension))) {
      return `<video controls>\n  <source src="${url}" type="video/${extension}">\n  Your browser does not support the video tag.\n</video>`;
    }

    if (type === 'auto' && ['mp3', 'wav', 'ogg', 'm4a'].includes(extension)) {
      return `<audio controls>\n  <source src="${url}" type="audio/${extension}">\n  Your browser does not support the audio element.\n</audio>`;
    }

    // For auto-detect, if no media extension found, treat as webpage
    if (type === 'auto') {
      return `[${pageTitle}](${url})`;
    }

    // Default to webpage link
    return `[${pageTitle}](${url})`;
  }

  generatePageTitle(url) {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace('www.', '');
      const pathname = urlObj.pathname;

      // Common website patterns for smart titles
      if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
        return '📺 YouTube Video';
      }
      if (hostname.includes('github.com')) {
        const parts = pathname.split('/').filter(p => p);
        if (parts.length >= 2) {
          return `⚡ ${parts[0]}/${parts[1]}`;
        }
        return '⚡ GitHub Repository';
      }
      if (hostname.includes('stackoverflow.com')) {
        return '💡 Stack Overflow';
      }
      if (hostname.includes('medium.com')) {
        return '📄 Medium Article';
      }
      if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
        return '🐦 Twitter/X Post';
      }
      if (hostname.includes('linkedin.com')) {
        return '💼 LinkedIn';
      }
      if (hostname.includes('reddit.com')) {
        return '🔥 Reddit Post';
      }
      if (hostname.includes('wikipedia.org')) {
        return '📚 Wikipedia';
      }
      if (hostname.includes('docs.google.com')) {
        return '📋 Google Docs';
      }

      // Generic smart title based on domain
      const domain = hostname.split('.')[0];
      const capitalizedDomain = domain.charAt(0).toUpperCase() + domain.slice(1);

      return `🌐 ${capitalizedDomain}`;
    } catch (error) {
      // Fallback for invalid URLs
      return '🔗 Web Link';
    }
  }

  insertMediaAtPosition(markdown) {
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition);

    this.editor.value = before + markdown + after;
    this.editor.setSelectionRange(
      this.triggerPosition + markdown.length,
      this.triggerPosition + markdown.length
    );

    // Trigger update
    this.editor.dispatchEvent(new Event('input'));
    this.editor.focus();
  }

  dismissModal() {
    if (!this.isActive) return;

    this.isActive = false;
    this.modal.style.display = 'none';
    this.modal.classList.remove('active');

    // Restore [[ if user cancelled
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition);
    this.editor.value = before + '[[' + after;
    this.editor.setSelectionRange(this.triggerPosition + 2, this.triggerPosition + 2);
    this.editor.focus();
  }

  showFirstTimeTip() {
    const tip = document.createElement('div');
    tip.className = 'media-embed-tip';
    tip.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #4ecdc4, #44a08d);
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      z-index: 10001;
      max-width: 300px;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 5px 15px rgba(78, 205, 196, 0.4);
      animation: embedTipSlide 0.3s ease;
    `;

    tip.innerHTML = `
      <div style="display: flex; align-items: center; gap: 10px;">
        <span style="font-size: 20px;">💡</span>
        <div>
          <div style="font-weight: 600; margin-bottom: 5px;">Pro Tip!</div>
          <div style="font-size: 13px;">Type [[ anywhere to quickly embed media</div>
        </div>
      </div>
    `;

    document.body.appendChild(tip);

    setTimeout(() => {
      tip.style.animation = 'embedTipSlide 0.3s ease reverse';
      setTimeout(() => {
        if (tip.parentNode) document.body.removeChild(tip);
      }, 300);
    }, 4000);
  }

  showProcessing(message) {
    // You can implement a processing indicator here
    console.log('⏳', message);
  }

  showSuccess(message) {
    if (this.vaultManager && this.vaultManager.showNotification) {
      this.vaultManager.showNotification(message, 'success');
    }
  }

  showError(message) {
    if (this.vaultManager && this.vaultManager.showNotification) {
      this.vaultManager.showNotification(message, 'error');
    }
  }
}

// Export for use in main application
window.MediaEmbedder = MediaEmbedder;