/**
 * Folder Manager for Impossible Writer
 * Implements local filesystem access for vault-like functionality
 */

class FolderManager {
  constructor() {
    this.currentDirectoryHandle = null;
    this.folderModeActive = false;
    this.fileCache = new Map();
    this.currentFile = null;
    // Don't setup swipe gestures until folder mode is activated
    
    // Make globally accessible
    window.folderManager = this;
  }

  // Setup swipe gestures for left panel
  setupSwipeGestures() {
    // Only setup if not already setup
    if (this.swipeGesturesSetup) return;
    this.swipeGesturesSetup = true;
    
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;
    let isSwipeActive = false;
    
    // Make swipe state accessible to click handler
    this.isSwipeActive = false;

    document.addEventListener('touchstart', (e) => {
      if (!this.folderModeActive) return;
      
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      
      // Only start swipe from left edge (first 20px)
      if (startX <= 20) {
        isSwipeActive = true;
        this.isSwipeActive = true;
      }
    });

    document.addEventListener('touchmove', (e) => {
      if (!isSwipeActive || !this.folderModeActive) return;
      
      currentX = e.touches[0].clientX;
      currentY = e.touches[0].clientY;
      
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);
      
      // Prevent default if horizontal swipe
      if (Math.abs(deltaX) > deltaY) {
        e.preventDefault();
      }
    });

    document.addEventListener('touchend', (e) => {
      if (!isSwipeActive || !this.folderModeActive) return;
      
      const deltaX = currentX - startX;
      const deltaY = Math.abs(currentY - startY);
      
      // If swipe right from left edge, open folder panel (only if folder mode is active)
      if (deltaX > 50 && deltaX > deltaY * 2) {
        if (this.folderModeActive) {
          const panel = document.getElementById('folderPanel');
          if (panel && !panel.classList.contains('open')) {
            panel.style.display = 'block';
            panel.classList.add('open');
          }
        }
      }
      
      isSwipeActive = false;
      // Clear swipe state after a short delay to allow click-outside to work
      setTimeout(() => {
        this.isSwipeActive = false;
      }, 100);
    });

    // Close panel on swipe left within panel
    const setupPanelSwipe = () => {
      const panel = document.getElementById('folderPanel');
      if (!panel) return;

      let panelStartX = 0;
      let panelIsSwipeActive = false;

      panel.addEventListener('touchstart', (e) => {
        panelStartX = e.touches[0].clientX;
        panelIsSwipeActive = true;
      });

      panel.addEventListener('touchend', (e) => {
        if (!panelIsSwipeActive) return;
        
        const deltaX = e.changedTouches[0].clientX - panelStartX;
        
        // Swipe left to close
        if (deltaX < -50) {
          this.closeFolderPanel();
        }
        
        panelIsSwipeActive = false;
      });
    };

