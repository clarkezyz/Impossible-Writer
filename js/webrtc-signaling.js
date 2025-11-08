/**
 * WebRTC Signaling Module
 * Uses public STUN/TURN servers and a simple signaling approach
 * For true P2P collaboration without backend infrastructure
 */

class WebRTCSignaling {
  constructor() {
    // We'll use a creative approach with public paste services for signaling
    // This is a temporary solution - in production you'd want a proper signaling server
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' }
      ]
    };
  }

  // Use BroadcastChannel API for local network collaboration
  setupLocalNetworkSignaling(roomId) {
    if ('BroadcastChannel' in window) {
      this.channel = new BroadcastChannel(`markdown-collab-${roomId}`);
      return true;
    }
    return false;
  }

  // Alternative: Use shared worker for same-origin collaboration
  setupSharedWorkerSignaling(roomId) {
    try {
      this.worker = new SharedWorker('js/collaboration-worker.js');
      this.worker.port.start();
      this.worker.port.postMessage({ type: 'join', roomId });
      return true;
    } catch (e) {
      console.log('SharedWorker not available:', e);
      return false;
    }
  }

  // For cross-network collaboration, we'll use a hybrid approach
  async setupCrossNetworkSignaling(roomId) {
    // Option 1: Use public WebSocket relay services
    // Option 2: Use WebTorrent for P2P discovery
    // Option 3: Use gun.js for decentralized signaling
    
    // For now, we'll implement a simple polling mechanism with IndexedDB
    this.db = await this.openSignalingDB();
    this.roomId = roomId;
    this.startPolling();
  }

  async openSignalingDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('MarkdownCollabSignaling', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('signals')) {
          const store = db.createObjectStore('signals', { keyPath: 'id' });
          store.createIndex('roomId', 'roomId', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async sendSignal(targetPeerId, signal) {
    const id = `${this.peerId}-${targetPeerId}-${Date.now()}`;
    const transaction = this.db.transaction(['signals'], 'readwrite');
    const store = transaction.objectStore('signals');
    
    await store.add({
      id,
      roomId: this.roomId,
      from: this.peerId,
      to: targetPeerId,
      signal,
      timestamp: Date.now()
    });
  }

  async getSignals() {
    const transaction = this.db.transaction(['signals'], 'readonly');
    const store = transaction.objectStore('signals');
    const index = store.index('roomId');
    
    return new Promise((resolve, reject) => {
      const request = index.getAll(this.roomId);
      request.onsuccess = () => {
        const signals = request.result.filter(s => 
          s.to === this.peerId && 
          (Date.now() - s.timestamp) < 30000 // 30 second timeout
        );
        resolve(signals);
      };
      request.onerror = () => reject(request.error);
    });
  }

  startPolling() {
    this.pollInterval = setInterval(async () => {
      try {
        const signals = await this.getSignals();
        signals.forEach(signal => {
          if (this.onSignal) {
            this.onSignal(signal);
          }
          // Delete processed signal
          this.deleteSignal(signal.id);
        });
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 1000);
  }

  async deleteSignal(id) {
    const transaction = this.db.transaction(['signals'], 'readwrite');
    const store = transaction.objectStore('signals');
    store.delete(id);
  }

  async cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    
    // Clean up old signals
    const transaction = this.db.transaction(['signals'], 'readwrite');
    const store = transaction.objectStore('signals');
    const index = store.index('timestamp');
    
    const cutoff = Date.now() - 60000; // 1 minute
    const range = IDBKeyRange.upperBound(cutoff);
    
    index.openCursor(range).onsuccess = (event) => {
      const cursor = event.target.result;
      if (cursor) {
        store.delete(cursor.primaryKey);
        cursor.continue();
      }
    };
  }
}

// Shared Worker for same-origin collaboration
const workerCode = `
let rooms = new Map();

self.onconnect = function(e) {
  const port = e.ports[0];
  
  port.onmessage = function(event) {
    const { type, roomId, data } = event.data;
    
    switch (type) {
      case 'join':
        if (!rooms.has(roomId)) {
          rooms.set(roomId, new Set());
        }
        rooms.get(roomId).add(port);
        
        // Notify others in room
        rooms.get(roomId).forEach(p => {
          if (p !== port) {
            p.postMessage({ type: 'peer-joined', data: { roomId } });
          }
        });
        break;
        
      case 'signal':
        // Relay signal to all others in room
        if (rooms.has(roomId)) {
          rooms.get(roomId).forEach(p => {
            if (p !== port) {
              p.postMessage({ type: 'signal', data });
            }
          });
        }
        break;
        
      case 'leave':
        if (rooms.has(roomId)) {
          rooms.get(roomId).delete(port);
          if (rooms.get(roomId).size === 0) {
            rooms.delete(roomId);
          }
        }
        break;
    }
  };
};
`;

// Create worker blob URL
const workerBlob = new Blob([workerCode], { type: 'application/javascript' });
const workerUrl = URL.createObjectURL(workerBlob);

// Export worker URL for use
window.COLLABORATION_WORKER_URL = workerUrl;