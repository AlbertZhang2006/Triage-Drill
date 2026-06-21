import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Incident, TriageCounts } from '../types';
import { CATEGORIES, TRIAGE_META, totalCountsFromZones } from '../types';
import { useElapsed } from '../hooks';
import SessionBadge from '../components/SessionBadge';
import ZoneManager from '../components/ZoneManager';
import { ZoneDistributionChart } from '../components/Charts';
import styles from './CommandDashboard.module.css';

interface Alert {
  level: 'warning' | 'info';
  message: string;
}

function deriveAlerts(incident: Incident, counts: TriageCounts): Alert[] {
  const alerts: Alert[] = [];
  const total = counts.red + counts.yellow + counts.green + counts.black;

  if (total === 0) {
    alerts.push({ level: 'info', message: 'No alerts currently. Waiting for triage counts.' });
    return alerts;
  }

  const redTreatment = incident.treatmentAreas.red;
  if (counts.red > 0 && redTreatment.transported < Math.floor(counts.red / 2)) {
    alerts.push({ level: 'warning', message: 'Immediate area needs transport attention.' });
  }

  const yellowTreatment = incident.treatmentAreas.yellow;
  if (counts.yellow >= 8 || yellowTreatment.awaitingTransport >= 5) {
    alerts.push({ level: 'warning', message: 'Delayed treatment area may become crowded.' });
  }

  if (counts.green >= 15) {
    alerts.push({ level: 'info', message: 'Assign supervisor to Minor area.' });
  }

  const pendingTransports = incident.transports.filter((t) => t.departedAt === null).length;
  if (pendingTransports >= 3) {
    alerts.push({ level: 'warning', message: `${pendingTransports} transports awaiting departure.` });
  }

  if (counts.black > 0 && incident.zones.some((z) => z.blackCount > 0)) {
    alerts.push({ level: 'info', message: `${counts.black} expectant across scene.` });
  }

  if (alerts.length === 0) {
    alerts.push({ level: 'info', message: 'No alerts currently.' });
  }

  return alerts;
}

export default function CommandDashboard() {
  const navigate = useNavigate();
  const incident = useStore((s) => s.incident);
  const completeIncident = useStore((s) => s.completeIncident);
  const reopenIncident = useStore((s) => s.reopenIncident);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [showZoneManager, setShowZoneManager] = useState(false);

  const counts = totalCountsFromZones(incident.zones);
  const total = counts.red + counts.yellow + counts.green + counts.black;
  const elapsed = useElapsed(incident.startedAt);
  const alerts = deriveAlerts(incident, counts);

  const recentLog = incident.activityLog.slice(-10).reverse();

  function handleEndDrill() {
    if (!confirmEnd) {
      setConfirmEnd(true);
      return;
    }
    completeIncident();
    setConfirmEnd(false);
  }

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

      <div className={styles.content}>
        {/* ── Totals strip ── */}
        <div className={styles.totalsStrip}>
          <div className={styles.totalMain}>
            <span className={styles.totalValue}>{total}</span>
            <span className={styles.totalLabel}>Total Patients</span>
          </div>
          <div className={styles.catCounts}>
            {CATEGORIES.map((cat) => {
              const meta = TRIAGE_META[cat];
              return (
                <div key={cat} className={styles.catCount}>
                  <span className={styles.catDot} style={{ background: meta.color }} />
                  <span className={styles.catValue} style={{ color: meta.color }}>
                    {counts[cat]}
                  </span>
                  <span className={styles.catLabel}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Zone summary ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Zone Summary
            <span className={styles.sectionCount}>{incident.zones.length}</span>
            <button
              className={styles.manageLink}
              onClick={() => setShowZoneManager(!showZoneManager)}
            >
              {showZoneManager ? 'Close' : 'Manage'}
            </button>
          </h2>
          {showZoneManager && (
            <div className={styles.zoneManagerWrap}>
              <ZoneManager onClose={() => setShowZoneManager(false)} />
            </div>
          )}
          {incident.zones.length === 0 ? (
            <p className={styles.empty}>No triage zones established yet.</p>
          ) : (
            <ZoneDistributionChart
              zones={incident.zones.map((z) => ({
                name: z.name,
                red: z.redCount,
                yellow: z.yellowCount,
                green: z.greenCount,
                black: z.blackCount,
              }))}
            />
          )}
        </section>

        {/* ── Alerts ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Alerts</h2>
          <div className={styles.alertList}>
            {alerts.map((alert, i) => (
              <div
                key={i}
                className={`${styles.alertItem} ${alert.level === 'warning' ? styles.alertWarning : styles.alertInfo}`}
              >
                <span className={styles.alertIcon}>
                  {alert.level === 'warning' ? '!' : '—'}
                </span>
                <span className={styles.alertMsg}>{alert.message}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── Recent activity ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Activity Log
            <span className={styles.sectionCount}>{incident.activityLog.length}</span>
          </h2>
          {recentLog.length === 0 ? (
            <p className={styles.empty}>No activity logged yet.</p>
          ) : (
            <div className={styles.timeline}>
              {recentLog.map((entry) => (
                <div key={entry.id} className={styles.timelineItem}>
                  <span
                    className={styles.timelineDot}
                    style={{
                      background: entry.category
                        ? TRIAGE_META[entry.category].color
                        : 'var(--color-text-secondary)',
                    }}
                  />
                  <span className={styles.timelineNote}>{entry.note}</span>
                  <span className={styles.timelineTime}>
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
        </section>

        {/* ── End / reopen drill ── */}
        <section className={styles.endSection}>
          {incident.status === 'active' ? (
            confirmEnd ? (
              <div className={styles.confirmBar}>
                <span className={styles.confirmText}>Complete this drill?</span>
                <button className={styles.confirmYes} onClick={handleEndDrill}>
                  Confirm
                </button>
                <button
                  className={styles.confirmNo}
                  onClick={() => setConfirmEnd(false)}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button className={styles.endBtn} onClick={handleEndDrill}>
                Complete Drill
              </button>
            )
          ) : (
            <button className={styles.reopenBtn} onClick={reopenIncident}>
              Reopen Incident
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
