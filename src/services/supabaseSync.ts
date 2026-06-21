import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Incident } from '../types';

let channel: RealtimeChannel | null = null;
let currentJoinCode: string | null = null;
const listeners = new Set<(incident: Incident) => void>();

export async function createIncidentRow(
  joinCode: string,
  incident: Incident,
): Promise<boolean> {
  if (!supabase) return false;
  const { error } = await supabase.from('incidents').insert({
    id: incident.id,
    join_code: joinCode,
    name: incident.name,
    location: incident.location,
    status: incident.status,
    started_at: incident.startedAt,
    completed_at: incident.completedAt,
    state: incident,
  });
  if (error) console.error('[Supabase] createIncidentRow failed:', error.message);
  return !error;
}

export async function findIncidentByCode(
  joinCode: string,
): Promise<Incident | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('incidents')
    .select('state')
    .eq('join_code', joinCode)
    .single();
  if (error) console.error('[Supabase] findIncidentByCode failed:', error.message);
  if (error || !data) return null;
  return data.state as Incident;
}

export function getSupabaseDebugInfo(): string {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;
  if (!url && !key) return 'Supabase: no env vars set';
  if (!url) return 'Supabase: URL missing';
  if (!key) return 'Supabase: key missing';
  return `Supabase: connected (${url.slice(0, 30)}...)`;
}

export async function updateIncidentState(
  joinCode: string,
  incident: Incident,
): Promise<void> {
  if (!supabase) return;
  await supabase
    .from('incidents')
    .update({
      status: incident.status,
      completed_at: incident.completedAt,
      state: incident,
    })
    .eq('join_code', joinCode);
}

export function connectRealtime(
  joinCode: string,
  senderId: string,
): void {
  disconnectRealtime();
  if (!supabase) return;

  currentJoinCode = joinCode;
  channel = supabase.channel(`incident-${joinCode}`);

  channel.on('broadcast', { event: 'state_update' }, (payload) => {
    const msg = payload.payload as { senderId: string; incident: Incident };
    if (msg.senderId !== senderId) {
      listeners.forEach((fn) => fn(msg.incident));
    }
  });

  channel.subscribe();
}

export function disconnectRealtime(): void {
  if (channel && supabase) {
    supabase.removeChannel(channel);
  }
  channel = null;
  currentJoinCode = null;
}

export function broadcastState(
  senderId: string,
  incident: Incident,
): void {
  if (!channel || !currentJoinCode) return;
  channel.send({
    type: 'broadcast',
    event: 'state_update',
    payload: { senderId, incident },
  });
}

export function onRemoteUpdate(
  fn: (incident: Incident) => void,
): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function isConnected(): boolean {
  return channel !== null;
}
