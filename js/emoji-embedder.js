/**
 * Revolutionary : Emoji Embedding System
 * Same brilliant UX as [[ system - type : and magic happens
 * That sock-blowing-off UX magic for emojis
 */

class EmojiEmbedder {
  constructor() {
    this.editor = null;
    this.isActive = false;
    this.triggerPosition = -1;
    this.modal = null;
    this.selectedIndex = 0;
    this.filteredEmojis = [];
    this.searchQuery = '';

    // Popular emojis organized by category
    this.emojiCategories = {
      recent: [
        {emoji: '😀', name: 'grinning face', keywords: 'happy smile'},
        {emoji: '😊', name: 'smiling face', keywords: 'happy'},
        {emoji: '😍', name: 'heart eyes', keywords: 'love'},
        {emoji: '🤔', name: 'thinking', keywords: 'think'},
        {emoji: '👍', name: 'thumbs up', keywords: 'good yes'},
        {emoji: '❤️', name: 'red heart', keywords: 'love'},
        {emoji: '🔥', name: 'fire', keywords: 'hot awesome'},
        {emoji: '⚡', name: 'lightning', keywords: 'fast energy'}
      ],
      smileys: [
        {emoji: '😀', name: 'grinning face', keywords: 'happy smile grin'},
        {emoji: '😃', name: 'grinning face with big eyes', keywords: 'happy smile joy'},
        {emoji: '😄', name: 'grinning face with smiling eyes', keywords: 'happy smile joy laugh'},
        {emoji: '😁', name: 'beaming face', keywords: 'happy smile joy'},
        {emoji: '😆', name: 'grinning squinting face', keywords: 'happy laugh haha'},
        {emoji: '😅', name: 'grinning face with sweat', keywords: 'happy laugh nervous'},
        {emoji: '😂', name: 'tears of joy', keywords: 'laugh crying happy lol'},
        {emoji: '🤣', name: 'rolling on floor laughing', keywords: 'laugh lol rofl'},
        {emoji: '😊', name: 'smiling face', keywords: 'happy smile'},
        {emoji: '😇', name: 'smiling face with halo', keywords: 'angel innocent'},
        {emoji: '🙂', name: 'slightly smiling face', keywords: 'smile happy'},
        {emoji: '🙃', name: 'upside down face', keywords: 'silly crazy'},
        {emoji: '😉', name: 'winking face', keywords: 'wink flirt'},
        {emoji: '😌', name: 'relieved face', keywords: 'calm peaceful'},
        {emoji: '😍', name: 'heart eyes', keywords: 'love heart'},
        {emoji: '🥰', name: 'smiling face with hearts', keywords: 'love cute'},
        {emoji: '😘', name: 'face blowing kiss', keywords: 'kiss love'},
        {emoji: '😗', name: 'kissing face', keywords: 'kiss'},
        {emoji: '😙', name: 'kissing face with smiling eyes', keywords: 'kiss happy'},
        {emoji: '😚', name: 'kissing face with closed eyes', keywords: 'kiss'},
        {emoji: '😋', name: 'face savoring food', keywords: 'yum delicious'},
        {emoji: '😛', name: 'face with tongue', keywords: 'tongue silly'},
        {emoji: '😝', name: 'squinting face with tongue', keywords: 'tongue silly'},
        {emoji: '😜', name: 'winking face with tongue', keywords: 'tongue wink'},
        {emoji: '🤪', name: 'zany face', keywords: 'crazy silly'},
        {emoji: '🤔', name: 'thinking face', keywords: 'think hmm'},
        {emoji: '🤨', name: 'face with raised eyebrow', keywords: 'suspicious'},
        {emoji: '😐', name: 'neutral face', keywords: 'meh'},
        {emoji: '😑', name: 'expressionless face', keywords: 'blank'},
        {emoji: '😶', name: 'face without mouth', keywords: 'silent'},
        {emoji: '😏', name: 'smirking face', keywords: 'smirk'},
        {emoji: '😒', name: 'unamused face', keywords: 'annoyed'},
        {emoji: '🙄', name: 'face with rolling eyes', keywords: 'eye roll'},
        {emoji: '😬', name: 'grimacing face', keywords: 'awkward'},
        {emoji: '🤥', name: 'lying face', keywords: 'lie pinocchio'},
        {emoji: '😔', name: 'pensive face', keywords: 'sad thoughtful'},
        {emoji: '😪', name: 'sleepy face', keywords: 'tired sleepy'},
        {emoji: '🤤', name: 'drooling face', keywords: 'drool'},
        {emoji: '😴', name: 'sleeping face', keywords: 'sleep zzz'},
        {emoji: '😷', name: 'face with medical mask', keywords: 'sick mask'},
        {emoji: '🤒', name: 'face with thermometer', keywords: 'sick fever'},
        {emoji: '🤕', name: 'face with head bandage', keywords: 'hurt injured'},
        {emoji: '🤢', name: 'nauseated face', keywords: 'sick green'},
        {emoji: '🤮', name: 'face vomiting', keywords: 'sick puke'},
        {emoji: '🤧', name: 'sneezing face', keywords: 'sick sneeze'},
        {emoji: '🥵', name: 'hot face', keywords: 'hot sweat'},
        {emoji: '🥶', name: 'cold face', keywords: 'cold freeze'},
        {emoji: '🥴', name: 'woozy face', keywords: 'dizzy drunk'},
        {emoji: '😵', name: 'dizzy face', keywords: 'dizzy confused'},
        {emoji: '🤯', name: 'exploding head', keywords: 'mind blown shocked'},
        {emoji: '🤠', name: 'cowboy hat face', keywords: 'cowboy hat'},
        {emoji: '🥳', name: 'partying face', keywords: 'party celebration'},
        {emoji: '😎', name: 'smiling face with sunglasses', keywords: 'cool sunglasses'},
        {emoji: '🤓', name: 'nerd face', keywords: 'smart glasses nerd'},
        {emoji: '🧐', name: 'face with monocle', keywords: 'fancy thinking'}
      ],
      objects: [
        {emoji: '⚡', name: 'lightning', keywords: 'fast energy power'},
        {emoji: '🔥', name: 'fire', keywords: 'hot awesome cool'},
        {emoji: '💎', name: 'gem stone', keywords: 'diamond precious'},
        {emoji: '🚀', name: 'rocket', keywords: 'space launch fast'},
        {emoji: '⭐', name: 'star', keywords: 'star favorite'},
        {emoji: '🌟', name: 'glowing star', keywords: 'star shine'},
        {emoji: '✨', name: 'sparkles', keywords: 'magic sparkle'},
        {emoji: '💫', name: 'dizzy', keywords: 'star magic'},
        {emoji: '🌈', name: 'rainbow', keywords: 'colorful rainbow'},
        {emoji: '☀️', name: 'sun', keywords: 'sunny bright'},
        {emoji: '🌙', name: 'crescent moon', keywords: 'moon night'},
        {emoji: '⚽', name: 'soccer ball', keywords: 'football sport'},
        {emoji: '🏀', name: 'basketball', keywords: 'sport ball'},
        {emoji: '🎯', name: 'bullseye', keywords: 'target goal'},
        {emoji: '🎮', name: 'video game', keywords: 'game controller'},
        {emoji: '🎵', name: 'musical note', keywords: 'music note'},
        {emoji: '🎶', name: 'musical notes', keywords: 'music song'},
        {emoji: '🎨', name: 'artist palette', keywords: 'art paint'},
        {emoji: '📱', name: 'mobile phone', keywords: 'phone smartphone'},
        {emoji: '💻', name: 'laptop', keywords: 'computer laptop'},
        {emoji: '⌨️', name: 'keyboard', keywords: 'keyboard type'},
        {emoji: '🖱️', name: 'computer mouse', keywords: 'mouse click'},
        {emoji: '🖥️', name: 'desktop computer', keywords: 'computer desktop'},
        {emoji: '📺', name: 'television', keywords: 'tv television'},
        {emoji: '📷', name: 'camera', keywords: 'photo camera'},
        {emoji: '📹', name: 'video camera', keywords: 'video camera'},
        {emoji: '🔍', name: 'magnifying glass', keywords: 'search zoom'},
        {emoji: '💡', name: 'light bulb', keywords: 'idea light'},
        {emoji: '🔧', name: 'wrench', keywords: 'tool fix'},
        {emoji: '🔨', name: 'hammer', keywords: 'tool build'},
        {emoji: '⚙️', name: 'gear', keywords: 'settings cog'},
        {emoji: '🎪', name: 'circus tent', keywords: 'circus fun'},
        {emoji: '🎭', name: 'performing arts', keywords: 'theater drama'},
        {emoji: '🏆', name: 'trophy', keywords: 'winner award'},
        {emoji: '🥇', name: 'gold medal', keywords: 'first place'},
        {emoji: '🎖️', name: 'military medal', keywords: 'honor award'},
        {emoji: '🏅', name: 'sports medal', keywords: 'achievement'},
        {emoji: '🎗️', name: 'reminder ribbon', keywords: 'ribbon awareness'}
      ],
      symbols: [
        {emoji: '❤️', name: 'red heart', keywords: 'love heart'},
        {emoji: '🧡', name: 'orange heart', keywords: 'love heart orange'},
        {emoji: '💛', name: 'yellow heart', keywords: 'love heart yellow'},
        {emoji: '💚', name: 'green heart', keywords: 'love heart green'},
        {emoji: '💙', name: 'blue heart', keywords: 'love heart blue'},
        {emoji: '💜', name: 'purple heart', keywords: 'love heart purple'},
        {emoji: '🖤', name: 'black heart', keywords: 'love heart black'},
        {emoji: '🤍', name: 'white heart', keywords: 'love heart white'},
        {emoji: '🤎', name: 'brown heart', keywords: 'love heart brown'},
        {emoji: '💕', name: 'two hearts', keywords: 'love hearts'},
        {emoji: '💖', name: 'sparkling heart', keywords: 'love sparkle'},
        {emoji: '💗', name: 'growing heart', keywords: 'love growing'},
        {emoji: '💘', name: 'heart with arrow', keywords: 'love cupid'},
        {emoji: '💝', name: 'heart with ribbon', keywords: 'love gift'},
        {emoji: '💞', name: 'revolving hearts', keywords: 'love hearts'},
        {emoji: '💟', name: 'heart decoration', keywords: 'love decoration'},
        {emoji: '💌', name: 'love letter', keywords: 'love letter'},
        {emoji: '💋', name: 'kiss mark', keywords: 'kiss lips'},
        {emoji: '👍', name: 'thumbs up', keywords: 'good yes like'},
        {emoji: '👎', name: 'thumbs down', keywords: 'bad no dislike'},
        {emoji: '👌', name: 'ok hand', keywords: 'okay perfect'},
        {emoji: '✌️', name: 'victory hand', keywords: 'peace victory'},
        {emoji: '🤞', name: 'crossed fingers', keywords: 'luck hope'},
        {emoji: '🤟', name: 'love you gesture', keywords: 'love you'},
        {emoji: '🤘', name: 'sign of horns', keywords: 'rock metal'},
        {emoji: '🤙', name: 'call me hand', keywords: 'call phone'},
        {emoji: '👈', name: 'backhand index pointing left', keywords: 'left point'},
        {emoji: '👉', name: 'backhand index pointing right', keywords: 'right point'},
        {emoji: '👆', name: 'backhand index pointing up', keywords: 'up point'},
        {emoji: '👇', name: 'backhand index pointing down', keywords: 'down point'},
        {emoji: '☝️', name: 'index pointing up', keywords: 'up point'},
        {emoji: '✋', name: 'raised hand', keywords: 'hand stop'},
        {emoji: '🤚', name: 'raised back of hand', keywords: 'hand stop'},
        {emoji: '🖐️', name: 'hand with fingers splayed', keywords: 'hand five'},
        {emoji: '🖖', name: 'vulcan salute', keywords: 'spock star trek'},
        {emoji: '👋', name: 'waving hand', keywords: 'wave hello goodbye'},
        {emoji: '🤜', name: 'right-facing fist', keywords: 'fist bump'},
        {emoji: '🤛', name: 'left-facing fist', keywords: 'fist bump'},
        {emoji: '✊', name: 'raised fist', keywords: 'fist power'},
        {emoji: '👊', name: 'oncoming fist', keywords: 'fist punch'},
        {emoji: '🙏', name: 'folded hands', keywords: 'pray thanks'},
        {emoji: '👏', name: 'clapping hands', keywords: 'clap applause'},
        {emoji: '🙌', name: 'raising hands', keywords: 'celebration praise'},
        {emoji: '👐', name: 'open hands', keywords: 'hands open hug'},
        {emoji: '🤲', name: 'palms up together', keywords: 'hands pray'},
        {emoji: '🤝', name: 'handshake', keywords: 'shake hands deal'},
        {emoji: '💪', name: 'flexed biceps', keywords: 'strong muscle'},
        {emoji: '🦾', name: 'mechanical arm', keywords: 'robot cyborg'},
        {emoji: '🦿', name: 'mechanical leg', keywords: 'robot cyborg'}
      ]
    };

    this.init();
  }

