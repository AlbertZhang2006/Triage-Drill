export type TriageCategory = 'red' | 'yellow' | 'green' | 'black';

export type Role =
  | 'scribe'
  | 'command'
  | 'treatment'
  | 'transport'
  | 'evaluator';

export type IncidentStatus = 'active' | 'completed';

export interface Zone {
  id: string;
  name: string;
  redCount: number;
  yellowCount: number;
  greenCount: number;
  blackCount: number;
}

export interface TreatmentArea {
  received: number;
  awaitingTransport: number;
  transported: number;
  upgraded: number;
  downgraded: number;
}

export type TreatmentAreas = Record<TriageCategory, TreatmentArea>;

export interface TransportRecord {
  id: string;
  category: TriageCategory;
  fromArea: TriageCategory;
  destination: string;
  unitName: string;
  loadedAt: number;
  departedAt: number | null;
}

export type ActionType =
  | 'triage_count'
  | 'zone_created'
  | 'zone_renamed'
  | 'zone_deleted'
  | 'treatment_update'
  | 'transport_loaded'
  | 'transport_departed'
  | 'incident_started'
  | 'incident_completed'
  | 'incident_reopened'
  | 'note';

export interface ActivityLogEntry {
  id: string;
  timestamp: number;
  actorRole: Role;
  actionType: ActionType;
  category: TriageCategory | null;
  zoneOrArea: string | null;
  note: string;
}

export interface Incident {
  id: string;
  name: string;
  location: string;
  startedAt: number;
  completedAt: number | null;
  status: IncidentStatus;
  zones: Zone[];
  treatmentAreas: TreatmentAreas;
  transports: TransportRecord[];
  activityLog: ActivityLogEntry[];
}

export interface TriageCounts {
  red: number;
  yellow: number;
  green: number;
  black: number;
}

export const TRIAGE_META: Record<TriageCategory, { label: string; color: string; bg: string }> = {
  red: { label: 'Immediate', color: '#b91c1c', bg: '#fef2f2' },
  yellow: { label: 'Delayed', color: '#ca8a04', bg: '#fffbeb' },
  green: { label: 'Minor', color: '#15803d', bg: '#f0fdf4' },
  black: { label: 'Expectant', color: '#374151', bg: '#f3f4f6' },
};

export const ROLE_META: Record<Role, { label: string; description: string }> = {
  scribe: {
    label: 'Triage Scribe',
    description: 'Record triage counts by zone.',
  },
  treatment: {
    label: 'Treatment Area',
    description: 'Track patient flow through treatment areas.',
  },
  transport: {
    label: 'Transport Group',
    description: 'Manage staging, transport queue, and departures.',
  },
  command: {
    label: 'Incident Command',
    description: 'View live totals, zone counts, alerts, and bottlenecks.',
  },
  evaluator: {
    label: 'After-Action Review',
    description: 'Review drill timeline, metrics, and export reports.',
  },
};

export const CATEGORIES: TriageCategory[] = ['red', 'yellow', 'green', 'black'];

export function emptyTreatmentArea(): TreatmentArea {
  return { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 };
}

export function emptyTreatmentAreas(): TreatmentAreas {
  return {
    red: emptyTreatmentArea(),
    yellow: emptyTreatmentArea(),
    green: emptyTreatmentArea(),
    black: emptyTreatmentArea(),
  };
}

export function isZoneEmpty(zone: Zone): boolean {
  return zone.redCount === 0 && zone.yellowCount === 0 && zone.greenCount === 0 && zone.blackCount === 0;
}

export const DEFAULT_ZONE_NAMES = ['North Staging', 'South Staging', 'East Entrance', 'Main Triage'];

export interface DrillScenario {
  name: string;
  location: string;
  description: string;
}

export const DRILL_SCENARIOS: DrillScenario[] = [
  {
    name: 'Bus Crash — Route 7 Drill',
    location: 'Highway 7 / Oak Street Intersection',
    description: 'Multi-vehicle bus collision with simulated passengers.',
  },
  {
    name: 'Tornado Shelter Collapse Drill',
    location: 'Riverside Community Center',
    description: 'Partial roof collapse of occupied storm shelter.',
  },
  {
    name: 'School Evacuation Drill',
    location: 'Lincoln Elementary School',
    description: 'Full-building evacuation with simulated role-players.',
  },
];

export function totalCountsFromZones(zones: Zone[]): TriageCounts {
  return zones.reduce(
    (acc, z) => ({
      red: acc.red + z.redCount,
      yellow: acc.yellow + z.yellowCount,
      green: acc.green + z.greenCount,
      black: acc.black + z.blackCount,
    }),
    { red: 0, yellow: 0, green: 0, black: 0 },
  );
}
