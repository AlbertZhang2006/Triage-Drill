import { v4 as uuid } from 'uuid';
import type { Incident, ActivityLogEntry, TransportRecord, Zone } from './types';
import { emptyTreatmentAreas } from './types';

function minutesAgo(min: number): number {
  return Date.now() - min * 60_000;
}

function logEntry(
  minAgo: number,
  overrides: Partial<ActivityLogEntry>,
): ActivityLogEntry {
  return {
    id: uuid(),
    timestamp: minutesAgo(minAgo),
    actorRole: 'command',
    actionType: 'triage_count',
    category: null,
    zoneOrArea: null,
    note: '',
    ...overrides,
  };
}

function createBusCrashDrill(): Incident {
  const impactId = uuid();
  const roadwayId = uuid();
  const sidewalkId = uuid();

  const zones: Zone[] = [
    { id: impactId, name: 'Impact Zone', redCount: 4, yellowCount: 6, greenCount: 12, blackCount: 1 },
    { id: roadwayId, name: 'Roadway', redCount: 3, yellowCount: 4, greenCount: 8, blackCount: 0 },
    { id: sidewalkId, name: 'Sidewalk Staging', redCount: 2, yellowCount: 3, greenCount: 5, blackCount: 1 },
  ];

  const treatmentAreas = emptyTreatmentAreas();
  treatmentAreas.red = { received: 7, awaitingTransport: 3, transported: 4, upgraded: 0, downgraded: 1 };
  treatmentAreas.yellow = { received: 9, awaitingTransport: 5, transported: 3, upgraded: 2, downgraded: 0 };
  treatmentAreas.green = { received: 18, awaitingTransport: 12, transported: 4, upgraded: 0, downgraded: 2 };
  treatmentAreas.black = { received: 2, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 };

  const transports: TransportRecord[] = [
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'Memorial Hospital', unitName: 'M-42', loadedAt: minutesAgo(28), departedAt: minutesAgo(25) },
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'County Medical Center', unitName: 'M-17', loadedAt: minutesAgo(22), departedAt: minutesAgo(19) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'Memorial Hospital', unitName: 'A-08', loadedAt: minutesAgo(18), departedAt: minutesAgo(15) },
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'St. Francis Trauma', unitName: 'M-23', loadedAt: minutesAgo(12), departedAt: minutesAgo(8) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'County Medical Center', unitName: 'A-11', loadedAt: minutesAgo(7), departedAt: null },
    { id: uuid(), category: 'green', fromArea: 'green', destination: 'Eastside Urgent Care', unitName: 'B-03', loadedAt: minutesAgo(4), departedAt: null },
  ];

  const activityLog: ActivityLogEntry[] = [
    logEntry(45, { actorRole: 'command', actionType: 'incident_started', note: 'Drill "Bus Crash — Route 7" initiated by Incident Command' }),
    logEntry(44, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Impact Zone', note: 'Zone "Impact Zone" established' }),
    logEntry(43, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Roadway', note: 'Zone "Roadway" established' }),
    logEntry(42, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Sidewalk Staging', note: 'Zone "Sidewalk Staging" established' }),
    logEntry(40, { actorRole: 'scribe', actionType: 'triage_count', category: 'red', zoneOrArea: 'Impact Zone', note: '+2 Immediate in Impact Zone' }),
    logEntry(38, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Impact Zone', note: '+5 Minor in Impact Zone' }),
    logEntry(35, { actorRole: 'scribe', actionType: 'triage_count', category: 'yellow', zoneOrArea: 'Roadway', note: '+3 Delayed in Roadway' }),
    logEntry(32, { actorRole: 'scribe', actionType: 'triage_count', category: 'red', zoneOrArea: 'Roadway', note: '+2 Immediate in Roadway' }),
    logEntry(30, { actorRole: 'treatment', actionType: 'treatment_update', category: 'red', zoneOrArea: 'Immediate treatment', note: 'received +4 in Immediate treatment area' }),
    logEntry(28, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'Memorial Hospital', note: 'M-42 loaded from Immediate area to Memorial Hospital' }),
    logEntry(25, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'Memorial Hospital', note: 'M-42 departed to Memorial Hospital' }),
    logEntry(22, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'County Medical Center', note: 'M-17 loaded from Immediate area to County Medical Center' }),
    logEntry(19, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'County Medical Center', note: 'M-17 departed to County Medical Center' }),
    logEntry(15, { actorRole: 'scribe', actionType: 'triage_count', category: 'black', zoneOrArea: 'Impact Zone', note: '+1 Expectant in Impact Zone' }),
    logEntry(12, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'St. Francis Trauma', note: 'M-23 loaded from Immediate area to St. Francis Trauma' }),
    logEntry(8, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'St. Francis Trauma', note: 'M-23 departed to St. Francis Trauma' }),
    logEntry(7, { actorRole: 'transport', actionType: 'transport_loaded', category: 'yellow', zoneOrArea: 'County Medical Center', note: 'A-11 loaded from Delayed area to County Medical Center' }),
    logEntry(4, { actorRole: 'transport', actionType: 'transport_loaded', category: 'green', zoneOrArea: 'Eastside Urgent Care', note: 'B-03 loaded from Minor area to Eastside Urgent Care' }),
    logEntry(2, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Sidewalk Staging', note: '+3 Minor in Sidewalk Staging' }),
  ];

  return {
    id: uuid(),
    name: 'Bus Crash — Route 7 Drill',
    location: 'Highway 7 / Oak Street Intersection',
    startedAt: minutesAgo(45),
    completedAt: null,
    status: 'active',
    zones,
    treatmentAreas,
    transports,
    activityLog,
  };
}

