import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import styles from './Header.module.css';

export default function Header({ title }: { title: string }) {
  const navigate = useNavigate();
  const role = useStore((s) => s.role);

  return (
    <header className={styles.header}>
      {role && (
        <button className={styles.back} onClick={() => navigate('/')}>
          Back
        </button>
      )}
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.badge}>MCI TRIAGE</div>
    </header>
  );
}
