/**
 * Vault Import/Export System
 * Handles ZIP vault creation, validation, and importing
 * Enables true portable vault functionality
 */

class VaultImportExport {
  constructor(vaultManager) {
    this.vaultManager = vaultManager;
    this.isProcessing = false;
  }

  // Export current vault as ZIP
  async exportVault(filename = null) {
    if (this.isProcessing) {
      this.showNotification('⏳ Export already in progress...', 'warning');
      return;
    }

    this.isProcessing = true;
    this.showNotification('📦 Creating vault ZIP...', 'info');

    try {
      const zip = new JSZip();

      // Create vault structure
      await this.createVaultStructure(zip);

      // Generate ZIP file
      const blob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // Download the vault
      const vaultFilename = filename || `${this.vaultManager.vaultName}-${this.getDateString()}.zip`;
      this.downloadBlob(blob, vaultFilename);

      const stats = this.vaultManager.getVaultStats();
      this.showNotification(
        `✅ Vault exported! ${stats.totalAssets} assets, ${this.vaultManager.formatFileSize(blob.size)}`,
        'success'
      );

    } catch (error) {
      console.error('Vault export failed:', error);
      this.showNotification('❌ Export failed: ' + error.message, 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  // Create the standardized vault structure in ZIP
  async createVaultStructure(zip) {
    // 1. Add manifest.json
    const manifest = {
      ...this.vaultManager.manifest,
      exported: new Date().toISOString(),
      vaultName: this.vaultManager.vaultName
    };
    zip.file('manifest.json', JSON.stringify(manifest, null, 2));

    // 2. Add main content (README.md)
    const editor = document.getElementById('editor');
    const mainContent = editor ? editor.value : '# Vault Content\n\nYour content will appear here.';
    zip.file('README.md', mainContent);

    // 3. Create assets folder and add all assets
    const assetsFolder = zip.folder('assets');

    for (const [filename, assetData] of this.vaultManager.assets) {
      try {
        // Convert file to proper format for ZIP
        const fileContent = await this.fileToArrayBuffer(assetData.file);
        assetsFolder.file(filename, fileContent);

        console.log(`📎 Added asset: ${filename}`);
      } catch (error) {
        console.warn(`Failed to add asset ${filename}:`, error);
      }
    }

    // 4. Add .impossible-writer metadata folder
    const metaFolder = zip.folder('.impossible-writer');

    // Settings
    const settings = {
      version: '1.0.0',
      exportedBy: 'ZL Writer',
      exportDate: new Date().toISOString(),
      userAgent: navigator.userAgent
    };
    metaFolder.file('settings.json', JSON.stringify(settings, null, 2));

    // History/metadata
    const history = {
      created: manifest.created,
      modified: manifest.modified,
      exports: [(new Date().toISOString())]
    };
    metaFolder.file('history.json', JSON.stringify(history, null, 2));
  }

  // Import vault from ZIP file
  async importVault(file) {
    if (this.isProcessing) {
      this.showNotification('⏳ Import already in progress...', 'warning');
      return;
    }

    this.isProcessing = true;
    this.showNotification('📥 Reading vault ZIP...', 'info');

    try {
      // Load and validate ZIP
      const zip = await JSZip.loadAsync(file);
      const isValidVault = await this.validateVault(zip);

      if (!isValidVault) {
        throw new Error('Invalid vault format - missing manifest.json');
      }

      // Check if we need to prompt for merge/overwrite
      const shouldPrompt = this.shouldPromptForImportMode();

      if (shouldPrompt) {
        const importMode = await this.showImportModeDialog();
        if (importMode === 'cancel') {
          this.showNotification('📥 Import cancelled', 'info');
          return;
        }

        if (importMode === 'overwrite') {
          await this.overwriteVault(zip);
        } else if (importMode === 'reset') {
          await this.resetVault();
        } else {
          await this.mergeVault(zip);
        }
      } else {
        // Empty vault - just import directly
        await this.overwriteVault(zip);
      }

      this.showNotification('✅ Vault imported successfully!', 'success');

    } catch (error) {
      console.error('Vault import failed:', error);
      this.showNotification('❌ Import failed: ' + error.message, 'error');
    } finally {
      this.isProcessing = false;
    }
  }

  // Validate vault ZIP structure
  async validateVault(zip) {
    try {
      // Check for required files
      const manifestFile = zip.file('manifest.json');
      if (!manifestFile) return false;

      // Validate manifest content
      const manifestContent = await manifestFile.async('text');
      const manifest = JSON.parse(manifestContent);

      if (!manifest.generator || !manifest.version) return false;
      if (manifest.generator !== 'ZL Writer') return false;

      return true;
    } catch (error) {
      console.error('Vault validation error:', error);
      return false;
    }
  }

  // Check if we should prompt for import mode
  shouldPromptForImportMode() {
    const editor = document.getElementById('editor');
    const hasContent = editor && editor.value.trim().length > 0;
    const hasAssets = this.vaultManager.assets.size > 0;

    return hasContent || hasAssets;
  }

  // Show import mode dialog
  async showImportModeDialog() {
    return new Promise((resolve) => {
      const modal = document.createElement('div');
      modal.className = 'vault-import-modal';
      modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
      `;

      modal.innerHTML = `
        <div style="
          background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
          border: 2px solid #4ecdc4;
          border-radius: 12px;
          padding: 30px;
          max-width: 450px;
          color: white;
          font-family: 'Inter', sans-serif;
          box-shadow: 0 20px 40px rgba(0,0,0,0.5);
        ">
          <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">📦</div>
            <h3 style="margin: 0; color: #4ecdc4; font-size: 24px;">Import Vault Options</h3>
          </div>

          <div style="background: rgba(255,215,0,0.1); border: 1px solid #ffd700; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; gap: 8px; color: #ffd700; font-weight: 600; margin-bottom: 8px;">
              ⚠️ Existing Content Detected
            </div>
            <p style="margin: 0; font-size: 14px; color: #ddd;">
              You have content in your current vault. Choose how to proceed:
            </p>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 25px;">
            <button id="merge-btn" style="
              background: linear-gradient(135deg, #4ecdc4, #44a08d);
              color: white;
              border: none;
              padding: 15px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
              text-align: left;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🔄</span>
                <div>
                  <div style="font-weight: 700;">Merge Vaults</div>
                  <div style="font-size: 12px; opacity: 0.9;">Keep current content + add imported assets</div>
                </div>
              </div>
            </button>

            <button id="overwrite-btn" style="
              background: linear-gradient(135deg, #ff4757, #ff6b7a);
              color: white;
              border: none;
              padding: 15px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
              text-align: left;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">🗑️</span>
                <div>
                  <div style="font-weight: 700;">Overwrite Vault</div>
                  <div style="font-size: 12px; opacity: 0.9;">Replace everything with imported vault</div>
                </div>
              </div>
            </button>

            <button id="reset-btn" style="
              background: linear-gradient(135deg, #ffd700, #ffb347);
              color: #000;
              border: none;
              padding: 15px 20px;
              border-radius: 8px;
              cursor: pointer;
              font-weight: 600;
              font-size: 16px;
              transition: all 0.2s ease;
              text-align: left;
            ">
              <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">✨</span>
                <div>
                  <div style="font-weight: 700;">Create New Vault</div>
                  <div style="font-size: 12px; opacity: 0.8;">Delete everything and start fresh (ignores ZIP)</div>
                </div>
              </div>
            </button>
          </div>

          <div style="text-align: center;">
            <button id="cancel-btn" style="
              background: transparent;
              color: #888;
              border: 1px solid #444;
              padding: 10px 20px;
              border-radius: 6px;
              cursor: pointer;
              font-size: 14px;
            ">
              Cancel Import
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Add hover effects
      const mergeBtn = modal.querySelector('#merge-btn');
      const overwriteBtn = modal.querySelector('#overwrite-btn');
      const resetBtn = modal.querySelector('#reset-btn');
      const cancelBtn = modal.querySelector('#cancel-btn');

      [mergeBtn, overwriteBtn, resetBtn].forEach(btn => {
        btn.addEventListener('mouseenter', () => {
          btn.style.transform = 'translateY(-2px)';
          btn.style.boxShadow = '0 8px 20px rgba(0,0,0,0.3)';
        });
        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        });
      });

      // Event listeners
      mergeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('merge');
      });

      overwriteBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('overwrite');
      });

      resetBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('reset');
      });

      cancelBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
        resolve('cancel');
      });

      // Close on backdrop click
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          document.body.removeChild(modal);
          resolve('cancel');
        }
      });
    });
  }

  // Overwrite current vault with imported one
  async overwriteVault(zip) {
    this.showNotification('🔄 Overwriting vault...', 'info');

    // Clear current vault
    this.vaultManager.clearVault();

    // Import manifest
    const manifestFile = zip.file('manifest.json');
    const manifestContent = await manifestFile.async('text');
    this.vaultManager.manifest = JSON.parse(manifestContent);

    // Import README content
    const readmeFile = zip.file('README.md');
    if (readmeFile) {
      const readmeContent = await readmeFile.async('text');
      const editor = document.getElementById('editor');
      if (editor) {
        editor.value = readmeContent;
        editor.dispatchEvent(new Event('input'));
      }
    }

    // Import assets
    await this.importAssetsFromZip(zip, false);
  }

  // Merge imported vault with current one
  async mergeVault(zip) {
    this.showNotification('🔄 Merging vaults...', 'info');

    // Import assets with conflict resolution
    await this.importAssetsFromZip(zip, true);

    // Optionally append README content
    const readmeFile = zip.file('README.md');
    if (readmeFile) {
      const readmeContent = await readmeFile.async('text');
      const editor = document.getElementById('editor');
      if (editor && readmeContent.trim()) {
        const currentContent = editor.value;
        const separator = currentContent.trim() ? '\n\n---\n\n# Imported Content\n\n' : '';
        editor.value = currentContent + separator + readmeContent;
        editor.dispatchEvent(new Event('input'));
      }
    }
  }

  // Reset vault - delete everything and create fresh vault
  async resetVault() {
    this.showNotification('✨ Creating new vault...', 'info');

    // Clear all vault data
    this.vaultManager.clearVault();

    // Clear editor content
    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = '';
      editor.dispatchEvent(new Event('input'));
    }

    // Clear localStorage content but keep the intentionally-cleared flag
    localStorage.removeItem('markdown-studio-content');
    localStorage.removeItem('markdown-studio-timestamp');
    localStorage.setItem('markdown-studio-intentionally-cleared', 'true');

    // Update preview to show empty state
    if (window.markdownApp) {
      window.markdownApp.updatePreview();
    }

    this.showNotification('✨ New vault created - ready for fresh content!', 'success');
  }

  // Import assets from ZIP
  async importAssetsFromZip(zip, handleConflicts) {
    const assetsFolder = zip.folder('assets');
    if (!assetsFolder) return;

    let importCount = 0;
    const files = Object.keys(assetsFolder.files);

    for (const relativePath of files) {
      if (relativePath.endsWith('/')) continue; // Skip folders

      const filename = relativePath.replace('assets/', '');
      const zipEntry = assetsFolder.files[relativePath];

      try {
        // Get file data
        const arrayBuffer = await zipEntry.async('arraybuffer');
        const blob = new Blob([arrayBuffer]);

        // Create File object
        let finalFilename = filename;
        if (handleConflicts && this.vaultManager.assets.has(filename)) {
          finalFilename = this.resolveFilenameConflict(filename);
        }

        // Determine original name and type
        const originalName = this.vaultManager.manifest.assets[filename]?.originalName || filename;
        const file = new File([blob], originalName, { type: blob.type });

        // Add to vault (skip auto-naming since we want to preserve vault structure)
        const type = this.vaultManager.detectMediaType(file);
        this.vaultManager.assets.set(finalFilename, {
          file: file,
          originalName: originalName,
          type: type,
          size: file.size,
          added: new Date().toISOString()
        });

        // Update manifest
        this.vaultManager.manifest.assets[finalFilename] = {
          originalName: originalName,
          type: type,
          size: file.size,
          added: new Date().toISOString()
        };

        importCount++;
        console.log(`📎 Imported asset: ${finalFilename}`);

      } catch (error) {
        console.error(`Failed to import asset ${filename}:`, error);
      }
    }

    this.showNotification(`📎 Imported ${importCount} assets`, 'success');
  }

  // Resolve filename conflicts during merge
  resolveFilenameConflict(filename) {
    const parts = filename.split('.');
    const ext = parts.pop();
    const nameWithoutExt = parts.join('.');

    let counter = 1;
    let newFilename = `${nameWithoutExt}_${counter}.${ext}`;

    while (this.vaultManager.assets.has(newFilename)) {
      counter++;
      newFilename = `${nameWithoutExt}_${counter}.${ext}`;
    }

    return newFilename;
  }

  // Utility functions
  async fileToArrayBuffer(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  getDateString() {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showNotification(message, type = 'info') {
    if (this.vaultManager && this.vaultManager.showNotification) {
      this.vaultManager.showNotification(message, type);
    }
  }
}

// Export for use in main application
window.VaultImportExport = VaultImportExport;