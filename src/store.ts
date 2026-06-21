import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuid } from 'uuid';
import type {
  ActionType,
  ActivityLogEntry,
  Incident,
  Role,
  TransportRecord,
  TriageCategory,
  TreatmentArea,
  Zone,
} from './types';
import { emptyTreatmentAreas, DEFAULT_ZONE_NAMES, TRIAGE_META } from './types';
import { generateJoinCode } from './services/joinCode';
import { registerSession, findSession } from './services/sessionRegistry';
import { incidentSync } from './services/sync';
import { isSupabaseConfigured } from './services/supabase';
import {
  createIncidentRow,
  findIncidentByCode,
  updateIncidentState,
  connectRealtime,
  disconnectRealtime,
  broadcastState as supabaseBroadcast,
  onRemoteUpdate,
} from './services/supabaseSync';
import { createSeedIncident } from './seed';

type SessionMode = 'local' | 'demo';

interface AppState {
  joinCode: string | null;
  mode: SessionMode;
  participantId: string;
  role: Role | null;
  incident: Incident;

  createSession: (name: string, location?: string) => string;
  joinSession: (joinCode: string) => Promise<boolean>;
  loadDemoSession: (scenarioName?: string) => void;
  leaveSession: () => void;

  setRole: (role: Role | null) => void;

  startNewIncident: (name: string, location?: string) => void;
  completeIncident: () => void;
  reopenIncident: () => void;
  resetIncident: () => void;
  loadIncident: (incident: Incident) => void;

  addZone: (name: string) => void;
  renameZone: (zoneId: string, newName: string) => void;
  deleteZone: (zoneId: string) => void;
  updateZoneCount: (zoneId: string, category: TriageCategory, delta: number) => void;

  updateTreatmentArea: (
    category: TriageCategory,
    field: keyof TreatmentArea,
    delta: number,
  ) => void;

  addTransport: (
    category: TriageCategory,
    fromArea: TriageCategory,
    destination: string,
    unitName: string,
  ) => void;
  departTransport: (id: string) => void;

  addLogEntry: (
    actionType: ActionType,
    category: TriageCategory | null,
    zoneOrArea: string | null,
    note: string,
  ) => void;
}

function createFreshIncident(name: string, location = ''): Incident {
  return {
    id: uuid(),
    name,
    location,
    startedAt: Date.now(),
    completedAt: null,
    status: 'active',
    zones: DEFAULT_ZONE_NAMES.map((n) => ({
      id: uuid(),
      name: n,
      redCount: 0,
      yellowCount: 0,
      greenCount: 0,
      blackCount: 0,
    })),
    treatmentAreas: emptyTreatmentAreas(),
    transports: [],
    activityLog: [],
  };
}

function makeLogEntry(
  state: AppState,
  actionType: ActionType,
  category: TriageCategory | null,
  zoneOrArea: string | null,
  note: string,
): ActivityLogEntry {
  return {
    id: uuid(),
    timestamp: Date.now(),
    actorRole: state.role ?? 'command',
    actionType,
    category,
    zoneOrArea,
    note,
  };
}

function syncState(state: AppState) {
  const { joinCode, participantId, mode, incident } = state;
  if (!joinCode) return;

  if (isSupabaseConfigured && mode === 'local') {
    supabaseBroadcast(participantId, incident);
    updateIncidentState(joinCode, incident);
  } else {
    incidentSync.broadcast({
      type: 'state_update',
      senderId: participantId,
      incident,
    });
  }
}

function connectSync(joinCode: string, participantId: string, useSupabase: boolean) {
  if (useSupabase && isSupabaseConfigured) {
    connectRealtime(joinCode, participantId);
    onRemoteUpdate((incident) => {
      useStore.setState({ incident });
    });
  } else {
    incidentSync.connect(joinCode);
    incidentSync.subscribe((msg) => {
      if (msg.senderId !== participantId && msg.type === 'state_update' && msg.incident) {
        useStore.setState({ incident: msg.incident });
      }
    });
  }
}

