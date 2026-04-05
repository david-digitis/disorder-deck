import WebSocket from 'ws';
import { EventEmitter } from 'events';

const OVERLAY_URL = 'ws://127.0.0.1:39120';
const RECONNECT_INTERVAL = 5000;

export interface OverlayState {
  adminTab: string;
  tsLiveMode: string;
  tsConnected: boolean;
  voiceCount: number;
  whisperActive: boolean;
  selfStatus?: string;
  fleetVisible: boolean;
  tsLiveVisible: boolean;
}

class OverlayClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private destroyed = false;

  connect() {
    if (this.destroyed) return;
    this.cleanup();

    try {
      this.ws = new WebSocket(OVERLAY_URL);
    } catch {
      this.scheduleReconnect();
      return;
    }

    this.ws.on('open', () => {
      console.log('[OverlayClient] Connected to Disorder Overlay');
      this.emit('connected');
    });

    this.ws.on('message', (data) => {
      try {
        const msg = JSON.parse(data.toString());
        if (msg.type === 'state') {
          this.emit('stateChanged', msg.data as OverlayState);
        }
      } catch (err) {
        console.error('[OverlayClient] Parse error:', err);
      }
    });

    this.ws.on('close', () => {
      console.log('[OverlayClient] Disconnected');
      this.emit('disconnected');
      this.scheduleReconnect();
    });

    this.ws.on('error', () => {
      // Silently handle connection errors — reconnect will handle it
    });
  }

  send(action: string) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'command', action }));
    }
  }

  private scheduleReconnect() {
    if (this.destroyed) return;
    this.reconnectTimer = setTimeout(() => this.connect(), RECONNECT_INTERVAL);
  }

  private cleanup() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.removeAllListeners();
      if (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING) {
        this.ws.close();
      }
      this.ws = null;
    }
  }

  destroy() {
    this.destroyed = true;
    this.cleanup();
  }
}

export const overlayClient = new OverlayClient();
