import { describe, it, expect, beforeEach } from 'vitest';
import { useStore } from './store';

function getState() {
  return useStore.getState();
}

beforeEach(() => {
  useStore.setState({
    joinCode: null,
    mode: 'local',
    role: null,
    incident: {
      id: 'test',
      name: 'Test Incident',
      location: '',
      startedAt: Date.now(),
      completedAt: null,
      status: 'active',
      zones: [],
      treatmentAreas: {
        red: { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 },
        yellow: { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 },
        green: { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 },
        black: { received: 0, awaitingTransport: 0, transported: 0, upgraded: 0, downgraded: 0 },
      },
      transports: [],
      activityLog: [],
    },
  });
});

describe('counts cannot go below zero', () => {
  it('updateZoneCount clamps to zero on negative delta', () => {
    getState().addZone('TestZone');
    const zone = getState().incident.zones[0];

    getState().updateZoneCount(zone.id, 'red', -1);
    const updated = getState().incident.zones.find((z) => z.id === zone.id)!;
    expect(updated.redCount).toBe(0);
  });

  it('updateZoneCount clamps to zero on large negative delta', () => {
    getState().addZone('TestZone');
    const zone = getState().incident.zones[0];

    getState().updateZoneCount(zone.id, 'green', 3);
    getState().updateZoneCount(zone.id, 'green', -10);
    const updated = getState().incident.zones.find((z) => z.id === zone.id)!;
    expect(updated.greenCount).toBe(0);
  });

  it('updateTreatmentArea clamps to zero', () => {
    getState().updateTreatmentArea('red', 'received', -5);
    expect(getState().incident.treatmentAreas.red.received).toBe(0);
  });
});

describe('deleted zones must have zero counts', () => {
  it('prevents deletion of zone with patients', () => {
    getState().addZone('NonEmpty');
    const zone = getState().incident.zones[0];
    getState().updateZoneCount(zone.id, 'red', 3);

    getState().deleteZone(zone.id);
    expect(getState().incident.zones).toHaveLength(1);
    expect(getState().incident.zones[0].name).toBe('NonEmpty');
  });

  it('allows deletion of empty zone', () => {
    getState().addZone('EmptyZone');
    const zone = getState().incident.zones[0];

    getState().deleteZone(zone.id);
    expect(getState().incident.zones).toHaveLength(0);
  });
});

describe('completing an incident sets completedAt', () => {
  it('sets completedAt to a timestamp', () => {
    expect(getState().incident.completedAt).toBeNull();
    expect(getState().incident.status).toBe('active');

    getState().completeIncident();

    expect(getState().incident.status).toBe('completed');
    expect(getState().incident.completedAt).toBeTypeOf('number');
    expect(getState().incident.completedAt).toBeGreaterThan(0);
  });

  it('completedAt is cleared on reopen', () => {
    getState().completeIncident();
    expect(getState().incident.completedAt).not.toBeNull();

    getState().reopenIncident();
    expect(getState().incident.completedAt).toBeNull();
    expect(getState().incident.status).toBe('active');
  });
});

describe('session management', () => {
  it('createSession sets joinCode and mode', () => {
    const code = getState().createSession('Test Drill', 'Main St');
    expect(code).toMatch(/^[A-Z]{3}-\d{3}$/);
    expect(getState().joinCode).toBe(code);
    expect(getState().mode).toBe('local');
    expect(getState().incident.name).toBe('Test Drill');
  });

  it('loadDemoSession sets mode to demo', () => {
    getState().loadDemoSession('Bus Crash — Route 7 Drill');
    expect(getState().mode).toBe('demo');
    expect(getState().joinCode).toMatch(/^[A-Z]{3}-\d{3}$/);
    expect(getState().incident.name).toBe('Bus Crash — Route 7 Drill');
  });

  it('leaveSession clears session state', () => {
    getState().createSession('Test Drill');
    expect(getState().joinCode).not.toBeNull();

    getState().leaveSession();
    expect(getState().joinCode).toBeNull();
    expect(getState().role).toBeNull();
  });
});