function createTornadoDrill(): Incident {
  const shelterId = uuid();
  const parkingId = uuid();
  const fieldId = uuid();

  const zones: Zone[] = [
    { id: shelterId, name: 'Main Shelter', redCount: 5, yellowCount: 8, greenCount: 10, blackCount: 2 },
    { id: parkingId, name: 'Parking Structure', redCount: 2, yellowCount: 3, greenCount: 6, blackCount: 0 },
    { id: fieldId, name: 'Field Staging', redCount: 1, yellowCount: 2, greenCount: 14, blackCount: 0 },
  ];

  const treatmentAreas = emptyTreatmentAreas();
  treatmentAreas.red = { received: 6, awaitingTransport: 4, transported: 2, upgraded: 0, downgraded: 0 };
  treatmentAreas.yellow = { received: 10, awaitingTransport: 6, transported: 3, upgraded: 1, downgraded: 1 };
  treatmentAreas.green = { received: 22, awaitingTransport: 8, transported: 6, upgraded: 0, downgraded: 3 };
  treatmentAreas.black = { received: 2, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 };

  const transports: TransportRecord[] = [
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'Riverside General', unitName: 'R-12', loadedAt: minutesAgo(30), departedAt: minutesAgo(27) },
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'Valley Trauma Center', unitName: 'R-05', loadedAt: minutesAgo(24), departedAt: minutesAgo(20) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'Riverside General', unitName: 'A-14', loadedAt: minutesAgo(16), departedAt: minutesAgo(12) },
    { id: uuid(), category: 'green', fromArea: 'green', destination: 'Westpark Urgent Care', unitName: 'B-07', loadedAt: minutesAgo(10), departedAt: minutesAgo(6) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'Valley Trauma Center', unitName: 'A-19', loadedAt: minutesAgo(5), departedAt: null },
    { id: uuid(), category: 'green', fromArea: 'green', destination: 'Westpark Urgent Care', unitName: 'B-11', loadedAt: minutesAgo(3), departedAt: null },
  ];

  const activityLog: ActivityLogEntry[] = [
    logEntry(50, { actorRole: 'command', actionType: 'incident_started', note: 'Drill "Tornado Shelter Collapse" initiated by Incident Command' }),
    logEntry(49, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Main Shelter', note: 'Zone "Main Shelter" established' }),
    logEntry(48, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Parking Structure', note: 'Zone "Parking Structure" established' }),
    logEntry(47, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Field Staging', note: 'Zone "Field Staging" established' }),
    logEntry(45, { actorRole: 'scribe', actionType: 'triage_count', category: 'red', zoneOrArea: 'Main Shelter', note: '+3 Immediate in Main Shelter' }),
    logEntry(42, { actorRole: 'scribe', actionType: 'triage_count', category: 'yellow', zoneOrArea: 'Main Shelter', note: '+5 Delayed in Main Shelter' }),
    logEntry(40, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Field Staging', note: '+8 Minor in Field Staging' }),
    logEntry(38, { actorRole: 'scribe', actionType: 'triage_count', category: 'black', zoneOrArea: 'Main Shelter', note: '+2 Expectant in Main Shelter' }),
    logEntry(35, { actorRole: 'treatment', actionType: 'treatment_update', category: 'red', zoneOrArea: 'Immediate treatment', note: 'received +4 in Immediate treatment area' }),
    logEntry(30, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'Riverside General', note: 'R-12 loaded from Immediate area to Riverside General' }),
    logEntry(27, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'Riverside General', note: 'R-12 departed to Riverside General' }),
    logEntry(24, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'Valley Trauma Center', note: 'R-05 loaded from Immediate area to Valley Trauma Center' }),
    logEntry(20, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'Valley Trauma Center', note: 'R-05 departed to Valley Trauma Center' }),
    logEntry(16, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Parking Structure', note: '+6 Minor in Parking Structure' }),
    logEntry(10, { actorRole: 'transport', actionType: 'transport_loaded', category: 'green', zoneOrArea: 'Westpark Urgent Care', note: 'B-07 loaded from Minor area to Westpark Urgent Care' }),
    logEntry(5, { actorRole: 'transport', actionType: 'transport_loaded', category: 'yellow', zoneOrArea: 'Valley Trauma Center', note: 'A-19 loaded from Delayed area to Valley Trauma Center' }),
    logEntry(3, { actorRole: 'transport', actionType: 'transport_loaded', category: 'green', zoneOrArea: 'Westpark Urgent Care', note: 'B-11 loaded from Minor area to Westpark Urgent Care' }),
  ];

  return {
    id: uuid(),
    name: 'Tornado Shelter Collapse Drill',
    location: 'Riverside Community Center',
    startedAt: minutesAgo(50),
    completedAt: null,
    status: 'active',
    zones,
    treatmentAreas,
    transports,
    activityLog,
  };
}

