/**
 * VaultManager - Revolutionary Portable Vault System
 * Handles media assets, naming, storage, and vault operations
 * Makes Impossible Writer truly portable with zero cloud dependency
 */

class VaultManager {
  constructor() {
    this.assets = new Map(); // filename -> file data
    this.manifest = null;
    this.vaultName = 'impossible-vault';
    this.isInitialized = false;

    // Supported media types
    this.supportedTypes = {
      image: ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'],
      video: ['mp4', 'webm', 'mov'],
      audio: ['mp3', 'wav', 'ogg', 'm4a'],
      document: ['pdf', 'txt', 'md']
    };

    this.init();
  }

  async init() {
    console.log('🗃️ Initializing Vault Manager...');
    await this.initializeManifest();
    this.setupDragDropZone();
    this.isInitialized = true;
    console.log('✅ Vault Manager ready');
  }

  // Initialize or load existing manifest
  async initializeManifest() {
    this.manifest = {
      version: "1.0.0",
      generator: "ZL Writer",
      created: new Date().toISOString(),
      modified: new Date().toISOString(),
      assets: {},
      settings: {
        autoOptimize: true,
        maxImageSize: 2048, // pixels
        imageQuality: 0.85
      }
    };
  }

  // Generate filename with YYMMDD-SS format
  generateAssetName(file, type) {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const dateStr = `${year}${month}${day}`;

    // Get file extension
    const originalExt = file.name.split('.').pop().toLowerCase();
    const ext = this.normalizeExtension(originalExt, type);

    // Find next sequence number for today
    const sequence = this.getNextSequenceNumber(type, dateStr);
    const seqStr = sequence.toString().padStart(2, '0');

    let filename = `${type}${dateStr}-${seqStr}.${ext}`;

    // Handle conflicts (very unlikely but just in case)
    while (this.assets.has(filename)) {
      filename = `${type}${dateStr}-${seqStr}_.${ext}`;
    }

    return filename;
  }

  // Normalize file extensions
  normalizeExtension(ext, type) {
    const normalMap = {
      'jpeg': 'jpg',
      'htm': 'html',
      'mpeg': 'mp4'
    };

    return normalMap[ext] || ext;
  }