  init() {
    console.log('😊 Initializing BRILLIANT : Emoji Embedding System...');
    this.editor = document.getElementById('editor');
    if (!this.editor) return;

    this.setupTriggerDetection();
    this.createModalHTML();
    console.log('✨ : EMOJI EMBEDDING READY - SOCK-BLOWING UX ACTIVATED');
  }

  setupTriggerDetection() {
    this.editor.addEventListener('input', (e) => {
      this.detectColonTrigger(e);
    });

    this.editor.addEventListener('keydown', (e) => {
      if (this.isActive) {
        this.handleKeyNavigation(e);
      }
    });
  }

  detectColonTrigger(e) {
    const cursorPos = this.editor.selectionStart;
    const textBeforeCursor = this.editor.value.substring(0, cursorPos);

    // Check if we just typed : and it's not part of a URL or time
    if (textBeforeCursor.endsWith(':') && !this.isActive) {
      const charBefore = textBeforeCursor[textBeforeCursor.length - 2];

      // Don't trigger for URLs (http:, https:) or times (12:30)
      if (charBefore && /[a-zA-Z0-9]/.test(charBefore)) {
        return;
      }

      this.triggerPosition = cursorPos - 1; // Position of :
      this.showEmojiModal();
    }
  }

  showEmojiModal() {
    this.isActive = true;
    this.searchQuery = '';
    this.selectedIndex = 0;

    // Remove the : from editor
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition + 1);
    this.editor.value = before + after;
    this.editor.setSelectionRange(this.triggerPosition, this.triggerPosition);