function createSchoolDrill(): Incident {
  const buildingId = uuid();
  const gymId = uuid();
  const playgroundId = uuid();

  const zones: Zone[] = [
    { id: buildingId, name: 'Main Building', redCount: 2, yellowCount: 5, greenCount: 18, blackCount: 0 },
    { id: gymId, name: 'Gymnasium', redCount: 1, yellowCount: 3, greenCount: 10, blackCount: 0 },
    { id: playgroundId, name: 'Playground Assembly', redCount: 0, yellowCount: 2, greenCount: 22, blackCount: 0 },
  ];

  const treatmentAreas = emptyTreatmentAreas();
  treatmentAreas.red = { received: 3, awaitingTransport: 2, transported: 1, upgraded: 0, downgraded: 0 };
  treatmentAreas.yellow = { received: 7, awaitingTransport: 4, transported: 2, upgraded: 1, downgraded: 0 };
  treatmentAreas.green = { received: 35, awaitingTransport: 15, transported: 10, upgraded: 0, downgraded: 5 };
  treatmentAreas.black = { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 };

  const transports: TransportRecord[] = [
    { id: uuid(), category: 'red', fromArea: 'red', destination: 'Children\'s Medical Center', unitName: 'M-31', loadedAt: minutesAgo(20), departedAt: minutesAgo(17) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'Children\'s Medical Center', unitName: 'A-06', loadedAt: minutesAgo(15), departedAt: minutesAgo(11) },
    { id: uuid(), category: 'green', fromArea: 'green', destination: 'Lincoln Park Clinic', unitName: 'B-09', loadedAt: minutesAgo(10), departedAt: minutesAgo(7) },
    { id: uuid(), category: 'yellow', fromArea: 'yellow', destination: 'Parkview Hospital', unitName: 'A-22', loadedAt: minutesAgo(5), departedAt: null },
    { id: uuid(), category: 'green', fromArea: 'green', destination: 'Lincoln Park Clinic', unitName: 'B-15', loadedAt: minutesAgo(3), departedAt: null },
  ];

  const activityLog: ActivityLogEntry[] = [
    logEntry(35, { actorRole: 'command', actionType: 'incident_started', note: 'Drill "School Evacuation" initiated by Incident Command' }),
    logEntry(34, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Main Building', note: 'Zone "Main Building" established' }),
    logEntry(33, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Gymnasium', note: 'Zone "Gymnasium" established' }),
    logEntry(32, { actorRole: 'command', actionType: 'zone_created', zoneOrArea: 'Playground Assembly', note: 'Zone "Playground Assembly" established' }),
    logEntry(30, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Playground Assembly', note: '+15 Minor in Playground Assembly' }),
    logEntry(28, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Main Building', note: '+10 Minor in Main Building' }),
    logEntry(25, { actorRole: 'scribe', actionType: 'triage_count', category: 'yellow', zoneOrArea: 'Main Building', note: '+3 Delayed in Main Building' }),
    logEntry(22, { actorRole: 'scribe', actionType: 'triage_count', category: 'red', zoneOrArea: 'Main Building', note: '+2 Immediate in Main Building' }),
    logEntry(20, { actorRole: 'treatment', actionType: 'treatment_update', category: 'red', zoneOrArea: 'Immediate treatment', note: 'received +2 in Immediate treatment area' }),
    logEntry(20, { actorRole: 'transport', actionType: 'transport_loaded', category: 'red', zoneOrArea: 'Children\'s Medical Center', note: 'M-31 loaded from Immediate area to Children\'s Medical Center' }),
    logEntry(17, { actorRole: 'transport', actionType: 'transport_departed', category: 'red', zoneOrArea: 'Children\'s Medical Center', note: 'M-31 departed to Children\'s Medical Center' }),
    logEntry(15, { actorRole: 'transport', actionType: 'transport_loaded', category: 'yellow', zoneOrArea: 'Children\'s Medical Center', note: 'A-06 loaded from Delayed area to Children\'s Medical Center' }),
    logEntry(11, { actorRole: 'transport', actionType: 'transport_departed', category: 'yellow', zoneOrArea: 'Children\'s Medical Center', note: 'A-06 departed to Children\'s Medical Center' }),
    logEntry(10, { actorRole: 'scribe', actionType: 'triage_count', category: 'green', zoneOrArea: 'Gymnasium', note: '+8 Minor in Gymnasium' }),
    logEntry(5, { actorRole: 'transport', actionType: 'transport_loaded', category: 'yellow', zoneOrArea: 'Parkview Hospital', note: 'A-22 loaded from Delayed area to Parkview Hospital' }),
    logEntry(3, { actorRole: 'transport', actionType: 'transport_loaded', category: 'green', zoneOrArea: 'Lincoln Park Clinic', note: 'B-15 loaded from Minor area to Lincoln Park Clinic' }),
  ];

  return {
    id: uuid(),
    name: 'School Evacuation Drill',
    location: 'Lincoln Elementary School',
    startedAt: minutesAgo(35),
    completedAt: null,
    status: 'active',
    zones,
    treatmentAreas,
    transports,
    activityLog,
  };
}

const DRILL_BUILDERS: Record<string, () => Incident> = {
  'Bus Crash — Route 7 Drill': createBusCrashDrill,
  'Tornado Shelter Collapse Drill': createTornadoDrill,
  'School Evacuation Drill': createSchoolDrill,
};

export function createSeedIncident(scenarioName?: string): Incident {
  const builder = scenarioName ? DRILL_BUILDERS[scenarioName] : undefined;
  if (builder) return builder();
  return createBusCrashDrill();
}
