// Mobile-specific functions for Markdown Studio

// Quick Export for mobile
window.quickExport = function() {
  const formats = ['Markdown', 'HTML', 'PDF', 'DOCX'];
  const choice = prompt('Export as:\n1. Markdown\n2. HTML\n3. PDF\n4. DOCX\n\nEnter number:');
  if (choice && choice >= 1 && choice <= 4) {
    const format = ['markdown', 'html', 'pdf', 'docx'][choice - 1];
    window.exportFormat(format);
  }
};

// Quick Import for mobile
window.quickImport = function() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.md,.txt,.html,.docx,.rtf,.pdf';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) window.handleImportFile(file);
  };
  input.click();
};

// Smart Room Action for mobile
window.smartRoomAction = function() {
  if (window.collaborationManager && window.collaborationManager.isConnected) {
    window.leaveRoom();
  } else {
    const roomNumber = prompt('Room name?');
    if (roomNumber) {
      const password = prompt('Password?');
      if (password) {
        document.getElementById('room-number').value = roomNumber;
        document.getElementById('room-password').value = password;
        window.createRoom();
      }
    }
  }
};

// Exit function (legacy - not used in standalone version)
window.exitToZyz = function() {
  if (confirm('Close Impossible Writer?')) {
    window.location.href = '../../';
  }
};

// Clear text with warning
window.clearTextWithWarning = function() {
  if (confirm('Clear all content? This cannot be undone.')) {
    const editor = document.getElementById('editor');
    if (editor) {
      editor.value = '';
      if (window.modeManager) {
        window.modeManager.updatePreview();
      }
    }
    
    // Clear diff boxes if in diff mode
    const diffOriginal = document.getElementById('diff-original');
    const diffModified = document.getElementById('diff-modified');
    if (diffOriginal) diffOriginal.value = '';
    if (diffModified) diffModified.value = '';
  }
};

// Toggle fullscreen
window.toggleFullscreen = function() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(err => {
      console.log(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
};

// Export entire vault as ZIP
window.exportVault = async function() {
  try {
    if (!window.folderManager || !window.folderManager.currentDirectoryHandle) {
      alert('Please open a vault first');
      return;
    }
    
    const zip = new JSZip();
    const handle = window.folderManager.currentDirectoryHandle;
    
    // Recursively add files to ZIP
    const addToZip = async (dirHandle, path = '') => {
      for await (const [name, entryHandle] of dirHandle.entries()) {
        const fullPath = path ? `${path}/${name}` : name;
        
        if (entryHandle.kind === 'file') {
          const file = await entryHandle.getFile();
          const content = await file.text();
          zip.file(fullPath, content);
        } else if (entryHandle.kind === 'directory') {
          await addToZip(entryHandle, fullPath);
        }
      }
    };
    
    await addToZip(handle);
    
    // Generate ZIP file
    const blob = await zip.generateAsync({ type: 'blob' });
    
    // Create download link
    const a = document.createElement('a');
    const url = URL.createObjectURL(blob);
    a.href = url;
    a.download = `vault-export-${new Date().toISOString().split('T')[0]}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Close export modal
    const modal = document.getElementById('exportModal');
    if (modal) modal.style.display = 'none';
    
    // Show success notification
    if (window.folderManager) {
      window.folderManager.showNotification('Vault exported successfully!', 'success');
    }
  } catch (error) {
    console.error('Failed to export vault:', error);
    alert('Failed to export vault: ' + error.message);
  }
};

// Show import modal
window.showImportModal = function() {
  const modal = document.getElementById('importModal');
  if (modal) {
    modal.style.display = 'block';
  }
};

// Show export modal  
window.showExportModal = function() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.style.display = 'block';
  }
};

// Close import modal
window.closeImportModal = function() {
  const modal = document.getElementById('importModal');
  if (modal) {
    modal.style.display = 'none';
  }
};

// Close export modal
window.closeExportModal = function() {
  const modal = document.getElementById('exportModal');
  if (modal) {
    modal.style.display = 'none';
  }
};