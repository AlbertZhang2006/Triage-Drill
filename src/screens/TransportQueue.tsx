import { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { TriageCategory } from '../types';
import { TRIAGE_META, CATEGORIES } from '../types';
import { useElapsed } from '../hooks';
import SessionBadge from '../components/SessionBadge';
import CompletedBanner from '../components/CompletedBanner';
import styles from './TransportQueue.module.css';

function fmt(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function TransportQueue() {
  const navigate = useNavigate();
  const incident = useStore((s) => s.incident);
  const addTransport = useStore((s) => s.addTransport);
  const departTransport = useStore((s) => s.departTransport);
  const updateTreatmentArea = useStore((s) => s.updateTreatmentArea);

  const elapsed = useElapsed(incident.startedAt);
  const isCompleted = incident.status === 'completed';

  const [formCat, setFormCat] = useState<TriageCategory>('red');
  const [formFrom, setFormFrom] = useState<TriageCategory>('red');
  const [formUnit, setFormUnit] = useState('');
  const [formDest, setFormDest] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  }, []);

  function handleMarkLoaded(e: React.FormEvent) {
    e.preventDefault();
    if (!formUnit.trim() || !formDest.trim()) return;

    addTransport(formCat, formFrom, formDest.trim(), formUnit.trim());

    updateTreatmentArea(formFrom, 'transported', 1);
    if (incident.treatmentAreas[formFrom].awaitingTransport > 0) {
      updateTreatmentArea(formFrom, 'awaitingTransport', -1);
    }

    showToast(`${formUnit.trim()} loaded for ${formDest.trim()}`);
    setFormUnit('');
    setFormDest('');
  }

  function handleDepart(id: string, unitName: string) {
    departTransport(id);
    showToast(`${unitName} departed`);
  }

  const pending = incident.transports.filter((t) => t.departedAt === null);
  const departed = incident.transports
    .filter((t) => t.departedAt !== null)
    .slice(-10)
    .reverse();

  const recentDestinations = useMemo(() => {
    const seen = new Set<string>();
    const results: string[] = [];
    for (let i = incident.transports.length - 1; i >= 0 && results.length < 4; i--) {
      const dest = incident.transports[i].destination;
      if (!seen.has(dest)) {
        seen.add(dest);
        results.push(dest);
      }
    }
    return results;
  }, [incident.transports]);

  const priorityCats = CATEGORIES.filter(
    (cat) => cat !== 'black' || incident.treatmentAreas.black.awaitingTransport > 0,
  );

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
        {/* Priority summary */}
        <div className={styles.priorityStrip}>
          <div className={styles.priorityLabel}>Awaiting Transport</div>
          <div className={styles.priorityCounts}>
            {priorityCats.map((cat) => {
              const meta = TRIAGE_META[cat];
              const count = incident.treatmentAreas[cat].awaitingTransport;
              return (
                <div key={cat} className={styles.priorityItem}>
                  <span className={styles.priorityDot} style={{ background: meta.color }} />
                  <span
                    className={styles.priorityValue}
                    style={{ color: count > 0 ? meta.color : 'var(--color-text-secondary)' }}
                  >
                    {count}
                  </span>
                  <span className={styles.priorityCatLabel}>{meta.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Record transport form */}
        {!isCompleted && <form className={styles.form} onSubmit={handleMarkLoaded}>
          <div className={styles.formTitle}>Record Transport</div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>Category</label>
            <div className={styles.catPicker}>
              {CATEGORIES.map((cat) => {
                const m = TRIAGE_META[cat];
                const active = formCat === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.catBtn} ${active ? styles.catBtnActive : ''}`}
                    style={active ? { background: m.bg, color: m.color, borderColor: m.color } : undefined}
                    onClick={() => { setFormCat(cat); setFormFrom(cat); }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.formRow}>
            <label className={styles.formLabel}>
              From Area
              {formFrom !== formCat && <span className={styles.formLabelHint}> (differs from category)</span>}
            </label>
            <div className={styles.catPicker}>
              {CATEGORIES.map((cat) => {
                const m = TRIAGE_META[cat];
                const active = formFrom === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    className={`${styles.catBtn} ${active ? styles.catBtnActive : ''}`}
                    style={active ? { background: m.bg, color: m.color, borderColor: m.color } : undefined}
                    onClick={() => setFormFrom(cat)}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className={styles.formFields}>
            <div className={styles.formFieldWrap}>
              <label className={styles.formLabel}>Unit Name</label>
              <input
                className={styles.input}
                placeholder="e.g. M-42"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
              />
            </div>
            <div className={styles.formFieldWrap}>
              <label className={styles.formLabel}>Destination</label>
              <input
                className={styles.input}
                placeholder="e.g. Memorial Hospital"
                value={formDest}
                onChange={(e) => setFormDest(e.target.value)}
              />
              {recentDestinations.length > 0 && !formDest && (
                <div className={styles.destChips}>
                  {recentDestinations.map((dest) => (
                    <button
                      key={dest}
                      type="button"
                      className={styles.destChip}
                      onClick={() => setFormDest(dest)}
                    >
                      {dest}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className={styles.loadedBtn}
            disabled={!formUnit.trim() || !formDest.trim()}
          >
            Mark Loaded
          </button>
        </form>}

        {/* Loaded / awaiting departure */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Staging — Awaiting Departure
            <span className={styles.sectionCount}>{pending.length}</span>
          </h2>
          {pending.length === 0 ? (
            <p className={styles.empty}>No transports yet.</p>
          ) : (
            <div className={styles.cardList}>
              {pending.map((t) => {
                const meta = TRIAGE_META[t.category];
                return (
                  <div key={t.id} className={styles.card} style={{ borderLeftColor: meta.color }}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardBadge} style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className={styles.cardUnit}>{t.unitName}</span>
                    </div>
                    <div className={styles.cardRoute}>
                      {TRIAGE_META[t.fromArea].label} Area → {t.destination}
                    </div>
                    <div className={styles.cardTime}>Loaded {fmt(t.loadedAt)}</div>
                    <button
                      className={styles.departBtn}
                      onClick={() => handleDepart(t.id, t.unitName)}
                      disabled={isCompleted}
                    >
                      Mark Departed
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Departed */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>
            Departed
            <span className={styles.sectionCount}>
              {incident.transports.filter((t) => t.departedAt !== null).length}
            </span>
          </h2>
          {departed.length === 0 ? (
            <p className={styles.empty}>No transports yet.</p>
          ) : (
            <div className={styles.cardList}>
              {departed.map((t) => {
                const meta = TRIAGE_META[t.category];
                return (
                  <div key={t.id} className={styles.card} style={{ borderLeftColor: meta.color }}>
                    <div className={styles.cardTop}>
                      <span className={styles.cardBadge} style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                      <span className={styles.cardUnit}>{t.unitName}</span>
                    </div>
                    <div className={styles.cardRoute}>
                      {TRIAGE_META[t.fromArea].label} Area → {t.destination}
                    </div>
                    <div className={styles.cardTime}>
                      Loaded {fmt(t.loadedAt)} · Departed {fmt(t.departedAt!)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {toast && <div className={styles.toast}>{toast}</div>}
    </div>
  );
}
