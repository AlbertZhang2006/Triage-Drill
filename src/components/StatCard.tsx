import type { TriageCategory } from '../types';
import { TRIAGE_META } from '../types';
import styles from './StatCard.module.css';

interface Props {
  category: TriageCategory;
  count: number;
  onClick?: () => void;
}

export default function StatCard({ category, count, onClick }: Props) {
  const meta = TRIAGE_META[category];

  return (
    <button
      className={styles.card}
      style={{ borderLeftColor: meta.color, '--accent': meta.color, '--accent-bg': meta.bg } as React.CSSProperties}
      onClick={onClick}
    >
      <div className={styles.count}>{count}</div>
      <div className={styles.label}>{meta.label}</div>
      <div className={styles.category} style={{ color: meta.color }}>
        {category.toUpperCase()}
      </div>
    </button>
  );
}
