/**
 * Impossible Writer Collaboration System V2
 * Revolutionary real-time collaborative editing with operational transform
 */

class CollaborationManager {
  constructor() {
    this.localPeerId = this.generatePeerId();
    this.roomId = null;
    this.roomPassword = null;
    this.isHost = false;
    this.isCollaborating = false;
    this.isConnectedToRelay = false;
    this.websocket = null;
    this.editorInstance = null;

    // Collaborative engine
    this.collaborativeEngine = null;

    // Connection stats
    this.connectedUsers = new Map();
    this.connectionAttempts = 0;
    this.maxReconnectAttempts = 5;

    // Relay configuration
    this.relayUrl = 'wss://iw-relay-production.up.railway.app';

    // Message queue for offline operations
    this.messageQueue = [];
  }

  generatePeerId() {
    return 'peer_' + Math.random().toString(36).substr(2, 12);
  }

  generateRoomId(number, password) {
    const combined = number + ':' + password;
    return btoa(combined).replace(/[^a-zA-Z0-9]/g, '').substr(0, 20);
  }

  async createRoom(number, password, editor) {
    this.roomId = this.generateRoomId(number, password);
    this.roomPassword = password;
    this.isHost = true;
    this.editorInstance = editor;
    this.isCollaborating = true;

    console.log('🏠 Creating revolutionary collaboration room:', this.roomId);

    // Initialize collaborative engine
    this.initializeCollaborativeEngine();

    // Connect to relay
    this.connectToRelay();

    return `${window.location.origin}${window.location.pathname}#room=${number}&pass=${password}`;
  }

  async joinRoom(number, password, editor) {
    this.roomId = this.generateRoomId(number, password);
    this.roomPassword = password;
    this.isHost = false;
    this.editorInstance = editor;
    this.isCollaborating = true;

    console.log('🚪 Joining revolutionary collaboration room:', this.roomId);

    // Initialize collaborative engine
    this.initializeCollaborativeEngine();

    // Connect to relay
    this.connectToRelay();
  }

  initializeCollaborativeEngine() {
    // Create relay adapter
    const relayAdapter = {
      send: (type, data) => {
        this.sendToRelay(type, data);
      },
      onMessage: null // Will be set by engine
    };

    // Initialize collaborative engine
    this.collaborativeEngine = new CollaborativeEngine(relayAdapter);
    this.collaborativeEngine.initialize(this.editorInstance);

    console.log('🚀 Revolutionary collaborative engine initialized');
  }

  connectToRelay() {
    // Try multiple connection methods for Railway compatibility
    const relayUrls = [
      `${this.relayUrl}/room/${this.roomId}`,
      `${this.relayUrl}/?room=${this.roomId}`
    ];

    this.tryConnectToRelay(relayUrls, 0);
  }

  tryConnectToRelay(urls, urlIndex) {
    if (urlIndex >= urls.length) {
      this.connectionAttempts++;
      if (this.connectionAttempts < this.maxReconnectAttempts) {
        console.log(`🔄 Retrying connection (attempt ${this.connectionAttempts + 1}/${this.maxReconnectAttempts})...`);
        setTimeout(() => {
          this.tryConnectToRelay(urls, 0);
        }, 1000 * this.connectionAttempts);
      } else {
        console.error('❌ All relay connection attempts failed');
        this.showNotification('❌ Failed to connect to collaboration service', 'error');
      }
      return;
    }

    const relayUrl = urls[urlIndex];
    console.log(`📡 Connecting to relay (attempt ${urlIndex + 1}): ${relayUrl}`);

    try {
      this.websocket = new WebSocket(relayUrl);

      this.websocket.onopen = () => {
        console.log('✅ Connected to Impossible Writer Relay');
        this.isConnectedToRelay = true;
        this.connectionAttempts = 0;
        this.updateConnectionStatus();
        this.showNotification('🎉 Connected to revolutionary collaboration!', 'success');

        // Process any queued messages
        this.processMessageQueue();
      };

      this.websocket.onmessage = (event) => {
        this.handleRelayMessage(JSON.parse(event.data));
      };

      this.websocket.onerror = (error) => {
        console.error(`❌ Relay connection error (attempt ${urlIndex + 1}):`, error);
        if (urlIndex + 1 < urls.length) {
          console.log(`🔄 Trying next connection method...`);
          this.tryConnectToRelay(urls, urlIndex + 1);
        } else {
          this.tryConnectToRelay(urls, urls.length); // Trigger retry logic
        }
      };

      this.websocket.onclose = (event) => {
        console.log('🔌 Relay connection closed:', event.code, event.reason);
        this.isConnectedToRelay = false;
        this.updateConnectionStatus();

        // If connection failed immediately, try next URL
        if (event.code === 1006 && urlIndex + 1 < urls.length) {
          console.log(`🔄 Connection refused, trying next method...`);
          this.tryConnectToRelay(urls, urlIndex + 1);
          return;
        }

        // Otherwise, attempt full reconnect after delay
        if (this.isCollaborating && event.code !== 1000) {
          setTimeout(() => {
            if (this.isCollaborating) {
              console.log('🔄 Attempting relay reconnect...');
              this.connectToRelay();
            }
          }, 3000);
        }
      };

    } catch (error) {
      console.error('❌ Failed to create WebSocket connection:', error);
      this.tryConnectToRelay(urls, urlIndex + 1);
    }
  }

