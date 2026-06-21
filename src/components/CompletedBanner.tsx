import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import styles from './CompletedBanner.module.css';

export default function CompletedBanner() {
  const navigate = useNavigate();
  const reopenIncident = useStore((s) => s.reopenIncident);

  return (
    <div className={styles.banner}>
      <span className={styles.text}>
        This incident is completed. Actions are disabled.
      </span>
      <div className={styles.actions}>
        <button className={styles.reopenBtn} onClick={reopenIncident}>
          Reopen
        </button>
        <button className={styles.homeBtn} onClick={() => navigate('/')}>
          Home
        </button>
      </div>
    </div>
  );
}
