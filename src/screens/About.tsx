import { useNavigate } from 'react-router-dom';
import styles from './About.module.css';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          Back
        </button>
        <span className={styles.headerTitle}>About</span>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.content}>
        <h1 className={styles.title}>Triage Drill</h1>
        <p className={styles.version}>Scene status and drill management tool</p>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Purpose</h2>
          <p className={styles.body}>
            This app digitizes scene status during mass casualty incidents and
            drills. It is built for triage scribes, treatment area staff,
            transport group, incident command, and after-action review.
          </p>
          <p className={styles.body}>
            It tracks zone-level triage counts, treatment area patient flow,
            transport queues, and provides command with a live operational
            picture. It also supports after-action review with timeline
            export.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Scope and Limitations</h2>
          <div className={styles.points}>
            <div className={styles.point}>
              This tool does not replace responder judgment. Clinical
              decisions remain with qualified personnel.
            </div>
            <div className={styles.point}>
              This tool does not assign medical triage categories. Triage
              categorization is performed by trained responders using
              established protocols (START, JumpSTART, SALT, or local
              equivalents).
            </div>
            <div className={styles.point}>
              Physical triage tags remain the primary field workflow. This
              app records counts and status — it does not replace the tag on
              the patient.
            </div>
            <div className={styles.point}>
              For operational deployment beyond drills, agencies must
              validate all workflows against local protocols, medical
              direction, and data handling requirements.
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data</h2>
          <p className={styles.body}>
            All incident data is stored locally in this browser. No data is
            sent to external servers. Use the Export function in the
            After-Action Review screen to save incident records as JSON or
            CSV.
          </p>
        </section>
      </div>
    </div>
  );
}