    // Setup panel swipe after DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupPanelSwipe);
    } else {
      setupPanelSwipe();
    }

    // Add click-outside-to-close functionality for mobile (only for regular clicks, not swipes)
    const handleClickOutside = (e) => {
      if (!this.folderModeActive) return;
      
      const panel = document.getElementById('folderPanel');
      if (!panel || !panel.classList.contains('open')) return;
      
      // Don't trigger if we just had a swipe gesture
      if (this.isSwipeActive) {
        return;
      }
      
      // Check if click is outside the panel
      if (!panel.contains(e.target)) {
        this.closeFolderPanel();
      }
    };

    // Add both click and touchend listeners
    document.addEventListener('click', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
  }

  // Check if File System Access API is supported
  isSupported() {
    return 'showDirectoryPicker' in window;
  }

  // Toggle folder panel visibility and activate folder mode (like mobile toolbar)
  toggleFolderPanel() {
    const isMobile = window.innerWidth <= 768;
    const panel = isMobile ? 
      document.getElementById('folderPanel') : 
      document.getElementById('desktopFolderPanel');
    const leftTrigger = document.getElementById('leftSwipeTrigger');
    const desktopSlideArrow = document.getElementById('desktopSlideArrow');
    const isCurrentlyActive = this.folderModeActive;
    
    if (!isCurrentlyActive) {
      // Activate folder mode (like mobile toolbar)
      this.folderModeActive = true;
      
      // Setup swipe gestures when folder mode is first activated
      if (isMobile) {
        this.setupSwipeGestures();
        // Show left swipe trigger only on mobile when folder mode is active
        if (leftTrigger) {
          leftTrigger.classList.add('active');
        }
      } else {
        // Desktop: Show panel immediately and make slide arrow persistent
        panel.style.display = 'block';
        panel.classList.add('open');
        if (desktopSlideArrow) {
          desktopSlideArrow.classList.add('active');
        }
        // Add folder mode class (2px shift) and active class (350px shift)
        document.body.classList.add('desktop-folder-mode');
        document.body.classList.add('desktop-folder-active');
      }
      
      // Add visual indicator that folder mode is active
      this.showFolderModeIndicator();
      
      // Auto-open browser vault
      this.initializeBrowserVault();
    } else {
      // Deactivate folder mode completely
      this.folderModeActive = false;
      this.hideFolderModeIndicator();
      
      if (isMobile) {
        // Hide left swipe trigger on mobile
        if (leftTrigger) {
          leftTrigger.classList.remove('active');
        }
        // Close panel if open
        panel.classList.remove('open');
      } else {
        // Desktop: Hide panel and remove persistent slide
        panel.classList.remove('open');
        if (desktopSlideArrow) {
          desktopSlideArrow.classList.remove('active');
        }
        // Remove both folder mode and active classes
        document.body.classList.remove('desktop-folder-mode');
        document.body.classList.remove('desktop-folder-active');
        setTimeout(() => {
          panel.style.display = 'none';
        }, 300);
      }
    }
  }

  // Close folder panel only (keep folder mode active for swipe gestures)
  closeFolderPanel() {
    const isMobile = window.innerWidth <= 768;
    const panel = isMobile ? 
      document.getElementById('folderPanel') : 
      document.getElementById('desktopFolderPanel');
    
    panel.classList.remove('open');
    
    if (!isMobile) {
      // Desktop: Remove content push when panel closes (but keep folder mode for 2px shift)
      document.body.classList.remove('desktop-folder-active');
    }
    
    setTimeout(() => {
      if (isMobile) {
        panel.style.display = 'none';
      }
      // Desktop: Panel slides out but slide arrow stays visible
      // Keep folder mode active so button stays highlighted
      // IMPORTANT: Keep slide arrow visible so user can slide out again
    }, 300);
  }

  // Toggle folder panel (when desktop slide arrow is clicked)
  openFolderPanel() {
    const isMobile = window.innerWidth <= 768;
    const panel = isMobile ? 
      document.getElementById('folderPanel') : 
      document.getElementById('desktopFolderPanel');
    
    if (this.folderModeActive && panel) {
      // Check if panel is already open - if so, close it
      if (panel.classList.contains('open')) {
        this.closeFolderPanel();
      } else {
        // Open the panel
        panel.style.display = 'block';
        panel.classList.add('open');
        
        if (!isMobile) {
          // Desktop: Push content over when opening (folder mode already active)
          document.body.classList.add('desktop-folder-active');
        }
      }
    }
  }

  // Show visual indicator that folder mode is active
  showFolderModeIndicator() {
    const folderBtns = document.querySelectorAll('#desktop-folder-btn, #mobile-folder-btn');
    folderBtns.forEach(btn => {
      btn.classList.add('active');
    });
  }

  // Hide folder mode indicator
  hideFolderModeIndicator() {
    const folderBtns = document.querySelectorAll('#desktop-folder-btn, #mobile-folder-btn');
    folderBtns.forEach(btn => {
      btn.classList.remove('active');
    });
  }

  // Attempt to auto-detect default vault location
  async attemptAutoVaultDetection() {
    // Show loading state
    this.showLoadingState();
    
    try {
      // Check if we can access the File System Access API
      if (!this.isSupported()) {
        this.showVaultSetupOptions();
        return;
      }
      
      // Simulate the .2 second loading you mentioned
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // For now, show the vault setup options
      // In a real implementation, we could try to detect common vault locations
      this.showVaultSetupOptions();
      
    } catch (error) {
      console.error('Auto-detection failed:', error);
      this.showVaultSetupOptions();
    }
  }

  // Show loading state
  showLoadingState() {
    // ONLY show loading when folder mode is actually active
    if (!this.folderModeActive) {
      return;
    }
    
    const isMobile = window.innerWidth <= 768;
    const treeId = isMobile ? 'folderTree' : 'desktopFolderTree';
    const tree = document.getElementById(treeId);
    
    if (tree) {
      tree.innerHTML = `
        <div class="folder-loading">
          <div>⏳</div>
          <p>Setting up browser vault...</p>
        </div>
      `;
    }
  }

  // Show vault setup options
  showVaultSetupOptions() {
    // ONLY show setup options when folder mode is actually active
    if (!this.folderModeActive) {
      return;
    }
    
    const isMobile = window.innerWidth <= 768;
    const treeId = isMobile ? 'folderTree' : 'desktopFolderTree';
    const tree = document.getElementById(treeId);
    
    if (tree) {
      tree.innerHTML = `
        <div class="vault-setup">
          <div class="vault-icon">📁</div>
          <h4>Set Up Your Vault</h4>
          <p>Choose how you'd like to access your markdown files:</p>
          <div class="vault-options">
            <button class="vault-option-btn" onclick="window.folderManager.selectLocalFolder()">
              <span>📂</span>
              <div>
                <strong>Select Folder</strong>
                <small>Choose any folder on your device</small>
              </div>
            </button>
            <button class="vault-option-btn" onclick="window.folderManager.createBrowserVault()">
              <span>🌐</span>
              <div>
                <strong>Browser Vault</strong>
                <small>Store files in browser (offline access)</small>
              </div>
            </button>
          </div>
        </div>
      `;
    }
  }

  // Select local folder (simplified - no home directory access)
  async selectLocalFolder() {
    if (!this.isSupported()) {
      // Use browser vault instead
      await this.initializeBrowserVault();
      return;
    }

    try {
      // Let user choose any folder they want
      this.currentDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      await this.buildFolderTree();
      this.showNotification(`📂 Opened: ${this.currentDirectoryHandle.name}`, 'success');
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        this.showNotification('Failed to open folder', 'error');
      }
    }
  }

  // Find default zyzmdvault location
  async findDefaultVault() {
    try {
      // Try to access the origin private file system first (for mobile/web)
      if ('getDirectory' in navigator.storage) {
        try {
          const opfsRoot = await navigator.storage.getDirectory();
          const vaultHandle = await opfsRoot.getDirectoryHandle('zyzmdvault', { create: false });
          this.showNotification('📱 Using browser vault storage', 'info');
          return vaultHandle;
        } catch (opfsError) {
          // OPFS vault doesn't exist, continue to file system detection
        }
      }

      // For desktop: try to detect home directory and zyzmdvault
      // This requires user interaction due to security, but we can guide them
      return null; // Will trigger vault setup dialog
      
    } catch (error) {
      console.error('Error finding default vault:', error);
      return null;
    }
  }

  // Simplified vault setup dialog - browser vault or local folder only
  showVaultSetupDialog() {
    // Just initialize browser vault directly
    this.initializeBrowserVault();
  }

  // Removed - no longer creating vaults in home directory
  async createDefaultVault() {
    // Just use browser vault instead
    await this.initializeBrowserVault();
  }

  // Choose custom folder location
  async chooseFolderLocation() {
    try {
      this.currentDirectoryHandle = await window.showDirectoryPicker({
        mode: 'readwrite'
      });

      await this.buildFolderTree();
      this.closeVaultSetup();
      
      this.showNotification(`📂 Opened: ${this.currentDirectoryHandle.name}`, 'success');
      
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error selecting folder:', error);
        this.showNotification('Failed to open folder', 'error');
      }
    }
  }

  // Use browser-based vault (OPFS)
  async useBrowserVault() {
    try {
      if (!('getDirectory' in navigator.storage)) {
        this.showNotification('Browser vault not supported in this browser', 'error');
        return;
      }

      const opfsRoot = await navigator.storage.getDirectory();
      this.currentDirectoryHandle = await opfsRoot.getDirectoryHandle('zyzmdvault', {
        create: true
      });

      // Create welcome file if it doesn't exist
      try {
        await this.currentDirectoryHandle.getFileHandle('Welcome.md');
      } catch {
        const welcomeHandle = await this.currentDirectoryHandle.getFileHandle('Welcome.md', { create: true });
        const writable = await welcomeHandle.createWritable();
        await writable.write(`# Welcome to Your Browser Vault! 🌐

This vault is stored in your browser's private file system.

## Benefits:
- ✅ **Works Offline** - No internet needed
- ✅ **Fast Access** - Instant loading
- ✅ **Private** - Never leaves your browser
- ✅ **Persistent** - Survives browser restarts

## Note:
Browser vaults are tied to this specific browser and domain. For cross-device access, consider using a local folder vault instead.

---

*Your browser vault is ready! Start creating amazing markdown content.*
`);
        await writable.close();
      }

      await this.buildFolderTree();
      this.closeVaultSetup();
      
      this.showNotification('🌐 Browser vault ready!', 'success');
      
    } catch (error) {
      console.error('Error creating browser vault:', error);
      this.showNotification('Failed to create browser vault', 'error');
    }
  }

  // Close vault setup dialog
  closeVaultSetup() {
    if (this.currentSetupDialog) {
      this.currentSetupDialog.style.opacity = '0';
      setTimeout(() => {
        if (this.currentSetupDialog && this.currentSetupDialog.parentNode) {
          this.currentSetupDialog.parentNode.removeChild(this.currentSetupDialog);
        }
        this.currentSetupDialog = null;
      }, 300);
    }
  }

  // Build folder tree display
  async buildFolderTree() {
    const isMobile = window.innerWidth <= 768;
    const treeId = isMobile ? 'folderTree' : 'desktopFolderTree';
    const treeContainer = document.getElementById(treeId);
    if (!treeContainer) {
      console.error('Tree container not found:', treeId);
      return;
    }
    treeContainer.innerHTML = '<div class="loading">📂 Loading folder...</div>';

    try {
      const files = await this.scanDirectory(this.currentDirectoryHandle);
      this.renderFolderTree(files, treeContainer);
    } catch (error) {
      console.error('Error building folder tree:', error);
      treeContainer.innerHTML = '<div class="error">❌ Failed to load folder</div>';
    }
  }

  // Scan directory for markdown files
  async scanDirectory(directoryHandle, path = '') {
    const items = [];

    for await (const [name, handle] of directoryHandle.entries()) {
      const itemPath = path ? `${path}/${name}` : name;
      
      if (handle.kind === 'file') {
        // Only include markdown and text files
        if (name.endsWith('.md') || name.endsWith('.txt') || name.endsWith('.markdown')) {
          items.push({
            type: 'file',
            name: name,
            path: itemPath,
            handle: handle
          });
        }
      } else if (handle.kind === 'directory') {
        items.push({
          type: 'directory',
          name: name,
          path: itemPath,
          handle: handle,
          children: [] // Will be lazy-loaded
        });
      }
    }

    // Sort: directories first, then files alphabetically
    return items.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  // Render folder tree HTML
  renderFolderTree(items, container) {
    if (items.length === 0) {
      container.innerHTML = `
        <div class="folder-empty">
          <div>📂</div>
          <p>No markdown files found in this folder</p>
          <button class="btn" onclick="folderManager.createNewFile()">Create First File</button>
        </div>
      `;
      return;
    }

    const html = items.map(item => {
      if (item.type === 'directory') {
        return `
          <div class="folder-item directory" onclick="folderManager.toggleDirectory('${item.path}')">
            <span class="folder-icon">📁</span>
            <span class="folder-name">${item.name}</span>
          </div>
        `;
      } else {
        return `
          <div class="folder-item file" onclick="folderManager.openFile('${item.path}')">
            <span class="file-icon">📄</span>
            <span class="file-name">${item.name}</span>
          </div>
        `;
      }
    }).join('');

    container.innerHTML = `
      <div class="folder-path">
        <strong>📁 ${this.currentDirectoryHandle.name}</strong>
      </div>
      <div class="folder-items">
        ${html}
      </div>
    `;
  }

  // Open and load a file
  async openFile(filePath) {
    try {
      const file = await this.getFileByPath(filePath);
      if (!file) return;

      const content = await file.text();
      
      // Load content into editor
      const editor = document.getElementById('editor');
      if (editor) {
        editor.value = content;
        // Trigger preview update
        if (window.markdownStudio) {
          window.markdownStudio.updatePreview();
        }
      }

      this.currentFile = {
        path: filePath,
        handle: await this.getFileHandleByPath(filePath),
        content: content
      };

      this.showNotification(`Opened: ${filePath}`, 'success');
      
      // Close folder panel on mobile after opening file
      if (window.innerWidth <= 768) {
        this.closeFolderPanel();
      }
    } catch (error) {
      console.error('Error opening file:', error);
      this.showNotification('Failed to open file', 'error');
    }
  }

  // Get file handle by path
  async getFileHandleByPath(filePath) {
    const pathParts = filePath.split('/');
    let currentHandle = this.currentDirectoryHandle;

    for (let i = 0; i < pathParts.length - 1; i++) {
      currentHandle = await currentHandle.getDirectoryHandle(pathParts[i]);
    }

    return await currentHandle.getFileHandle(pathParts[pathParts.length - 1]);
  }

  // Get file by path
  async getFileByPath(filePath) {
    const handle = await this.getFileHandleByPath(filePath);
    return await handle.getFile();
  }

  // Create new file
  async createNewFile() {
    if (!this.currentDirectoryHandle) {
      this.showNotification('Please select a folder first', 'error');
      return;
    }

    const fileName = prompt('Enter filename (with .md extension):');
    if (!fileName) return;

    // Ensure .md extension
    const finalName = fileName.endsWith('.md') ? fileName : `${fileName}.md`;

    try {
      const fileHandle = await this.currentDirectoryHandle.getFileHandle(finalName, {
        create: true
      });

      const writable = await fileHandle.createWritable();
      await writable.write(`# ${finalName.replace('.md', '')}\n\nStart writing here...`);
      await writable.close();

      // Refresh folder tree
      await this.buildFolderTree();
      
      // Open the new file
      await this.openFile(finalName);
      
      this.showNotification(`Created: ${finalName}`, 'success');
    } catch (error) {
      console.error('Error creating file:', error);
      this.showNotification('Failed to create file', 'error');
    }
  }

  // Save current file
  async saveCurrentFile() {
    if (!this.currentFile || !this.currentFile.handle) {
      this.showNotification('No file selected for saving', 'error');
      return;
    }

    const editor = document.getElementById('editor');
    if (!editor) return;

    try {
      const writable = await this.currentFile.handle.createWritable();
      await writable.write(editor.value);
      await writable.close();

      this.currentFile.content = editor.value;
      this.showNotification(`Saved: ${this.currentFile.path}`, 'success');
    } catch (error) {
      console.error('Error saving file:', error);
      this.showNotification('Failed to save file', 'error');
    }
  }

  // Show vault path information with real filesystem paths
  async showVaultPath() {
    let pathInfo = '';
    let warningText = '';
    
    if (this.currentDirectoryHandle) {
      if (this.currentDirectoryHandle.name === 'zyzmdvault') {
        // Browser vault (OPFS) - try to get actual path
        const platform = navigator.platform.toLowerCase();
        const browser = this.detectBrowser();
        
        pathInfo = `📱 Browser Vault (OPFS):\n\nFolder: zyzmdvault/\n\n`;
        
        // Add platform-specific likely paths
        if (platform.includes('win')) {
          pathInfo += `🪟 Windows Likely Locations:\n`;
          if (browser.includes('chrome')) {
            pathInfo += `%LOCALAPPDATA%\\Google\\Chrome\\User Data\\Default\\File System\\Origins\\https_${window.location.hostname}_0\\...\\zyzmdvault\\\n\n`;
          } else if (browser.includes('edge')) {
            pathInfo += `%LOCALAPPDATA%\\Microsoft\\Edge\\User Data\\Default\\File System\\Origins\\https_${window.location.hostname}_0\\...\\zyzmdvault\\\n\n`;
          } else {
            pathInfo += `Look in browser profile folder → File System → Origins → ${window.location.hostname} → zyzmdvault\\\n\n`;
          }
        } else if (platform.includes('mac')) {
          pathInfo += `🍎 macOS Likely Locations:\n`;
          if (browser.includes('chrome')) {
            pathInfo += `~/Library/Application Support/Google/Chrome/Default/File System/Origins/https_${window.location.hostname}_0/.../zyzmdvault/\n\n`;
          } else if (browser.includes('safari')) {
            pathInfo += `~/Library/Safari/Databases/.../zyzmdvault/\n\n`;
          } else {
            pathInfo += `~/Library/Application Support/[Browser]/Default/File System/Origins/${window.location.hostname}/.../zyzmdvault/\n\n`;
          }
        } else {
          pathInfo += `🐧 Linux Likely Locations:\n`;
          if (browser.includes('chrome')) {
            pathInfo += `~/.config/google-chrome/Default/File System/Origins/https_${window.location.hostname}_0/.../zyzmdvault/\n\n`;
          } else {
            pathInfo += `~/.config/[browser]/Default/File System/Origins/${window.location.hostname}/.../zyzmdvault/\n\n`;
          }
        }
        
        pathInfo += `💡 For Syncing:\nUse "Export Vault (ZIP)" - browser files are hard to sync directly\n\n📦 For Migration:\nExport ZIP from old browser, import to new browser`;
        
        warningText = `⚠️ WARNING: If you clear browser data or "site data" in ${browser}, this vault will be permanently deleted! The exact path above may vary by browser version.`;
      } else {
        // Local folder vault - try to show more info
        try {
          // Try to get more information about the directory
          const entries = [];
          for await (const [name, handle] of this.currentDirectoryHandle.entries()) {
            entries.push(name);
            if (entries.length >= 3) break; // Just get a few examples
          }
          
          pathInfo = `📂 Local Folder Vault:\n\nSelected Folder: ${this.currentDirectoryHandle.name}\n\n`;
          
          if (entries.length > 0) {
            pathInfo += `📄 Contains: ${entries.slice(0, 3).join(', ')}${entries.length > 3 ? '...' : ''}\n\n`;
          }
          
          pathInfo += `🔍 To Find This Folder:\n1. Open your file manager (Finder/Explorer)\n2. Search for: "${this.currentDirectoryHandle.name}"\n3. Look for a folder containing the files listed above\n\n💡 For Syncing:\nPoint Syncthing/Dropbox to this exact folder\n\n📦 For Migration:\nCopy this entire folder to new device`;
          
          warningText = `💡 TIP: This is a real folder on your computer. Safe from browser data clearing. You can browse to it directly in your file manager.`;
        } catch (error) {
          pathInfo = `📂 Local Folder Vault:\n\nSelected Folder: ${this.currentDirectoryHandle.name}\n\nThis is a local folder you selected on your device.\n\n🔍 To find it: Search your computer for "${this.currentDirectoryHandle.name}"\n\n💡 For Syncing:\nPoint your sync software to this folder\n\n📦 For Migration:\nCopy the folder to new device`;
          warningText = `💡 TIP: This local folder persists independently of your browser.`;
        }
      }
    } else {
      pathInfo = `❌ No Vault Active\n\nPlease open a vault first using "📂 Open Folder" or create a browser vault.`;
      warningText = ``;
    }
    
    // Create custom modal for path display
    const modal = document.createElement('div');
    modal.className = 'modal show';
    modal.innerHTML = `
      <div class="modal-content" style="max-width: 600px;">
        <h3>📍 Vault File System Location</h3>
        <div style="background: #0a0a0a; border: 1px solid #333; border-radius: 8px; padding: 16px; margin: 16px 0; font-family: 'JetBrains Mono', monospace; font-size: 0.85em; line-height: 1.4; white-space: pre-line; overflow-x: auto;">${pathInfo}</div>
        ${warningText ? `<div style="background: rgba(255, 68, 68, 0.1); border: 1px solid #ff4444; border-radius: 8px; padding: 12px; margin: 16px 0; color: #ff6b6b; font-size: 0.9em; line-height: 1.4;">${warningText}</div>` : ''}
        <div class="modal-actions">
          <button class="btn" onclick="this.closest('.modal').remove()">Close</button>
        </div>
      </div>
    `;
    
    // Add click-outside to close
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.remove();
      }
    });
    
    document.body.appendChild(modal);
  }

  // Detect browser for more accurate path guidance
  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'Chrome';
    if (userAgent.includes('edg')) return 'Edge';
    if (userAgent.includes('firefox')) return 'Firefox';
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
    return 'Unknown Browser';
  }

  // Show notification
  showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `folder-notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: ${type === 'success' ? '#4ecdc4' : type === 'error' ? '#ff6b6b' : '#333'};
      color: ${type === 'success' || type === 'error' ? '#000' : '#fff'};
      padding: 12px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(-50%) translateY(20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Create new folder
  async createNewFolder() {
    if (!this.currentDirectoryHandle) {
      this.showNotification('Please open a folder first to create new folders', 'warning');
      return;
    }

    try {
      const folderName = prompt('Enter folder name:');
      if (!folderName) return;

      await this.currentDirectoryHandle.getDirectoryHandle(folderName, {
        create: true
      });

      this.showNotification(`Folder "${folderName}" created successfully!`, 'success');
      await this.buildFolderTree();
    } catch (error) {
      console.error('Failed to create folder:', error);
      this.showNotification('Failed to create folder: ' + error.message, 'error');
    }
  }

  // Create browser-based vault using OPFS
  async createBrowserVault() {
    try {
      this.showNotification('Creating browser vault...', 'info');
      
      // Use Origin Private File System
      if ('storage' in navigator && 'getDirectory' in navigator.storage) {
        const opfsRoot = await navigator.storage.getDirectory();
        const vaultHandle = await opfsRoot.getDirectoryHandle('zyzmdvault', {
          create: true
        });

        // Create welcome file
        const welcomeHandle = await vaultHandle.getFileHandle('Welcome.md', { create: true });
        const writable = await welcomeHandle.createWritable();
        await writable.write(`# Welcome to Your Browser Vault! 🌐

