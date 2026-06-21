import type { TriageCategory, TriageCounts, TreatmentAreas } from '../types';
import { CATEGORIES, TRIAGE_META } from '../types';
import styles from './Charts.module.css';

interface DonutProps {
  counts: TriageCounts;
  size?: number;
}

export function TriageDonut({ counts, size = 120 }: DonutProps) {
  const total = counts.red + counts.yellow + counts.green + counts.black;
  if (total === 0) return null;

  const r = size / 2 - 8;
  const cx = size / 2;
  const cy = size / 2;
  const strokeWidth = size * 0.18;
  const circumference = 2 * Math.PI * r;
  let offset = 0;

  const segments = CATEGORIES
    .filter((cat) => counts[cat] > 0)
    .map((cat) => {
      const pct = counts[cat] / total;
      const dash = pct * circumference;
      const gap = circumference - dash;
      const seg = { cat, dash, gap, offset, color: TRIAGE_META[cat].color, pct };
      offset += dash;
      return seg;
    });

  return (
    <div className={styles.donutWrap}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {segments.map((seg) => (
          <circle
            key={seg.cat}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.donutTotal}
        >
          {total}
        </text>
        <text
          x={cx}
          y={cy + 14}
          textAnchor="middle"
          dominantBaseline="central"
          className={styles.donutLabel}
        >
          patients
        </text>
      </svg>
    </div>
  );
}

interface FlowProps {
  treatmentAreas: TreatmentAreas;
}

export function TreatmentFlowChart({ treatmentAreas }: FlowProps) {
  const cats = CATEGORIES.filter(
    (cat) => treatmentAreas[cat].received > 0 || treatmentAreas[cat].transported > 0,
  );
  if (cats.length === 0) return null;

  const maxVal = Math.max(
    ...cats.map((cat) => {
      const a = treatmentAreas[cat];
      return a.received + a.transported + a.awaitingTransport;
    }),
    1,
  );

  return (
    <div className={styles.flowChart}>
      {cats.map((cat) => {
        const area = treatmentAreas[cat];
        const total = area.received + area.transported + area.awaitingTransport;
        return (
          <div key={cat} className={styles.flowRow}>
            <span className={styles.flowLabel}>
              <span className={styles.flowDot} style={{ background: TRIAGE_META[cat].color }} />
              {TRIAGE_META[cat].label}
            </span>
            <div className={styles.flowBarTrack}>
              {area.transported > 0 && (
                <div
                  className={styles.flowBarSeg}
                  style={{
                    width: `${(area.transported / maxVal) * 100}%`,
                    background: TRIAGE_META[cat].color,
                    opacity: 0.9,
                  }}
                />
              )}
              {area.awaitingTransport > 0 && (
                <div
                  className={styles.flowBarSeg}
                  style={{
                    width: `${(area.awaitingTransport / maxVal) * 100}%`,
                    background: TRIAGE_META[cat].color,
                    opacity: 0.35,
                  }}
                />
              )}
            </div>
            <span className={styles.flowValue}>{total}</span>
          </div>
        );
      })}
      <div className={styles.flowLegend}>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: '#374151', opacity: 0.9 }} />
          Transported
        </span>
        <span className={styles.legendItem}>
          <span className={styles.legendSwatch} style={{ background: '#374151', opacity: 0.35 }} />
          Awaiting
        </span>
      </div>
    </div>
  );
}

interface ZoneBarProps {
  zones: { name: string; red: number; yellow: number; green: number; black: number }[];
}

export function ZoneDistributionChart({ zones }: ZoneBarProps) {
  if (zones.length === 0) return null;

  return (
    <div className={styles.flowChart}>
      {zones.map((zone) => {
        const total = zone.red + zone.yellow + zone.green + zone.black;
        if (total === 0) return null;
        return (
          <div key={zone.name} className={styles.flowRow}>
            <span className={styles.flowLabel} style={{ minWidth: 90 }}>
              {zone.name}
            </span>
            <div className={styles.flowBarTrack}>
              {(
                [
                  ['red', zone.red],
                  ['yellow', zone.yellow],
                  ['green', zone.green],
                  ['black', zone.black],
                ] as [TriageCategory, number][]
              ).map(
                ([cat, count]) =>
                  count > 0 && (
                    <div
                      key={cat}
                      className={styles.flowBarSeg}
                      style={{
                        width: `${(count / total) * 100}%`,
                        background: TRIAGE_META[cat].color,
                      }}
                    >
                      <span className={styles.segLabel}>{count}</span>
                    </div>
                  ),
              )}
            </div>
            <span className={styles.flowValue}>{total}</span>
          </div>
        );
      })}
    </div>
  );
}
