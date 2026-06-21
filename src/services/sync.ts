import type { Incident } from '../types';

export interface SyncMessage {
  type: 'state_update' | 'join' | 'leave';
  senderId: string;
  incident?: Incident;
  participantId?: string;
}

export class IncidentSync {
  private channel: BroadcastChannel | null = null;
  private listeners: Set<(msg: SyncMessage) => void> = new Set();

  connect(joinCode: string): void {
    this.disconnect();
    this.channel = new BroadcastChannel(`mci-triage-${joinCode}`);
    this.channel.onmessage = (e: MessageEvent) => {
      const msg = e.data as SyncMessage;
      this.listeners.forEach((fn) => fn(msg));
    };
  }

  disconnect(): void {
    this.channel?.close();
    this.channel = null;
  }

  broadcast(msg: SyncMessage): void {
    this.channel?.postMessage(msg);
  }

  subscribe(fn: (msg: SyncMessage) => void): () => void {
    this.listeners.add(fn);
    return () => {
      this.listeners.delete(fn);
    };
  }

  get connected(): boolean {
    return this.channel !== null;
  }
}

// Singleton
export const incidentSync = new IncidentSync();
