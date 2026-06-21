import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { TriageCategory } from '../types';
import { TRIAGE_META, CATEGORIES } from '../types';
import { useElapsed } from '../hooks';
import SessionBadge from '../components/SessionBadge';
import CompletedBanner from '../components/CompletedBanner';
import styles from './TreatmentAreas.module.css';

export default function TreatmentAreas() {
  const navigate = useNavigate();
  const incident = useStore((s) => s.incident);
  const updateTreatmentArea = useStore((s) => s.updateTreatmentArea);

  const [selected, setSelected] = useState<TriageCategory>('red');
  const [toast, setToast] = useState<string | null>(null);

  const elapsed = useElapsed(incident.startedAt);
  const isCompleted = incident.status === 'completed';
  const area = incident.treatmentAreas[selected];
  const meta = TRIAGE_META[selected];

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  function handleReceived() {
    updateTreatmentArea(selected, 'received', 1);
    showToast(`+1 received in ${meta.label} area`);
  }

  function handleAwaitingTransport() {
    updateTreatmentArea(selected, 'awaitingTransport', 1);
    showToast(`+1 awaiting transport in ${meta.label} area`);
  }

  function handleTransported() {
    updateTreatmentArea(selected, 'transported', 1);
    if (area.awaitingTransport > 0) {
      updateTreatmentArea(selected, 'awaitingTransport', -1);
    }
    showToast(`+1 transported from ${meta.label} area`);
  }

  function handleUpgrade() {
    updateTreatmentArea(selected, 'upgraded', 1);
    showToast(`+1 upgraded in ${meta.label} area`);
  }

  function handleDowngrade() {
    updateTreatmentArea(selected, 'downgraded', 1);
    showToast(`+1 downgraded in ${meta.label} area`);
  }

  const recentEntries = incident.activityLog
    .filter((e) => e.actionType === 'treatment_update')
    .slice(-8)
    .reverse();

  const stats: { label: string; value: number }[] = [
    { label: 'Received', value: area.received },
    { label: 'Awaiting Transport', value: area.awaitingTransport },
    { label: 'Transported', value: area.transported },
    { label: 'Upgraded', value: area.upgraded },
    { label: 'Downgraded', value: area.downgraded },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
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
        {/* Area selector */}
        <div className={styles.areaSelector}>
          {CATEGORIES.map((cat) => {
            const m = TRIAGE_META[cat];
            return (
              <button
                key={cat}
                className={`${styles.areaTab} ${selected === cat ? styles.areaTabActive : ''}`}
                style={
                  selected === cat
                    ? { borderColor: m.color, color: m.color, background: m.bg }
                    : undefined
                }
                onClick={() => setSelected(cat)}
              >
                <span
                  className={styles.areaTabDot}
                  style={{ background: m.color }}
                />
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Stats card */}
        <div
          className={styles.statsCard}
          style={{ borderTopColor: meta.color }}
        >
          <div className={styles.statsTitle}>
            <span className={styles.dot} style={{ background: meta.color }} />
            {meta.label} Area
          </div>
          <div className={styles.statsGrid}>
            {stats.map(({ label, value }) => (
              <div key={label} className={styles.statItem}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className={styles.actions}>
          <button className={styles.actionPrimary} onClick={handleReceived} disabled={isCompleted}>
            + Received Patient
          </button>
          <div className={styles.actionRow}>
            <button className={styles.actionBtn} onClick={handleAwaitingTransport} disabled={isCompleted}>
              Mark Awaiting Transport
            </button>
            <button className={styles.actionBtn} onClick={handleTransported} disabled={isCompleted}>
              Mark Transported
            </button>
          </div>
          <div className={styles.actionRow}>
            <button className={styles.actionBtn} onClick={handleUpgrade} disabled={isCompleted}>
              Upgrade Patient
            </button>
            <button className={styles.actionBtn} onClick={handleDowngrade} disabled={isCompleted}>
              Downgrade Patient
            </button>
          </div>
        </div>

        {/* Recent activity */}
        <div className={styles.activitySection}>
          <h2 className={styles.sectionTitle}>Treatment Area Log</h2>
          {recentEntries.length === 0 ? (
            <p className={styles.emptyActivity}>No treatment area activity yet.</p>
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
      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
