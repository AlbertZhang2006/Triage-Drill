import { describe, it, expect } from 'vitest';
import { buildCSV, buildJSON } from './export';
import type { Incident } from './types';
import { emptyTreatmentAreas } from './types';

function makeIncident(overrides?: Partial<Incident>): Incident {
  return {
    id: 'test-id',
    name: 'Test Drill',
    location: 'Test Location',
    startedAt: 1700000000000,
    completedAt: null,
    status: 'active',
    zones: [
      { id: 'z1', name: 'Zone A', redCount: 2, yellowCount: 1, greenCount: 5, blackCount: 0 },
    ],
    treatmentAreas: emptyTreatmentAreas(),
    transports: [
      {
        id: 't1',
        category: 'red',
        fromArea: 'red',
        destination: 'Hospital A',
        unitName: 'M-01',
        loadedAt: 1700000060000,
        departedAt: 1700000120000,
      },
    ],
    activityLog: [
      {
        id: 'log1',
        timestamp: 1700000000000,
        actorRole: 'command',
        actionType: 'incident_started',
        category: null,
        zoneOrArea: null,
        note: 'Drill started',
      },
      {
        id: 'log2',
        timestamp: 1700000060000,
        actorRole: 'scribe',
        actionType: 'triage_count',
        category: 'red',
        zoneOrArea: 'Zone A',
        note: '+2 Immediate in Zone A',
      },
    ],
    ...overrides,
  };
}

describe('export CSV includes activity log data', () => {
  it('contains header row with expected columns', () => {
    const csv = buildCSV(makeIncident());
    const header = csv.split('\n')[0];
    expect(header).toBe('timestamp,time,actorRole,actionType,category,zoneOrArea,note');
  });

  it('includes all activity log entries as rows', () => {
    const incident = makeIncident();
    const csv = buildCSV(incident);
    const lines = csv.split('\n');
    expect(lines.length).toBe(incident.activityLog.length + 1);
  });

  it('includes activity details in rows', () => {
    const csv = buildCSV(makeIncident());
    expect(csv).toContain('incident_started');
    expect(csv).toContain('triage_count');
    expect(csv).toContain('Drill started');
    expect(csv).toContain('+2 Immediate in Zone A');
    expect(csv).toContain('Zone A');
    expect(csv).toContain('command');
    expect(csv).toContain('scribe');
  });

  it('escapes commas in notes', () => {
    const incident = makeIncident({
      activityLog: [
        {
          id: 'log-comma',
          timestamp: 1700000000000,
          actorRole: 'command',
          actionType: 'note',
          category: null,
          zoneOrArea: null,
          note: 'Note with, comma',
        },
      ],
    });
    const csv = buildCSV(incident);
    expect(csv).toContain('"Note with, comma"');
  });
});

describe('export JSON includes full incident state', () => {
  it('contains all top-level incident fields', () => {
    const incident = makeIncident();
    const json = buildJSON(incident);
    const parsed = JSON.parse(json);

    expect(parsed.id).toBe('test-id');
    expect(parsed.name).toBe('Test Drill');
    expect(parsed.location).toBe('Test Location');
    expect(parsed.startedAt).toBe(1700000000000);
    expect(parsed.status).toBe('active');
  });

  it('includes zones', () => {
    const parsed = JSON.parse(buildJSON(makeIncident()));
    expect(parsed.zones).toHaveLength(1);
    expect(parsed.zones[0].name).toBe('Zone A');
    expect(parsed.zones[0].redCount).toBe(2);
  });

  it('includes treatment areas', () => {
    const parsed = JSON.parse(buildJSON(makeIncident()));
    expect(parsed.treatmentAreas).toBeDefined();
    expect(parsed.treatmentAreas.red).toBeDefined();
    expect(parsed.treatmentAreas.yellow).toBeDefined();
    expect(parsed.treatmentAreas.green).toBeDefined();
    expect(parsed.treatmentAreas.black).toBeDefined();
  });

  it('includes transports', () => {
    const parsed = JSON.parse(buildJSON(makeIncident()));
    expect(parsed.transports).toHaveLength(1);
    expect(parsed.transports[0].unitName).toBe('M-01');
    expect(parsed.transports[0].destination).toBe('Hospital A');
  });

  it('includes activity log', () => {
    const parsed = JSON.parse(buildJSON(makeIncident()));
    expect(parsed.activityLog).toHaveLength(2);
    expect(parsed.activityLog[0].note).toBe('Drill started');
    expect(parsed.activityLog[1].actionType).toBe('triage_count');
  });

  it('round-trips through JSON parse', () => {
    const incident = makeIncident();
    const parsed = JSON.parse(buildJSON(incident));
    expect(parsed).toEqual(incident);
  });
});