This vault is stored in your browser's private file system.

## Features:
- 📱 **Offline Access** - Works without internet
- 🔒 **Private Storage** - Only accessible to this app
- 💾 **Persistent** - Survives browser restarts
- 🚀 **Zero Setup** - No folder permissions needed

Your vault is ready to use!
`);
        await writable.close();

        this.currentDirectoryHandle = vaultHandle;
        await this.buildFolderTree();
        this.showNotification('Browser vault created successfully!', 'success');
      } else {
        this.showNotification('Browser vault not supported in this browser', 'error');
      }
    } catch (error) {
      console.error('Failed to create browser vault:', error);
      this.showNotification('Failed to create browser vault: ' + error.message, 'error');
    }
  }

  // Initialize browser vault automatically
  async initializeBrowserVault() {
    // Show loading state briefly
    this.showLoadingState();
    
    try {
      // Use Origin Private File System
      if ('storage' in navigator && 'getDirectory' in navigator.storage) {
        const opfsRoot = await navigator.storage.getDirectory();
        const vaultHandle = await opfsRoot.getDirectoryHandle('zyzmdvault', {
          create: true
        });

        // Check if welcome file exists
        let welcomeExists = false;
        try {
          await vaultHandle.getFileHandle('Welcome.md');
          welcomeExists = true;
        } catch (e) {
          // File doesn't exist, will create it
        }

        if (!welcomeExists) {
          // Create welcome file for new vault
          const welcomeHandle = await vaultHandle.getFileHandle('Welcome.md', { create: true });
          const writable = await welcomeHandle.createWritable();
          await writable.write(`# Welcome to Your Browser Vault! 🌐