    // Position and show modal
    this.positionModal();
    this.modal.style.display = 'block';
    this.modal.classList.add('active');

    // Load recent/popular emojis by default
    this.loadCategory('recent');

    // Focus search input
    const searchInput = this.modal.querySelector('#emoji-search-input');
    setTimeout(() => searchInput?.focus(), 100);
  }

  positionModal() {
    if (!this.modal) return;

    const cursorCoords = this.getCursorPosition();
    const modalRect = this.modal.getBoundingClientRect();

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
    // Use same brilliant positioning as [[ system
    const editorRect = this.editor.getBoundingClientRect();
    const style = getComputedStyle(this.editor);
    const lineHeight = parseInt(style.lineHeight) || 20;

    const textBeforeCursor = this.editor.value.substring(0, this.triggerPosition);
    const lines = textBeforeCursor.split('\n');
    const currentLine = lines.length - 1;
    const charInLine = lines[lines.length - 1].length;

    return {
      x: editorRect.left + 10 + (charInLine * 8),
      y: editorRect.top + 10 + (currentLine * lineHeight)
    };
  }

  createModalHTML() {
    this.modal = document.createElement('div');
    this.modal.className = 'emoji-embed-modal';
    this.modal.style.cssText = `
      position: fixed;
      display: none;
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      border: 2px solid #4ecdc4;
      border-radius: 12px;
      padding: 0;
      width: 320px;
      height: 400px;
      z-index: 10000;
      box-shadow: 0 15px 40px rgba(78, 205, 196, 0.3), 0 5px 15px rgba(0,0,0,0.5);
      color: white;
      font-family: 'Inter', sans-serif;
      animation: emojiModalSlide 0.2s ease;
      overflow: hidden;
    `;

    this.modal.innerHTML = `
      <!-- Header -->
      <div class="emoji-header" style="
        padding: 15px 20px;
        border-bottom: 1px solid #333;
        background: linear-gradient(135deg, #4ecdc4, #44a08d);
        color: white;
      ">
        <div style="display: flex; align-items: center; gap: 10px;">
          <span style="font-size: 20px;">😊</span>
          <h3 style="margin: 0; font-size: 16px; font-weight: 600;">Pick Emoji</h3>
          <button onclick="window.emojiEmbedder?.dismissModal()" style="
            background: none;
            border: none;
            color: white;
            font-size: 20px;
            cursor: pointer;
            margin-left: auto;
            opacity: 0.8;
          ">×</button>
        </div>

        <input type="text" id="emoji-search-input" placeholder="Search emojis..." style="
          width: 100%;
          padding: 8px 12px;
          border: none;
          border-radius: 6px;
          background: rgba(255,255,255,0.9);
          color: #333;
          font-size: 14px;
          margin-top: 10px;
          outline: none;
        ">
      </div>

      <!-- Categories -->
      <div class="emoji-categories" style="
        display: flex;
        background: #333;
        border-bottom: 1px solid #444;
        overflow-x: auto;
      ">
        <button class="emoji-cat-btn active" data-cat="recent" onclick="window.emojiEmbedder?.loadCategory('recent')" style="
          background: none;
          border: none;
          color: white;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 16px;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        ">🕒 Recent</button>
        <button class="emoji-cat-btn" data-cat="smileys" onclick="window.emojiEmbedder?.loadCategory('smileys')" style="
          background: none;
          border: none;
          color: #888;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 16px;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        ">😊 Smileys</button>
        <button class="emoji-cat-btn" data-cat="objects" onclick="window.emojiEmbedder?.loadCategory('objects')" style="
          background: none;
          border: none;
          color: #888;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 16px;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        ">⚡ Objects</button>
        <button class="emoji-cat-btn" data-cat="symbols" onclick="window.emojiEmbedder?.loadCategory('symbols')" style="
          background: none;
          border: none;
          color: #888;
          padding: 10px 15px;
          cursor: pointer;
          font-size: 16px;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        ">❤️ Symbols</button>
      </div>

      <!-- Emoji Grid -->
      <div class="emoji-grid-container" style="
        flex: 1;
        overflow-y: auto;
        padding: 15px;
      ">
        <div class="emoji-grid" id="emoji-grid" style="
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(40px, 1fr));
          gap: 5px;
        ">
          <!-- Emojis loaded here -->
        </div>
      </div>
    `;

    document.body.appendChild(this.modal);
    this.setupSearchInput();
    this.addModalStyles();

    // Close modal when clicking outside
    this.modal.addEventListener('click', (e) => {
      if (e.target === this.modal) {
        this.dismissModal();
      }
    });
  }

  addModalStyles() {
    const styleId = 'emoji-embed-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes emojiModalSlide {
        from {
          opacity: 0;
          transform: translateY(-10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      .emoji-cat-btn.active {
        color: #4ecdc4 !important;
        border-bottom-color: #4ecdc4 !important;
      }

      .emoji-btn {
        background: none;
        border: none;
        font-size: 24px;
        width: 40px;
        height: 40px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .emoji-btn:hover {
        background: #4ecdc4;
        transform: scale(1.1);
      }

      .emoji-btn.selected {
        background: #4ecdc4;
        outline: 2px solid #fff;
      }

      @media (max-width: 768px) {
        .emoji-embed-modal {
          position: fixed !important;
          top: 50% !important;
          left: 50% !important;
          transform: translate(-50%, -50%) !important;
          width: calc(100vw - 40px) !important;
          max-width: 350px !important;
          height: 400px !important;
        }
      }
    `;

    document.head.appendChild(style);
  }

  setupSearchInput() {
    const searchInput = this.modal.querySelector('#emoji-search-input');
    let searchTimeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        this.searchEmojis(e.target.value);
      }, 200);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.selectCurrentEmoji();
      } else if (e.key === 'Escape') {
        this.dismissModal();
      }
    });
  }

  loadCategory(categoryName) {
    // Update active category button
    this.modal.querySelectorAll('.emoji-cat-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.cat === categoryName);
      btn.style.color = btn.dataset.cat === categoryName ? '#4ecdc4' : '#888';
      btn.style.borderBottomColor = btn.dataset.cat === categoryName ? '#4ecdc4' : 'transparent';
    });

    // Load emojis for category
    const emojis = this.emojiCategories[categoryName] || [];
    this.filteredEmojis = emojis;
    this.selectedIndex = 0;
    this.renderEmojiGrid();
  }

  searchEmojis(query) {
    if (!query.trim()) {
      this.loadCategory('recent');
      return;
    }

    this.searchQuery = query.toLowerCase();
    const allEmojis = Object.values(this.emojiCategories).flat();

    this.filteredEmojis = allEmojis.filter(emoji =>
      emoji.name.includes(this.searchQuery) ||
      emoji.keywords.includes(this.searchQuery)
    ).slice(0, 24); // Limit search results

    this.selectedIndex = 0;
    this.renderEmojiGrid();
  }

  renderEmojiGrid() {
    const grid = this.modal.querySelector('#emoji-grid');
    if (!grid) return;

    grid.innerHTML = '';

    this.filteredEmojis.forEach((emoji, index) => {
      const btn = document.createElement('button');
      btn.className = 'emoji-btn';
      if (index === this.selectedIndex) btn.classList.add('selected');

      btn.textContent = emoji.emoji;
      btn.title = emoji.name;
      btn.onclick = () => this.selectEmoji(emoji.emoji);

      grid.appendChild(btn);
    });
  }

  handleKeyNavigation(e) {
    if (!this.isActive || this.filteredEmojis.length === 0) return;

    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 1, this.filteredEmojis.length - 1);
        this.updateSelection();
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
        this.updateSelection();
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.selectedIndex = Math.min(this.selectedIndex + 8, this.filteredEmojis.length - 1); // Move down a row
        this.updateSelection();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectedIndex = Math.max(this.selectedIndex - 8, 0); // Move up a row
        this.updateSelection();
        break;
      case 'Enter':
        e.preventDefault();
        this.selectCurrentEmoji();
        break;
      case 'Escape':
        e.preventDefault();
        this.dismissModal();
        break;
    }
  }

  updateSelection() {
    this.modal.querySelectorAll('.emoji-btn').forEach((btn, index) => {
      btn.classList.toggle('selected', index === this.selectedIndex);
    });

    // Scroll selected emoji into view
    const selectedBtn = this.modal.querySelector('.emoji-btn.selected');
    if (selectedBtn) {
      selectedBtn.scrollIntoView({ block: 'nearest' });
    }
  }

  selectCurrentEmoji() {
    if (this.filteredEmojis[this.selectedIndex]) {
      this.selectEmoji(this.filteredEmojis[this.selectedIndex].emoji);
    }
  }

  selectEmoji(emoji) {
    this.insertEmojiAtPosition(emoji);
    this.dismissModal();

    // Add to recent emojis
    this.addToRecent(emoji);
  }

  insertEmojiAtPosition(emoji) {
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition);

    this.editor.value = before + emoji + after;
    this.editor.setSelectionRange(
      this.triggerPosition + emoji.length,
      this.triggerPosition + emoji.length
    );

    // Trigger update
    this.editor.dispatchEvent(new Event('input'));
    this.editor.focus();
  }

  addToRecent(emoji) {
    // Add emoji to recent category (local storage could be used here)
    const recent = this.emojiCategories.recent;
    const existingIndex = recent.findIndex(e => e.emoji === emoji);

    if (existingIndex !== -1) {
      // Move to front
      const existing = recent.splice(existingIndex, 1)[0];
      recent.unshift(existing);
    } else {
      // Add new emoji to front
      const emojiData = this.findEmojiData(emoji);
      if (emojiData) {
        recent.unshift(emojiData);
        if (recent.length > 16) recent.pop(); // Keep only 16 recent
      }
    }
  }

  findEmojiData(emoji) {
    for (const category of Object.values(this.emojiCategories)) {
      const found = category.find(e => e.emoji === emoji);
      if (found) return found;
    }
    return { emoji, name: 'emoji', keywords: '' };
  }

  dismissModal() {
    if (!this.isActive) return;

    this.isActive = false;
    this.modal.style.display = 'none';
    this.modal.classList.remove('active');

    // Restore : if user cancelled
    const before = this.editor.value.substring(0, this.triggerPosition);
    const after = this.editor.value.substring(this.triggerPosition);
    this.editor.value = before + ':' + after;
    this.editor.setSelectionRange(this.triggerPosition + 1, this.triggerPosition + 1);
    this.editor.focus();
  }
}

// Export for use in main application
window.EmojiEmbedder = EmojiEmbedder;