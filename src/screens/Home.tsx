import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { DRILL_SCENARIOS } from '../types';
import { getSupabaseDebugInfo } from '../services/supabaseSync';
import styles from './Home.module.css';

type View = 'menu' | 'start' | 'join' | 'demo';

function formatJoinCode(raw: string): string {
  const cleaned = raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  const letters = cleaned.replace(/[^A-Z]/g, '').slice(0, 3);
  const digits = cleaned.replace(/[^0-9]/g, '').slice(0, 3);

  if (letters && digits) {
    return `${letters}-${digits}`;
  }
  return letters || digits;
}

export default function Home() {
  const navigate = useNavigate();
  const createSession = useStore((s) => s.createSession);
  const joinSession = useStore((s) => s.joinSession);
  const loadDemoSession = useStore((s) => s.loadDemoSession);

  const [view, setView] = useState<View>('menu');
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  function handleStartSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!name.trim()) return;
    createSession(name.trim(), location.trim() || undefined);
    navigate('/roles');
  }

  async function handleJoinSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    if (!joinCode.trim() || joining) return;
    setJoinError(null);
    setJoining(true);
    try {
      const success = await joinSession(joinCode.trim());
      if (success) {
        navigate('/roles');
      } else {
        setJoinError('Session not found. Check the code and try again.');
      }
    } finally {
      setJoining(false);
    }
  }

  function handleJoinCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    setJoinError(null);
    setJoinCode(formatJoinCode(e.target.value));
  }

  function handleDemoSelect(scenarioName: string) {
    loadDemoSession(scenarioName);
    navigate('/roles');
  }

  function handleCancel() {
    setView('menu');
    setName('');
    setLocation('');
    setJoinCode('');
    setJoinError(null);
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <h1 className={styles.title}>Triage Drill</h1>
        <p className={styles.subtitle}>
          Paper tags stay primary. Triage Drill gives command a live picture of
          scene status, treatment area load, transport needs, bottlenecks, and
          after-action review.
        </p>
      </header>

      {view === 'menu' && (
        <div className={styles.menuGrid}>
          <button className={styles.menuCard} onClick={() => setView('start')}>
            <div className={styles.menuIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="10" cy="10" r="8" />
                <line x1="10" y1="6" x2="10" y2="14" />
                <line x1="6" y1="10" x2="14" y2="10" />
              </svg>
            </div>
            <div className={styles.menuText}>
              <span className={styles.menuTitle}>Start New Incident</span>
              <span className={styles.menuDesc}>Create a new session for your team to join.</span>
            </div>
          </button>

          <button className={styles.menuCard} onClick={() => setView('join')}>
            <div className={styles.menuIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2h5a1 1 0 011 1v14a1 1 0 01-1 1h-5" />
                <polyline points="8 14 12 10 8 6" />
                <line x1="2" y1="10" x2="12" y2="10" />
              </svg>
            </div>
            <div className={styles.menuText}>
              <span className={styles.menuTitle}>Join Existing Incident</span>
              <span className={styles.menuDesc}>Enter a join code to connect to an active session.</span>
            </div>
          </button>

          <button className={styles.menuCard} onClick={() => setView('demo')}>
            <div className={styles.menuIcon}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="2" width="14" height="16" rx="1.5" />
                <line x1="7" y1="6" x2="13" y2="6" />
                <line x1="7" y1="9" x2="13" y2="9" />
                <line x1="7" y1="12" x2="10" y2="12" />
              </svg>
            </div>
            <div className={styles.menuText}>
              <span className={styles.menuTitle}>Load Demo Incident</span>
              <span className={styles.menuDesc}>Try a pre-built drill scenario to explore the app.</span>
            </div>
          </button>
        </div>
      )}

      {view === 'start' && (
        <>
          <h2 className={styles.sectionHeading}>Start New Incident</h2>
          <form className={styles.formSection} onSubmit={handleStartSubmit}>
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="incident-name">Incident Name</label>
              <input
                id="incident-name"
                className={styles.formInput}
                type="text"
                placeholder="e.g. Bus Crash — Route 7"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
            </div>
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="incident-location">Location (optional)</label>
              <input
                id="incident-location"
                className={styles.formInput}
                type="text"
                placeholder="e.g. Highway 7 / Oak Street"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </form>
          <div className={styles.buttonRow}>
            <button
              className={styles.submitBtn}
              type="button"
              disabled={!name.trim()}
              onClick={() => handleStartSubmit()}
            >
              Start Incident
            </button>
            <button className={styles.cancelBtn} type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      {view === 'join' && (
        <>
          <h2 className={styles.sectionHeading}>Join Existing Incident</h2>
          <form className={styles.formSection} onSubmit={handleJoinSubmit}>
            <div className={styles.formRow}>
              <label className={styles.formLabel} htmlFor="join-code">Join Code</label>
              <input
                id="join-code"
                className={styles.joinInput}
                type="text"
                placeholder="ABC-123"
                value={joinCode}
                onChange={handleJoinCodeChange}
                maxLength={7}
                autoFocus
                autoComplete="off"
                autoCapitalize="characters"
                inputMode="text"
              />
              {joinError && <p className={styles.joinError}>{joinError}</p>}
            </div>
          </form>
          <div className={styles.buttonRow}>
            <button
              className={styles.submitBtn}
              type="button"
              disabled={!joinCode.trim() || joining}
              onClick={() => handleJoinSubmit()}
            >
              {joining ? 'Joining…' : 'Join Session'}
            </button>
            <button className={styles.cancelBtn} type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      {view === 'demo' && (
        <>
          <h2 className={styles.sectionHeading}>Select a Drill Scenario</h2>
          <div className={styles.scenarioList}>
            {DRILL_SCENARIOS.map((scenario) => (
              <button
                key={scenario.name}
                className={styles.scenarioCard}
                onClick={() => handleDemoSelect(scenario.name)}
              >
                <span className={styles.scenarioName}>{scenario.name}</span>
                <span className={styles.scenarioLocation}>{scenario.location}</span>
                <span className={styles.scenarioDesc}>{scenario.description}</span>
              </button>
            ))}
          </div>
          <div className={styles.buttonRow}>
            <button className={styles.cancelBtn} type="button" onClick={handleCancel}>
              Cancel
            </button>
          </div>
        </>
      )}

      <div className={styles.tutorialBtnWrap}>
        <button className={styles.tutorialBtn} onClick={() => navigate('/tutorial')}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10" cy="10" r="8" />
            <path d="M7.5 7.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2 2-2 3" />
            <circle cx="10" cy="14.5" r="0.5" fill="currentColor" stroke="none" />
          </svg>
          <span>How to Use Triage Drill</span>
        </button>
      </div>

      <footer className={styles.footer}>
        <p className={styles.disclaimer}>
          This tool supports scene status tracking and drill review. It does
          not replace responder judgment or physical triage tags.
        </p>
        <button className={styles.aboutLink} onClick={() => navigate('/about')}>
          About this app
        </button>
      </footer>
    </div>
  );
}
