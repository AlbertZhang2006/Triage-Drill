import { useStore } from '../store';
import styles from './SessionBadge.module.css';

export default function SessionBadge() {
  const joinCode = useStore((s) => s.joinCode);
  const mode = useStore((s) => s.mode);

  if (!joinCode) return null;

  return (
    <div className={styles.badge}>
      <span className={styles.code}>{joinCode}</span>
      {mode === 'demo' && <span className={styles.demoTag}>DEMO</span>}
    </div>
  );
}