  handleRelayMessage(message) {
    console.log('📨 Relay message:', message.type, message);

    // Handle connection-specific messages
    switch (message.type) {
      case 'connected':
        console.log(`🎯 Connected as ${message.connectionId}`);
        this.relayConnectionId = message.connectionId;
        this.updateConnectionStatus();
        break;

      case 'user-joined':
        if (message.connectionId !== this.relayConnectionId) {
          console.log(`👋 User ${message.connectionId} joined`);
          this.connectedUsers.set(message.connectionId, {
            id: message.connectionId,
            joinedAt: Date.now()
          });
          this.updateConnectionStatus();
          this.showNotification(`📥 User joined (${message.userCount} total)`, 'info');
        }
        break;

      case 'user-left':
        if (message.connectionId !== this.relayConnectionId) {
          console.log(`👋 User ${message.connectionId} left`);
          this.connectedUsers.delete(message.connectionId);
          this.updateConnectionStatus();
          this.showNotification(`📤 User left (${message.userCount || this.connectedUsers.size + 1} total)`, 'info');
        }
        break;

      case 'error':
        console.error('⚠️ Relay error:', message.message);
        this.showNotification(`⚠️ ${message.message}`, 'error');
        break;

      default:
        // Forward to collaborative engine
        if (this.collaborativeEngine && this.collaborativeEngine.relay.onMessage) {
          this.collaborativeEngine.relay.onMessage(message.type, message.data || message);
        }
        break;
    }
  }

  sendToRelay(messageType, data) {
    const message = {
      type: messageType,
      data: data,
      peerId: this.localPeerId,
      timestamp: Date.now()
    };

    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      console.log('📬 Queued message for later delivery:', messageType);
    }
  }

  processMessageQueue() {
    if (this.messageQueue.length > 0) {
      console.log(`📮 Processing ${this.messageQueue.length} queued messages`);
      this.messageQueue.forEach(message => {
        this.websocket.send(JSON.stringify(message));
      });
      this.messageQueue = [];
    }
  }

  updateConnectionStatus() {
    const totalUsers = this.connectedUsers.size + 1; // +1 for local user

    // Update room button with sophisticated styling
    const roomButtons = document.querySelectorAll('#desktop-room-btn, #mobile-room-btn');
    roomButtons.forEach(btn => {
      if (this.isConnectedToRelay) {
        btn.textContent = `🌐 Live (${totalUsers})`;
        btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        btn.style.color = 'white';
        btn.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
        btn.style.transform = 'translateY(-1px)';
      } else {
        btn.textContent = '🌐 Room';
        btn.style.background = '';
        btn.style.color = '';
        btn.style.boxShadow = '';
        btn.style.transform = '';
      }
    });

    // Update peer count display
    const peerCount = document.getElementById('peer-count');
    if (peerCount) {
      if (this.isConnectedToRelay) {
        peerCount.textContent = `${totalUsers} writers`;
        peerCount.style.display = 'inline';
      } else {
        peerCount.style.display = 'none';
      }
    }

    // Show collaborative stats in console
    if (this.collaborativeEngine) {
      const stats = this.collaborativeEngine.getStats();
      console.log('📊 Collaboration stats:', stats);
    }
  }

  disconnect(reason = 'User disconnected') {
    console.log('🔌 Disconnecting from revolutionary collaboration:', reason);

    this.isCollaborating = false;
    this.isConnectedToRelay = false;

    if (this.websocket) {
      this.websocket.close(1000, reason);
      this.websocket = null;
    }

    // Clean up collaborative engine
    if (this.collaborativeEngine) {
      // Remove all collaborative cursors and UI
      const cursorContainer = document.getElementById('collaborative-cursors');
      if (cursorContainer) {
        cursorContainer.remove();
      }
    }

    // Clear user data
    this.connectedUsers.clear();
    this.messageQueue = [];

    this.updateConnectionStatus();
    this.showNotification(reason, 'info');
  }

  showNotification(message, type = 'info') {
    // Create sophisticated notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      background: ${type === 'error' ?
        'linear-gradient(135deg, #ff6b6b, #ee5a24)' :
        type === 'success' ?
        'linear-gradient(135deg, #51cf66, #40c057)' :
        'linear-gradient(135deg, #339af0, #228be6)'
      };
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 600;
      max-width: 320px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      backdrop-filter: blur(8px);
      border: 1px solid rgba(255,255,255,0.1);
      z-index: 10000;
      transform: translateX(100%) scale(0.8);
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
      font-family: 'Inter', sans-serif;
    `;

    // Add icon based on type
    const icon = type === 'error' ? '⚠️' : type === 'success' ? '✅' : 'ℹ️';
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 16px;">${icon}</span>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in with sophisticated timing
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0) scale(1)';
        notification.style.opacity = '1';
      });
    });

    // Animate out and remove
    setTimeout(() => {
      notification.style.transform = 'translateX(100%) scale(0.8)';
      notification.style.opacity = '0';
      setTimeout(() => {
        if (notification.parentElement) {
          notification.remove();
        }
      }, 400);
    }, 4000);
  }

  // Get detailed collaboration statistics
  getCollaborationStats() {
    return {
      isConnected: this.isConnectedToRelay,
      roomId: this.roomId,
      connectedUsers: this.connectedUsers.size,
      isHost: this.isHost,
      connectionAttempts: this.connectionAttempts,
      queuedMessages: this.messageQueue.length,
      engine: this.collaborativeEngine ? this.collaborativeEngine.getStats() : null
    };
  }
}

// Export for use in main editor
window.CollaborationManager = CollaborationManager;