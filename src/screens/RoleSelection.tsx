import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import type { Role } from '../types';
import { ROLE_META } from '../types';
import JoinCodeDisplay from '../components/JoinCodeDisplay';
import styles from './RoleSelection.module.css';

const ROLES: Role[] = ['scribe', 'treatment', 'transport', 'command', 'evaluator'];

const ROUTE_MAP: Record<Role, string> = {
  scribe: '/scribe',
  treatment: '/treatment',
  transport: '/transport',
  command: '/dashboard',
  evaluator: '/review',
};

function RoleIcon({ role }: { role: Role }) {
  const shared = { width: 20, height: 20, viewBox: '0 0 20 20', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const };

  switch (role) {
    case 'scribe':
      return (
        <svg {...shared}>
          <rect x="4" y="2" width="12" height="16" rx="1.5" />
          <line x1="7" y1="6" x2="13" y2="6" />
          <line x1="7" y1="9" x2="13" y2="9" />
          <line x1="7" y1="12" x2="10" y2="12" />
        </svg>
      );
    case 'treatment':
      return (
        <svg {...shared}>
          <line x1="10" y1="4" x2="10" y2="16" />
          <line x1="4" y1="10" x2="16" y2="10" />
        </svg>
      );
    case 'transport':
      return (
        <svg {...shared}>
          <rect x="1" y="7" width="13" height="8" rx="1" />
          <path d="M14 10h3l2 3v2h-5V10z" />
          <circle cx="5" cy="16" r="1.5" />
          <circle cx="16" cy="16" r="1.5" />
        </svg>
      );
    case 'command':
      return (
        <svg {...shared}>
          <rect x="2" y="2" width="7" height="7" rx="1" />
          <rect x="11" y="2" width="7" height="4" rx="1" />
          <rect x="2" y="11" width="7" height="4" rx="1" />
          <rect x="11" y="8" width="7" height="7" rx="1" />
        </svg>
      );
    case 'evaluator':
      return (
        <svg {...shared}>
          <circle cx="10" cy="10" r="8" />
          <line x1="10" y1="5" x2="10" y2="10" />
          <line x1="10" y1="10" x2="13.5" y2="13.5" />
        </svg>
      );
  }
}

export default function RoleSelection() {
  const navigate = useNavigate();
  const setRole = useStore((s) => s.setRole);
  const leaveSession = useStore((s) => s.leaveSession);
  const incident = useStore((s) => s.incident);

  function handleSelect(role: Role) {
    setRole(role);
    navigate(ROUTE_MAP[role]);
  }

  function handleLeave() {
    leaveSession();
    navigate('/');
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>{incident.name}</h1>
        {incident.location && (
          <p className={styles.subtitle}>{incident.location}</p>
        )}
        <p className={styles.subtitle}>Select your role to continue.</p>
      </header>

      <div className={styles.grid}>
        {ROLES.map((role) => {
          const meta = ROLE_META[role];
          return (
            <button
              key={role}
              className={styles.card}
              onClick={() => handleSelect(role)}
            >
              <div className={styles.icon}>
                <RoleIcon role={role} />
              </div>
              <div className={styles.cardText}>
                <span className={styles.cardTitle}>{meta.label}</span>
                <span className={styles.cardDesc}>{meta.description}</span>
              </div>
              <svg className={styles.chevron} width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 3l5 5-5 5" />
              </svg>
            </button>
          );
        })}
      </div>

      <div className={styles.incidentSection}>
        <JoinCodeDisplay />
      </div>

      <footer className={styles.footer}>
        <button className={styles.leaveBtn} onClick={handleLeave}>
          Leave Session
        </button>
      </footer>
    </div>
  );
}
