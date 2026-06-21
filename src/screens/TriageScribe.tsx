import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { TriageCategory } from '../types';
import { TRIAGE_META, CATEGORIES } from '../types';
import { useElapsed } from '../hooks';
import SessionBadge from '../components/SessionBadge';
import ZoneManager from '../components/ZoneManager';
import CompletedBanner from '../components/CompletedBanner';
import styles from './TriageScribe.module.css';

export default function TriageScribe() {
  const navigate = useNavigate();
  const incident = useStore((s) => s.incident);
  const zones = incident.zones;
  const activityLog = incident.activityLog;
  const updateZoneCount = useStore((s) => s.updateZoneCount);
  const addLogEntry = useStore((s) => s.addLogEntry);

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [showZoneManager, setShowZoneManager] = useState(false);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const elapsed = useElapsed(incident.startedAt);
  const isCompleted = incident.status === 'completed';

  const activeZone = zones.find((z) => z.id === selectedZoneId) ?? zones[0] ?? null;

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  function zoneCount(cat: TriageCategory): number {
    if (!activeZone) return 0;
    return activeZone[`${cat}Count` as keyof typeof activeZone] as number;
  }

  function handleIncrement(cat: TriageCategory) {
    if (!activeZone) return;
    updateZoneCount(activeZone.id, cat, 1);
    showToast(`+1 ${TRIAGE_META[cat].label} recorded`);
  }

  function handleDecrement(cat: TriageCategory) {
    if (!activeZone || zoneCount(cat) === 0) return;
    updateZoneCount(activeZone.id, cat, -1);
    showToast(`-1 ${TRIAGE_META[cat].label} recorded`);
  }

  function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteText.trim()) return;
    addLogEntry('note', null, activeZone?.name ?? null, noteText.trim());
    setNoteText('');
    setShowNoteInput(false);
    showToast('Note added');
  }

  const recentEntries = activityLog
    .filter((e) => e.actorRole === 'scribe' || e.actionType === 'note')
    .slice(-8)
    .reverse();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/roles')}>
          Back
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.incidentName}>{incident.name}</span>
          <span className={styles.elapsed}>{elapsed} min elapsed</span>
        </div>
        <SessionBadge />
      </header>

      {isCompleted && <CompletedBanner />}

      <div className={styles.content}>
        {/* Zone selector */}
        <div className={styles.zoneBar}>
          <div className={styles.zoneBarHeader}>
            <span className={styles.zoneLabel}>Zone</span>
            <button
              className={styles.manageBtn}
              onClick={() => setShowZoneManager(!showZoneManager)}
            >
              {showZoneManager ? 'Close' : 'Manage'}
            </button>
          </div>
          <div className={styles.zoneTabs}>
            {zones.map((z) => (
              <button
                key={z.id}
                className={`${styles.zoneTab} ${activeZone?.id === z.id ? styles.zoneTabActive : ''}`}
                onClick={() => setSelectedZoneId(z.id)}
              >
                {z.name}
              </button>
            ))}
          </div>
          {showZoneManager && (
            <div className={styles.zoneManagerWrap}>
              <ZoneManager onClose={() => setShowZoneManager(false)} />
            </div>
          )}
        </div>

        {/* Count rows */}
        {!activeZone ? (
          <div className={styles.emptyState}>
            No patients recorded yet. Add a triage zone to begin.
          </div>
        ) : (
          <div className={styles.countRows}>
            {CATEGORIES.map((cat) => {
              const meta = TRIAGE_META[cat];
              const count = zoneCount(cat);
              return (
                <div key={cat} className={styles.countRow}>
                  <div className={styles.rowLeft}>
                    <span
                      className={styles.colorBar}
                      style={{ background: meta.color }}
                    />
                    <div className={styles.rowLabel}>
                      <span className={styles.catName}>{meta.label}</span>
                    </div>
                  </div>
                  <span className={styles.rowCount} style={{ color: meta.color }}>
                    {count}
                  </span>
                  <div className={styles.rowActions}>
                    <button
                      className={styles.undoBtn}
                      onClick={() => handleDecrement(cat)}
                      disabled={count === 0 || isCompleted}
                      aria-label={`Subtract 1 ${meta.label}`}
                    >
                      -1
                    </button>
                    <button
                      className={styles.addBtn}
                      style={{ background: isCompleted ? 'var(--color-border)' : meta.color }}
                      onClick={() => handleIncrement(cat)}
                      disabled={isCompleted}
                      aria-label={`Add 1 ${meta.label}`}
                    >
                      +1
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Note */}
        {activeZone && !isCompleted && (
          <div className={styles.noteSection}>
            {showNoteInput ? (
              <form className={styles.noteForm} onSubmit={handleAddNote}>
                <input
                  className={styles.noteInput}
                  placeholder="Type a note..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  autoFocus
                />
                <button type="submit" className={styles.noteSubmit}>
                  Save
                </button>
                <button
                  type="button"
                  className={styles.noteCancel}
                  onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                className={styles.addNoteBtn}
                onClick={() => setShowNoteInput(true)}
              >
                + Add Note
              </button>
            )}
          </div>
        )}

        {/* Recent Activity */}
        <div className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>Activity Log</h2>
          {recentEntries.length === 0 ? (
            <p className={styles.emptyActivity}>No patients recorded yet.</p>
          ) : (
            <div className={styles.activityList}>
              {recentEntries.map((entry) => (
                <div key={entry.id} className={styles.activityItem}>
                  <span
                    className={styles.activityDot}
                    style={{
                      background: entry.category
                        ? TRIAGE_META[entry.category].color
                        : 'var(--color-text-secondary)',
                    }}
                  />
                  <span className={styles.activityNote}>{entry.note}</span>
                  <span className={styles.activityTime}>
                    {new Date(entry.timestamp).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={styles.toast}>{toast}</div>
      )}
    </div>
  );
}