  // Get next sequence number for the day
  getNextSequenceNumber(type, dateStr) {
    let maxSeq = 0;
    const prefix = `${type}${dateStr}-`;

    for (const filename of this.assets.keys()) {
      if (filename.startsWith(prefix)) {
        const seqPart = filename.split('-')[1].split('.')[0].replace('_', '');
        const seq = parseInt(seqPart, 10);
        if (!isNaN(seq) && seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }

    return maxSeq + 1;
  }

  // Detect media type from file
  detectMediaType(file) {
    const ext = file.name.split('.').pop().toLowerCase();

    for (const [type, extensions] of Object.entries(this.supportedTypes)) {
      if (extensions.includes(ext)) {
        return type;
      }
    }

    return 'document'; // Default fallback
  }

  // Add asset to vault
  async addAsset(file, skipNotification = false) {
    try {
      const type = this.detectMediaType(file);
      const filename = this.generateAssetName(file, type);

      // Process file based on type
      let processedFile = file;
      if (type === 'image' && this.manifest.settings.autoOptimize) {
        processedFile = await this.optimizeImage(file);
      }

      // Store asset
      this.assets.set(filename, {
        file: processedFile,
        originalName: file.name,
        type: type,
        size: processedFile.size,
        added: new Date().toISOString()
      });

      // Update manifest
      this.manifest.assets[filename] = {
        originalName: file.name,
        type: type,
        size: processedFile.size,
        added: new Date().toISOString()
      };
      this.manifest.modified = new Date().toISOString();

      if (!skipNotification) {
        this.showNotification(`📎 Added ${filename}`, 'success');
      }

      console.log(`📎 Asset added: ${filename} (${this.formatFileSize(processedFile.size)})`);

      return {
        filename,
        markdownLink: this.generateMarkdownLink(filename, file.name, type)
      };

    } catch (error) {
      console.error('Failed to add asset:', error);
      this.showNotification(`❌ Failed to add ${file.name}`, 'error');
      throw error;
    }
  }

  // Generate markdown link for asset
  generateMarkdownLink(filename, originalName, type) {
    const assetPath = `./assets/${filename}`;

    switch (type) {
      case 'image':
        return `![${originalName}](${assetPath})`;
      case 'video':
        return `<video controls>\n  <source src="${assetPath}" type="video/${filename.split('.').pop()}">\n  Your browser does not support the video tag.\n</video>`;
      case 'audio':
        return `<audio controls>\n  <source src="${assetPath}" type="audio/${filename.split('.').pop()}">\n  Your browser does not support the audio element.\n</audio>`;
      default:
        return `[📎 ${originalName}](${assetPath})`;
    }
  }

  // Optimize images
  async optimizeImage(file) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        const maxSize = this.manifest.settings.maxImageSize;
        let { width, height } = img;

        // Calculate new dimensions
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height * maxSize) / width;
            width = maxSize;
          } else {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            const optimizedFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now()
            });
            resolve(optimizedFile);
          },
          'image/png',
          this.manifest.settings.imageQuality
        );
      };

      img.onerror = () => resolve(file); // Fallback to original
      img.src = URL.createObjectURL(file);
    });
  }

  // Setup drag and drop zone
  setupDragDropZone() {
    const editor = document.getElementById('editor');
    if (!editor) return;

    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      editor.addEventListener(eventName, this.preventDefaults, false);
      document.body.addEventListener(eventName, this.preventDefaults, false);
    });

    // Highlight drop zone
    ['dragenter', 'dragover'].forEach(eventName => {
      editor.addEventListener(eventName, () => this.highlight(editor), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      editor.addEventListener(eventName, () => this.unhighlight(editor), false);
    });

    // Handle dropped files
    editor.addEventListener('drop', (e) => this.handleDrop(e), false);
  }

  preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  highlight(element) {
    element.classList.add('vault-drop-highlight');
    if (!document.getElementById('vault-drop-styles')) {
      const style = document.createElement('style');
      style.id = 'vault-drop-styles';
      style.textContent = `
        .vault-drop-highlight {
          background: linear-gradient(45deg, #4ecdc4, #44a08d) !important;
          border: 2px dashed #fff !important;
          opacity: 0.8 !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  unhighlight(element) {
    element.classList.remove('vault-drop-highlight');
  }

  // Handle file drop
  async handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length === 0) return;

    this.showNotification(`📥 Processing ${files.length} file(s)...`, 'info');

    for (const file of files) {
      try {
        const result = await this.addAsset(file);

        // Insert markdown link at cursor position
        this.insertAtCursor(result.markdownLink);

      } catch (error) {
        console.error(`Failed to process ${file.name}:`, error);
      }
    }

    // Update preview
    if (window.markdownApp) {
      window.markdownApp.updatePreview();
    }
  }

  // Insert text at cursor position
  insertAtCursor(text) {
    const editor = document.getElementById('editor');
    if (!editor) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const currentText = editor.value;

    editor.value = currentText.substring(0, start) + text + currentText.substring(end);
    editor.setSelectionRange(start + text.length, start + text.length);
    editor.focus();

    // Trigger input event for live preview
    editor.dispatchEvent(new Event('input'));
  }

  // Get vault statistics
  getVaultStats() {
    const stats = {
      totalAssets: this.assets.size,
      totalSize: 0,
      types: {}
    };

    for (const asset of this.assets.values()) {
      stats.totalSize += asset.size;
      stats.types[asset.type] = (stats.types[asset.type] || 0) + 1;
    }

    return stats;
  }

  // Format file size
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `vault-notification vault-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 20px;
      background: ${type === 'error' ? '#ff4757' : type === 'success' ? '#2ed573' : '#4ecdc4'};
      color: white;
      border-radius: 6px;
      z-index: 10000;
      font-size: 14px;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      animation: vaultSlideIn 0.3s ease;
    `;

    // Add animation styles if not present
    if (!document.getElementById('vault-notification-styles')) {
      const style = document.createElement('style');
      style.id = 'vault-notification-styles';
      style.textContent = `
        @keyframes vaultSlideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes vaultSlideOut {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'vaultSlideOut 0.3s ease';
      setTimeout(() => {
        if (notification.parentNode) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Clear vault
  clearVault() {
    this.assets.clear();
    this.initializeManifest();
    console.log('🗑️ Vault cleared');
  }
}

// Export for use in main application
window.VaultManager = VaultManager;