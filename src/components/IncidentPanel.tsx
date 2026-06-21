import { useState } from 'react';
import { useStore } from '../store';
import { createSeedIncident } from '../seed';
import { totalCountsFromZones, DRILL_SCENARIOS } from '../types';
import { useElapsed } from '../hooks';
import styles from './IncidentPanel.module.css';

type View = 'status' | 'new' | 'scenarios';

export default function IncidentPanel() {
  const incident = useStore((s) => s.incident);
  const startNewIncident = useStore((s) => s.startNewIncident);
  const completeIncident = useStore((s) => s.completeIncident);
  const reopenIncident = useStore((s) => s.reopenIncident);
  const resetIncident = useStore((s) => s.resetIncident);
  const loadIncident = useStore((s) => s.loadIncident);

  const [view, setView] = useState<View>('status');
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmComplete, setConfirmComplete] = useState(false);

  const counts = totalCountsFromZones(incident.zones);
  const total = counts.red + counts.yellow + counts.green + counts.black;
  const elapsed = useElapsed(incident.startedAt);

  function handleStartNew(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    startNewIncident(newName.trim(), newLocation.trim() || undefined);
    setNewName('');
    setNewLocation('');
    setView('status');
  }

  function handleLoadScenario(scenarioName: string) {
    loadIncident(createSeedIncident(scenarioName));
    setView('status');
  }

  function handleReset() {
    resetIncident();
    setConfirmReset(false);
  }

  function handleComplete() {
    completeIncident();
    setConfirmComplete(false);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Incident</span>
        <span className={`${styles.statusBadge} ${incident.status === 'active' ? styles.statusActive : styles.statusCompleted}`}>
          {incident.status === 'active' ? 'Active' : 'Completed'}
        </span>
      </div>

      {view === 'status' && (
        <div className={styles.statusView}>
          <div className={styles.incidentInfo}>
            <span className={styles.incidentName}>{incident.name}</span>
            {incident.location && (
              <span className={styles.incidentLocation}>{incident.location}</span>
            )}
            <span className={styles.incidentMeta}>
              {elapsed} min elapsed · {total} patients · {incident.zones.length} zones
            </span>
          </div>

          <div className={styles.actions}>
            {incident.status === 'active' ? (
              confirmComplete ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>Complete this incident?</span>
                  <button className={styles.confirmYes} onClick={handleComplete}>Complete</button>
                  <button className={styles.confirmCancel} onClick={() => setConfirmComplete(false)}>Cancel</button>
                </div>
              ) : (
                <button className={styles.actionBtn} onClick={() => setConfirmComplete(true)}>
                  Complete Incident
                </button>
              )
            ) : (
              <button className={styles.actionBtn} onClick={reopenIncident}>
                Reopen Incident
              </button>
            )}

            <button className={styles.actionBtn} onClick={() => setView('new')}>
              Start New Incident
            </button>

            <button className={styles.actionBtnSecondary} onClick={() => setView('scenarios')}>
              Load Drill Scenario
            </button>

            {confirmReset ? (
              <div className={styles.confirmRow}>
                <span className={styles.confirmText}>Reset all data?</span>
                <button className={styles.confirmDanger} onClick={handleReset}>Reset</button>
                <button className={styles.confirmCancel} onClick={() => setConfirmReset(false)}>Cancel</button>
              </div>
            ) : (
              <button className={styles.actionBtnDanger} onClick={() => setConfirmReset(true)}>
                Reset Current Incident
              </button>
            )}
          </div>
        </div>
      )}

      {view === 'new' && (
        <form className={styles.newForm} onSubmit={handleStartNew}>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Incident Name</label>
            <input
              className={styles.formInput}
              placeholder="e.g. Station 5 MCI Drill"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
          </div>
          <div className={styles.formRow}>
            <label className={styles.formLabel}>Location (optional)</label>
            <input
              className={styles.formInput}
              placeholder="e.g. Main St / 5th Ave"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />
          </div>
          <div className={styles.formActions}>
            <button
              type="submit"
              className={styles.startBtn}
              disabled={!newName.trim()}
            >
              Start Incident
            </button>
            <button
              type="button"
              className={styles.cancelBtn}
              onClick={() => { setView('status'); setNewName(''); setNewLocation(''); }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {view === 'scenarios' && (
        <div className={styles.scenarioView}>
          <div className={styles.scenarioHeader}>Load a Drill Scenario</div>
          <div className={styles.scenarioList}>
            {DRILL_SCENARIOS.map((s) => (
              <button
                key={s.name}
                className={styles.scenarioCard}
                onClick={() => handleLoadScenario(s.name)}
              >
                <span className={styles.scenarioName}>{s.name}</span>
                <span className={styles.scenarioLocation}>{s.location}</span>
                <span className={styles.scenarioDesc}>{s.description}</span>
              </button>
            ))}
          </div>
          <button
            className={styles.cancelBtn}
            onClick={() => setView('status')}
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
