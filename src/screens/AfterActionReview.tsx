import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Incident, TriageCategory } from '../types';
import { TRIAGE_META, CATEGORIES, totalCountsFromZones } from '../types';
import { exportJSON, exportCSV } from '../export';
import SessionBadge from '../components/SessionBadge';
import { TreatmentFlowChart } from '../components/Charts';
import styles from './AfterActionReview.module.css';

function fmt(ts: number) {
  return new Date(ts).toLocaleString([], {
    month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function deriveMostActiveZone(incident: Incident): string {
  if (incident.zones.length === 0) return '—';
  let best = incident.zones[0];
  let bestTotal = 0;
  for (const z of incident.zones) {
    const t = z.redCount + z.yellowCount + z.greenCount + z.blackCount;
    if (t > bestTotal) { bestTotal = t; best = z; }
  }
  return bestTotal > 0 ? best.name : '—';
}

function deriveBottleneck(incident: Incident): string {
  let best: TriageCategory | null = null;
  let bestVal = 0;
  for (const cat of CATEGORIES) {
    const val = incident.treatmentAreas[cat].awaitingTransport;
    if (val > bestVal) { bestVal = val; best = cat; }
  }
  return best ? `${TRIAGE_META[best].label} (${bestVal} waiting)` : '—';
}

function deriveEndTime(incident: Incident): number | null {
  if (incident.status !== 'completed') return null;
  const completed = incident.activityLog.findLast(
    (e) => e.actionType === 'incident_completed',
  );
  return completed?.timestamp ?? null;
}


export default function AfterActionReview() {
  const navigate = useNavigate();
  const incident = useStore((s) => s.incident);

  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (incident.status === 'active') {
      const id = setInterval(() => setNow(Date.now()), 30_000);
      return () => clearInterval(id);
    }
  }, [incident.status]);

  const counts = totalCountsFromZones(incident.zones);
  const total = counts.red + counts.yellow + counts.green + counts.black;
  const endTime = deriveEndTime(incident);

  const durationMs = (endTime ?? now) - incident.startedAt;
  const durationMin = Math.floor(durationMs / 60_000);

  const totalTransports = incident.transports.length;
  const redTransported = incident.treatmentAreas.red.transported;
  const yellowTransported = incident.treatmentAreas.yellow.transported;
  const totalUpgrades = CATEGORIES.reduce(
    (sum, cat) => sum + incident.treatmentAreas[cat].upgraded, 0,
  );
  const totalDowngrades = CATEGORIES.reduce(
    (sum, cat) => sum + incident.treatmentAreas[cat].downgraded, 0,
  );

  const mostActiveZone = deriveMostActiveZone(incident);
  const bottleneck = deriveBottleneck(incident);

  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/roles')}>
          Back
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>After-Action Review</span>
        </div>
        <SessionBadge />
      </header>

      <div className={styles.content}>
        {/* Incident summary */}
        <div className={styles.summaryCard}>
          <h2 className={styles.incidentName}>{incident.name}</h2>
          <div className={styles.summaryMeta}>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Started</span>
              <span className={styles.metaValue}>{fmt(incident.startedAt)}</span>
            </div>
            {endTime && (
              <div className={styles.metaRow}>
                <span className={styles.metaLabel}>Ended</span>
                <span className={styles.metaValue}>{fmt(endTime)}</span>
              </div>
            )}
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Duration</span>
              <span className={styles.metaValue}>{durationMin} min</span>
            </div>
            <div className={styles.metaRow}>
              <span className={styles.metaLabel}>Status</span>
              <span className={`${styles.metaValue} ${incident.status === 'active' ? styles.statusActive : styles.statusCompleted}`}>
                {incident.status === 'active' ? 'Active' : 'Completed'}
              </span>
            </div>
          </div>
        </div>

        {/* Triage counts */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Final Triage Counts</h3>
          <div className={styles.countsStrip}>
            <div className={styles.countsTotal}>
              <span className={styles.countsTotalValue}>{total}</span>
              <span className={styles.countsTotalLabel}>Total</span>
            </div>
            {CATEGORIES.map((cat) => {
              const meta = TRIAGE_META[cat];
              return (
                <div key={cat} className={styles.countsItem}>
                  <span className={styles.countsDot} style={{ background: meta.color }} />
                  <span className={styles.countsValue} style={{ color: meta.color }}>
                    {counts[cat]}
                  </span>
                  <span className={styles.countsLabel}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Operational metrics */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Operational Metrics</h3>
          <div className={styles.metricsGrid}>
            <MetricCell label="Total Transports" value={totalTransports} />
            <MetricCell label="Red Transported" value={redTransported} />
            <MetricCell label="Yellow Transported" value={yellowTransported} />
            <MetricCell label="Upgrades" value={totalUpgrades} />
            <MetricCell label="Downgrades" value={totalDowngrades} />
            <MetricCell label="Triage Zones" value={incident.zones.length} />
          </div>
          <div className={styles.derivedMetrics}>
            <div className={styles.derivedRow}>
              <span className={styles.derivedLabel}>Most Active Zone</span>
              <span className={styles.derivedValue}>{mostActiveZone}</span>
            </div>
            <div className={styles.derivedRow}>
              <span className={styles.derivedLabel}>Largest Bottleneck</span>
              <span className={styles.derivedValue}>{bottleneck}</span>
            </div>
          </div>
          <div className={styles.treatmentChartWrap}>
            <h4 className={styles.subTitle}>Treatment Flow</h4>
            <TreatmentFlowChart treatmentAreas={incident.treatmentAreas} />
          </div>
        </section>

        {/* Timeline */}
        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Activity Timeline
            <span className={styles.sectionCount}>{incident.activityLog.length}</span>
          </h3>
          {incident.activityLog.length === 0 ? (
            <p className={styles.empty}>No activity logged yet.</p>
          ) : (
            <div className={styles.timeline}>
              {incident.activityLog.map((entry, i) => {
                const minutesIn = Math.floor(
                  (entry.timestamp - incident.startedAt) / 60_000,
                );
                return (
                  <div key={entry.id} className={styles.timelineItem}>
                    <div className={styles.timelineLeft}>
                      <div
                        className={styles.timelineDot}
                        style={{
                          background: entry.category
                            ? TRIAGE_META[entry.category].color
                            : 'var(--color-text-secondary)',
                        }}
                      />
                      {i < incident.activityLog.length - 1 && (
                        <div className={styles.timelineLine} />
                      )}
                    </div>
                    <div className={styles.timelineContent}>
                      <span className={styles.timelineNote}>{entry.note}</span>
                      <span className={styles.timelineTime}>
                        +{minutesIn} min · {fmtTime(entry.timestamp)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Export */}
        <section className={styles.exportSection}>
          <h3 className={styles.sectionTitle}>Export</h3>
          <div className={styles.exportBtns}>
            <button className={styles.exportBtn} onClick={() => exportJSON(incident)}>
              Export JSON
            </button>
            <button className={styles.exportBtn} onClick={() => exportCSV(incident)}>
              Export CSV
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCell({ label, value }: { label: string; value: number | string }) {
  return (
    <div className={styles.metric}>
      <span className={styles.metricValue}>{value}</span>
      <span className={styles.metricLabel}>{label}</span>
    </div>
  );
}