## Start Writing!
This vault is stored securely in your browser. Your files are private and persist across sessions.

### Features:
- 📱 **Works Offline** - No internet required
- 💾 **Auto-saves** every 30 seconds
- 🔒 **Private** - Only you can access your files
- 📤 **Export Vault** - Download all files as ZIP

Click "New File" to create your first document!
`);
          await writable.close();
        }

        this.currentDirectoryHandle = vaultHandle;
        await this.buildFolderTree();
        
        if (!welcomeExists) {
          this.showNotification('Browser vault created!', 'success');
        }
      } else {
        // Fallback to file picker if OPFS not supported
        this.showVaultSetupOptions();
      }
    } catch (error) {
      console.error('Failed to initialize browser vault:', error);
      this.showVaultSetupOptions();
    }
  }
}

// Global instance
window.folderManager = new FolderManager();

// Global functions for onclick handlers
window.toggleFolderPanel = () => window.folderManager.toggleFolderPanel();
window.closeFolderPanel = () => window.folderManager.closeFolderPanel();
window.openFolderPanel = () => window.folderManager.openFolderPanel();
window.selectLocalFolder = () => window.folderManager.selectLocalFolder();
window.createNewFile = () => window.folderManager.createNewFile();
window.createNewFolder = () => window.folderManager.createNewFolder();
window.createBrowserVault = () => window.folderManager.createBrowserVault();
window.showVaultPath = () => window.folderManager.showVaultPath();

// Auto-save integration
setInterval(() => {
  if (window.folderManager.currentFile && window.folderManager.currentFile.handle) {
    window.folderManager.saveCurrentFile();
  }
}, 30000); // Auto-save every 30 seconds