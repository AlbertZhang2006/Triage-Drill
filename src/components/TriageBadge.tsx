import type { TriageCategory } from '../types';
import { TRIAGE_META } from '../types';
import styles from './TriageBadge.module.css';

interface Props {
  category: TriageCategory;
  count?: number;
  size?: 'sm' | 'md' | 'lg';
}

export default function TriageBadge({ category, count, size = 'md' }: Props) {
  const meta = TRIAGE_META[category];

  return (
    <div
      className={`${styles.badge} ${styles[size]}`}
      style={{ background: meta.bg, color: meta.color, borderColor: meta.color }}
    >
      <span className={styles.label}>{meta.label}</span>
      {count !== undefined && <span className={styles.count}>{count}</span>}
    </div>
  );
}