function disconnectSync() {
  disconnectRealtime();
  incidentSync.disconnect();
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      joinCode: null,
      mode: 'local',
      participantId: uuid(),
      role: null,
      incident: createFreshIncident('Incident'),

      createSession: (name, location) => {
        const code = generateJoinCode();
        const incident = createFreshIncident(name, location);
        const entry: ActivityLogEntry = {
          id: uuid(),
          timestamp: incident.startedAt,
          actorRole: get().role ?? 'command',
          actionType: 'incident_started',
          category: null,
          zoneOrArea: null,
          note: `Incident "${name}" started`,
        };
        incident.activityLog.push(entry);

        registerSession(code, name);

        if (isSupabaseConfigured) {
          createIncidentRow(code, incident).then((ok) => {
            if (!ok) console.error('[Session] Failed to persist incident to Supabase');
          });
        }

        connectSync(code, get().participantId, true);

        set({ joinCode: code, mode: 'local', incident });
        return code;
      },

      joinSession: async (joinCode) => {
        if (isSupabaseConfigured) {
          const incident = await findIncidentByCode(joinCode);
          if (!incident) return false;
          connectSync(joinCode, get().participantId, true);
          set({ joinCode, mode: 'local', incident });
          return true;
        }

        const localEntry = findSession(joinCode);
        if (!localEntry) return false;

        connectSync(joinCode, get().participantId, false);
        set({ joinCode, mode: 'local' });
        return true;
      },

      loadDemoSession: (scenarioName) => {
        const code = generateJoinCode();
        const incident = createSeedIncident(scenarioName);
        set({ joinCode: code, mode: 'demo', incident });
      },

      leaveSession: () => {
        disconnectSync();
        set({
          joinCode: null,
          mode: 'local',
          role: null,
          incident: createFreshIncident('Incident'),
        });
      },

      setRole: (role) => set({ role }),

      startNewIncident: (name, location) => {
        const incident = createFreshIncident(name, location);
        const entry: ActivityLogEntry = {
          id: uuid(),
          timestamp: incident.startedAt,
          actorRole: get().role ?? 'command',
          actionType: 'incident_started',
          category: null,
          zoneOrArea: null,
          note: `Incident "${name}" started`,
        };
        incident.activityLog.push(entry);
        set({ incident });
        syncState(get());
      },

      completeIncident: () =>
        set((state) => {
          const now = Date.now();
          const entry = makeLogEntry(state, 'incident_completed', null, null, 'Incident completed');
          const next = {
            incident: {
              ...state.incident,
              status: 'completed' as const,
              completedAt: now,
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      reopenIncident: () =>
        set((state) => {
          const entry = makeLogEntry(state, 'incident_reopened', null, null, 'Incident reopened');
          const next = {
            incident: {
              ...state.incident,
              status: 'active' as const,
              completedAt: null,
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      resetIncident: () => {
        set({ incident: createFreshIncident('Incident') });
        syncState(get());
      },

      loadIncident: (incident) => {
        set({ incident });
        syncState(get());
      },

      addZone: (name) =>
        set((state) => {
          const zone: Zone = {
            id: uuid(),
            name,
            redCount: 0,
            yellowCount: 0,
            greenCount: 0,
            blackCount: 0,
          };
          const entry = makeLogEntry(state, 'zone_created', null, name, `Zone "${name}" created`);
          const next = {
            incident: {
              ...state.incident,
              zones: [...state.incident.zones, zone],
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      renameZone: (zoneId, newName) =>
        set((state) => {
          const zone = state.incident.zones.find((z) => z.id === zoneId);
          if (!zone) return state;
          const oldName = zone.name;
          const entry = makeLogEntry(
            state, 'zone_renamed', null, newName,
            `Zone "${oldName}" renamed to "${newName}"`,
          );
          const next = {
            incident: {
              ...state.incident,
              zones: state.incident.zones.map((z) =>
                z.id === zoneId ? { ...z, name: newName } : z,
              ),
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      deleteZone: (zoneId) =>
        set((state) => {
          const zone = state.incident.zones.find((z) => z.id === zoneId);
          if (!zone) return state;
          const hasPatients = zone.redCount + zone.yellowCount + zone.greenCount + zone.blackCount > 0;
          if (hasPatients) return state;
          const entry = makeLogEntry(
            state, 'zone_deleted', null, zone.name,
            `Zone "${zone.name}" deleted`,
          );
          const next = {
            incident: {
              ...state.incident,
              zones: state.incident.zones.filter((z) => z.id !== zoneId),
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      updateZoneCount: (zoneId, category, delta) =>
        set((state) => {
          const countKey = `${category}Count` as keyof Pick<Zone, 'redCount' | 'yellowCount' | 'greenCount' | 'blackCount'>;
          const zone = state.incident.zones.find((z) => z.id === zoneId);
          if (!zone) return state;

          const newVal = Math.max(0, zone[countKey] + delta);
          const zones = state.incident.zones.map((z) =>
            z.id === zoneId ? { ...z, [countKey]: newVal } : z,
          );

          const sign = delta > 0 ? '+' : '';
          const label = TRIAGE_META[category].label;
          const entry = makeLogEntry(
            state,
            'triage_count',
            category,
            zone.name,
            `${sign}${delta} ${label} in ${zone.name}`,
          );

          const next = {
            incident: {
              ...state.incident,
              zones,
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      updateTreatmentArea: (category, field, delta) =>
        set((state) => {
          const area = state.incident.treatmentAreas[category];
          const newVal = Math.max(0, area[field] + delta);
          const catLabel = TRIAGE_META[category].label;
          const entry = makeLogEntry(
            state,
            'treatment_update',
            category,
            `${catLabel} treatment`,
            `${field} ${delta > 0 ? '+' : ''}${delta} in ${catLabel} treatment area`,
          );
          const next = {
            incident: {
              ...state.incident,
              treatmentAreas: {
                ...state.incident.treatmentAreas,
                [category]: { ...area, [field]: newVal },
              },
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      addTransport: (category, fromArea, destination, unitName) =>
        set((state) => {
          const transport: TransportRecord = {
            id: uuid(),
            category,
            fromArea,
            destination,
            unitName,
            loadedAt: Date.now(),
            departedAt: null,
          };
          const entry = makeLogEntry(
            state,
            'transport_loaded',
            category,
            destination,
            `${unitName} loaded from ${TRIAGE_META[category].label} area to ${destination}`,
          );
          const next = {
            incident: {
              ...state.incident,
              transports: [...state.incident.transports, transport],
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      departTransport: (id) =>
        set((state) => {
          const transport = state.incident.transports.find((t) => t.id === id);
          if (!transport) return state;

          const entry = makeLogEntry(
            state,
            'transport_departed',
            transport.category,
            transport.destination,
            `${transport.unitName} departed to ${transport.destination}`,
          );
          const next = {
            incident: {
              ...state.incident,
              transports: state.incident.transports.map((t) =>
                t.id === id ? { ...t, departedAt: Date.now() } : t,
              ),
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),

      addLogEntry: (actionType, category, zoneOrArea, note) =>
        set((state) => {
          const entry = makeLogEntry(state, actionType, category, zoneOrArea, note);
          const next = {
            incident: {
              ...state.incident,
              activityLog: [...state.incident.activityLog, entry],
            },
          };
          setTimeout(() => syncState(get()), 0);
          return next;
        }),
    }),
    {
      name: 'mci-triage-store',
      partialize: (state) => ({
        joinCode: state.joinCode,
        mode: state.mode,
        participantId: state.participantId,
        role: state.role,
        incident: state.incident,
      }),
      onRehydrateStorage: () => {
        return (rehydrated?: AppState, error?: unknown) => {
          if (error || !rehydrated) return;
          const { joinCode, participantId, mode } = rehydrated;
          if (joinCode && mode === 'local') {
            connectSync(joinCode, participantId, isSupabaseConfigured);
          }
        };
      },
    },
  ),
);
