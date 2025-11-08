/**
 * INTELLIGENT VAULT SEARCH - THE FINAL IMPOSSIBLE FEATURE
 * Beyond search - discover connections in your vault without AI
 * The forgotten city shot into space
 */

class VaultSearch {
  constructor(vaultManager) {
    this.vaultManager = vaultManager;
    this.searchIndex = new Map(); // content -> { filename, snippet, position }
    this.isIndexing = false;
    this.searchModal = null;
    this.currentResults = [];

    this.init();
  }

  init() {
    console.log('🔍 Initializing FINAL IMPOSSIBLE FEATURE - Vault Search...');
    this.createSearchModal();
    this.setupKeyboardShortcuts();
    this.buildInitialIndex();
    console.log('✨ VAULT SEARCH ACTIVATED - THE CITY IS IN SPACE');
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+F or Cmd+F for vault search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && e.shiftKey) {
        e.preventDefault();
        this.showSearchModal();
      }
      // Escape to close
      if (e.key === 'Escape' && this.searchModal && this.searchModal.style.display === 'block') {
        this.hideSearchModal();
      }
    });
  }

  buildInitialIndex() {
    if (this.isIndexing) return;
    this.isIndexing = true;

    // Index current editor content
    const editor = document.getElementById('editor');
    if (editor && editor.value.trim()) {
      this.indexContent(editor.value, 'Current Document');
    }

    // Index vault assets (markdown content only for now)
    for (const [filename, assetData] of this.vaultManager.assets) {
      if (assetData.type === 'document' && filename.endsWith('.md')) {
        // Would need to read file content - for now just index filename
        this.indexContent(filename, filename);
      }
    }

    this.isIndexing = false;
  }

  indexContent(content, source) {
    if (!content || content.length < 3) return;

    // Split into words and create index entries
    const words = content.toLowerCase().match(/\b\w+\b/g) || [];
    const lines = content.split('\n');

    words.forEach((word, wordIndex) => {
      if (word.length < 3) return; // Skip short words

      if (!this.searchIndex.has(word)) {
        this.searchIndex.set(word, []);
      }

      // Find which line this word is on
      let charCount = 0;
      let lineIndex = 0;
      for (let i = 0; i < lines.length; i++) {
        if (charCount + lines[i].length >= content.toLowerCase().indexOf(word, charCount)) {
          lineIndex = i;
          break;
        }
        charCount += lines[i].length + 1; // +1 for newline
      }

      this.searchIndex.get(word).push({
        source: source,
        line: lineIndex,
        lineContent: lines[lineIndex] || '',
        wordPosition: wordIndex,
        context: this.extractContext(lines, lineIndex)
      });
    });
  }

  extractContext(lines, lineIndex) {
    const start = Math.max(0, lineIndex - 1);
    const end = Math.min(lines.length, lineIndex + 2);
    return lines.slice(start, end).join('\n').trim();
  }

  createSearchModal() {
    this.searchModal = document.createElement('div');
    this.searchModal.className = 'vault-search-modal';
    this.searchModal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      display: none;
      z-index: 10000;
      backdrop-filter: blur(10px);
    `;

    this.searchModal.innerHTML = `
      <div class="search-container" style="
        position: absolute;
        top: 10%;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
        border: 2px solid #4ecdc4;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 20px 60px rgba(78, 205, 196, 0.3);
      ">
        <!-- Search Header -->
        <div class="search-header" style="
          padding: 20px;
          border-bottom: 1px solid #333;
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          color: white;
        ">
          <div style="display: flex; align-items: center; gap: 15px;">
            <span style="font-size: 24px;">🔍</span>
            <h2 style="margin: 0; font-size: 20px;">Vault Search</h2>
            <div style="flex: 1;"></div>
            <button onclick="window.vaultSearch?.hideSearchModal()" style="
              background: none;
              border: none;
              color: white;
              font-size: 24px;
              cursor: pointer;
              opacity: 0.8;
            ">×</button>
          </div>

          <div style="margin-top: 15px;">
            <input type="text" id="vault-search-input" placeholder="Search your vault..." style="
              width: 100%;
              padding: 12px 15px;
              border: none;
              border-radius: 8px;
              background: rgba(255,255,255,0.95);
              color: #333;
              font-size: 16px;
              outline: none;
            ">
          </div>
        </div>

        <!-- Search Results -->
        <div class="search-results" id="search-results" style="
          max-height: 60vh;
          overflow-y: auto;
          padding: 20px;
          color: white;
        ">
          <div class="search-placeholder" style="
            text-align: center;
            padding: 40px 20px;
            color: #888;
            font-size: 16px;
          ">
            <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
            <div>Start typing to search your vault</div>
            <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">
              Discover connections • Find patterns • Explore ideas
            </div>
          </div>
        </div>

        <!-- Search Footer -->
        <div class="search-footer" style="
          padding: 15px 20px;
          border-top: 1px solid #333;
          background: #222;
          font-size: 12px;
          color: #666;
          text-align: center;
        ">
          <div>Press Ctrl+Shift+F to search • Escape to close • Click results to open in new tabs</div>
        </div>
      </div>
    `;

    document.body.appendChild(this.searchModal);
    this.setupSearchInput();
  }

  setupSearchInput() {
    const searchInput = this.searchModal.querySelector('#vault-search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.performSearch(e.target.value);
      }, 300); // Debounce search
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.openAllResults();
      }
    });
  }

  showSearchModal() {
    this.buildInitialIndex(); // Refresh index
    this.searchModal.style.display = 'block';

    const searchInput = this.searchModal.querySelector('#vault-search-input');
    setTimeout(() => {
      searchInput.focus();
      searchInput.select();
    }, 100);
  }

  hideSearchModal() {
    this.searchModal.style.display = 'none';
    this.currentResults = [];
  }

  performSearch(query) {
    if (!query || query.length < 2) {
      this.showPlaceholder();
      return;
    }

    const results = this.searchVault(query);
    this.displayResults(query, results);
  }

  searchVault(query) {
    const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 1);
    const results = new Map(); // source -> { matches: [], score: 0 }

    searchTerms.forEach(term => {
      // Exact matches
      if (this.searchIndex.has(term)) {
        this.searchIndex.get(term).forEach(entry => {
          this.addToResults(results, entry, term, 10); // High score for exact
        });
      }

      // Partial matches (fuzzy)
      for (const [indexedTerm, entries] of this.searchIndex.entries()) {
        if (indexedTerm.includes(term) && indexedTerm !== term) {
          entries.forEach(entry => {
            this.addToResults(results, entry, term, 5); // Lower score for partial
          });
        }
      }
    });

    // Convert to array and sort by score
    return Array.from(results.entries())
      .map(([source, data]) => ({ source, ...data }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20); // Limit results
  }

  addToResults(results, entry, searchTerm, score) {
    const source = entry.source;

    if (!results.has(source)) {
      results.set(source, { matches: [], score: 0, contexts: new Set() });
    }

    const result = results.get(source);
    result.score += score;
    result.matches.push({ term: searchTerm, ...entry });
    result.contexts.add(entry.context);
  }

  displayResults(query, results) {
    const resultsContainer = this.searchModal.querySelector('#search-results');
    this.currentResults = results;

    if (results.length === 0) {
      resultsContainer.innerHTML = `
        <div style="text-align: center; padding: 40px; color: #666;">
          <div style="font-size: 48px; margin-bottom: 15px;">🔍</div>
          <div>No results found for "${query}"</div>
          <div style="font-size: 14px; margin-top: 10px;">Try different keywords or check spelling</div>
        </div>
      `;
      return;
    }

    let html = `
      <div class="results-header" style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #333;
      ">
        <div>
          <span style="color: #4ecdc4; font-weight: 600;">${results.length} result${results.length > 1 ? 's' : ''}</span>
          <span style="color: #888; margin-left: 10px;">for "${query}"</span>
        </div>
        <button onclick="window.vaultSearch?.openAllResults()" style="
          background: linear-gradient(135deg, #4ecdc4, #44a08d);
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 600;
        ">
          📑 Open All (${results.length})
        </button>
      </div>
    `;

    results.forEach((result, index) => {
      const contexts = Array.from(result.contexts).slice(0, 3); // Max 3 contexts
      const matchCount = result.matches.length;

      html += `
        <div class="search-result" onclick="window.vaultSearch?.openResult(${index})" style="
          background: linear-gradient(135deg, #333, #444);
          border: 1px solid #555;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        " onmouseover="this.style.borderColor='#4ecdc4'" onmouseout="this.style.borderColor='#555'">

          <div class="result-header" style="
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 10px;
          ">
            <div style="
              font-weight: 600;
              color: #4ecdc4;
              font-size: 16px;
            ">
              ${result.source}
            </div>
            <div style="
              font-size: 12px;
              color: #888;
              background: #222;
              padding: 4px 8px;
              border-radius: 4px;
            ">
              ${matchCount} match${matchCount > 1 ? 'es' : ''}
            </div>
          </div>

          <div class="result-contexts">
            ${contexts.map(context => `
              <div style="
                background: #222;
                padding: 10px;
                border-radius: 6px;
                margin-bottom: 8px;
                font-size: 14px;
                line-height: 1.4;
                color: #ddd;
              ">
                ${this.highlightMatches(context, query)}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;
  }

  highlightMatches(text, query) {
    const terms = query.toLowerCase().split(/\s+/);
    let highlighted = text;

    terms.forEach(term => {
      if (term.length > 1) {
        const regex = new RegExp(`(${this.escapeRegex(term)})`, 'gi');
        highlighted = highlighted.replace(regex, '<mark style="background: #4ecdc4; color: #000; padding: 2px 4px; border-radius: 3px; font-weight: 600;">$1</mark>');
      }
    });

    return highlighted;
  }

  escapeRegex(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  showPlaceholder() {
    const resultsContainer = this.searchModal.querySelector('#search-results');
    resultsContainer.innerHTML = `
      <div class="search-placeholder" style="
        text-align: center;
        padding: 40px 20px;
        color: #888;
        font-size: 16px;
      ">
        <div style="font-size: 48px; margin-bottom: 15px;">🎯</div>
        <div>Start typing to search your vault</div>
        <div style="font-size: 14px; margin-top: 10px; opacity: 0.7;">
          Discover connections • Find patterns • Explore ideas
        </div>
      </div>
    `;
  }

  openResult(index) {
    if (index < 0 || index >= this.currentResults.length) return;

    const result = this.currentResults[index];

    if (result.source === 'Current Document') {
      // Just close search and focus editor
      this.hideSearchModal();
      const editor = document.getElementById('editor');
      if (editor) editor.focus();
    } else {
      // For vault files, would need to implement tab system
      // For now, just show notification
      this.showNotification(`📖 Opening: ${result.source}`, 'info');
      this.hideSearchModal();
    }
  }

  openAllResults() {
    if (this.currentResults.length === 0) return;

    this.showNotification(`📑 Opening ${this.currentResults.length} results in new context`, 'success');

    // For now, just show all filenames
    const filenames = this.currentResults.map(r => r.source).join('\n• ');
    console.log('📑 Would open these files:\n•', filenames);

    this.hideSearchModal();
  }

  showNotification(message, type = 'info') {
    if (this.vaultManager && this.vaultManager.showNotification) {
      this.vaultManager.showNotification(message, type);
    }
  }

  // Public API for global access
  search(query) {
    this.showSearchModal();
    const searchInput = this.searchModal.querySelector('#vault-search-input');
    if (searchInput) {
      searchInput.value = query;
      this.performSearch(query);
    }
  }
}

// Export for use in main application
window.VaultSearch = VaultSearch;