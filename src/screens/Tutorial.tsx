import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Tutorial.module.css';

function Accordion({
  title,
  icon,
  children,
  defaultOpen = false,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
      <button className={styles.accordionHeader} onClick={() => setOpen(!open)}>
        {icon && <span className={styles.accordionIcon}>{icon}</span>}
        <span className={styles.accordionTitle}>{title}</span>
        <span className={styles.accordionChevron}>{open ? '−' : '+'}</span>
      </button>
      {open && <div className={styles.accordionBody}>{children}</div>}
    </div>
  );
}

function TagDot({ color }: { color: string }) {
  return <span className={styles.tagDot} style={{ background: color }} />;
}

function ExampleBox({ children }: { children: React.ReactNode }) {
  return <div className={styles.exampleBox}>{children}</div>;
}

function IconCircle({
  color,
  children,
}: {
  color: string;
  children: React.ReactNode;
}) {
  return (
    <span className={styles.iconCircle} style={{ background: color }}>
      {children}
    </span>
  );
}

// ── SVG icon fragments ──

function IconPlus() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="8" cy="8" r="6.5" />
      <line x1="8" y1="5" x2="8" y2="11" />
      <line x1="5" y1="8" x2="11" y2="8" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 2h4v4" />
      <path d="M14 2L8 8" />
      <path d="M12 9v4a1 1 0 01-1 1H3a1 1 0 01-1-1V5a1 1 0 011-1h4" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="5" r="2.5" />
      <path d="M1.5 14c0-2.5 2-4.5 4.5-4.5s4.5 2 4.5 4.5" />
      <circle cx="12" cy="5.5" r="1.8" />
      <path d="M12 9c1.8 0 3.2 1.3 3.5 3" />
    </svg>
  );
}

function IconClipboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="10" height="12" rx="1.5" />
      <line x1="6" y1="5.5" x2="10" y2="5.5" />
      <line x1="6" y1="8" x2="10" y2="8" />
      <line x1="6" y1="10.5" x2="8.5" y2="10.5" />
    </svg>
  );
}

function IconHeart() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 2.5A3 3 0 008 5a3 3 0 013.5-2.5c2 0 3.5 1.7 3.5 3.5 0 4-7 8-7 8s-7-4-7-8c0-1.8 1.5-3.5 3.5-3.5z" />
    </svg>
  );
}

function IconTruck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="4" width="9" height="7" rx="1" />
      <path d="M10 7h3l2 3v1h-5V7z" />
      <circle cx="4" cy="12.5" r="1.5" />
      <circle cx="12.5" cy="12.5" r="1.5" />
    </svg>
  );
}

function IconMonitor() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1.5" y="2" width="13" height="9" rx="1.5" />
      <line x1="5.5" y1="14" x2="10.5" y2="14" />
      <line x1="8" y1="11" x2="8" y2="14" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <polyline points="5.5 8 7.2 10 10.5 6" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="6.5" />
      <polygon points="6.5,5 11.5,8 6.5,11" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconDevices() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="10" height="7" rx="1" />
      <line x1="4" y1="12" x2="8" y2="12" />
      <line x1="6" y1="9" x2="6" y2="12" />
      <rect x="10.5" y="5" width="4.5" height="8" rx="0.8" />
      <line x1="12" y1="11.5" x2="13.5" y2="11.5" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 1.5L2.5 4v4c0 3.5 2.5 5.5 5.5 7 3-1.5 5.5-3.5 5.5-7V4L8 1.5z" />
    </svg>
  );
}

export default function Tutorial() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/')}>
          Back
        </button>
        <div className={styles.headerCenter}>
          <span className={styles.headerTitle}>How to Use Triage Drill</span>
        </div>
        <div className={styles.headerSpacer} />
      </header>

      <div className={styles.content}>
        {/* ── Flow diagram ── */}
        <div className={styles.flowDiagram}>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-red)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="4" y="3" width="16" height="18" rx="2" />
                <line x1="9" y1="8" x2="15" y2="8" />
                <line x1="9" y1="12" x2="15" y2="12" />
                <line x1="9" y1="16" x2="12" y2="16" />
              </svg>
            </div>
            <span className={styles.flowStepLabel}>Field Triage</span>
            <span className={styles.flowStepSub}>Paper tags applied</span>
          </div>
          <div className={styles.flowArrow}>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="var(--color-border)" strokeWidth="1.5">
              <line x1="0" y1="6" x2="18" y2="6" />
              <polyline points="14,2 18,6 14,10" />
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" strokeLinecap="round">
                <rect x="5" y="2" width="14" height="20" rx="2" />
                <line x1="9" y1="18" x2="15" y2="18" />
              </svg>
            </div>
            <span className={styles.flowStepLabel}>Triage Drill</span>
            <span className={styles.flowStepSub}>Counts recorded</span>
          </div>
          <div className={styles.flowArrow}>
            <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="var(--color-border)" strokeWidth="1.5">
              <line x1="0" y1="6" x2="18" y2="6" />
              <polyline points="14,2 18,6 14,10" />
            </svg>
          </div>
          <div className={styles.flowStep}>
            <div className={styles.flowIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--color-green)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="14" rx="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
            </div>
            <span className={styles.flowStepLabel}>Command View</span>
            <span className={styles.flowStepSub}>Live status</span>
          </div>
        </div>

        <p className={styles.introText}>
          Triage Drill supports the existing field triage process &mdash; it does
          not replace it. Responders continue using physical{' '}
          <TagDot color="#b91c1c" /> red, <TagDot color="#ca8a04" /> yellow,{' '}
          <TagDot color="#15803d" /> green, and <TagDot color="#374151" /> black
          tags. The app is used by command and support roles to track scene
          status, treatment area flow, transport needs, and drill performance.
        </p>

        {/* ── Quick Start ── */}
        <div className={styles.quickStart}>
          <h3 className={styles.quickStartTitle}>Quick Start</h3>
          <ol className={styles.quickStartList}>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>1</span>
              </IconCircle>
              Command starts or joins an incident.
            </li>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>2</span>
              </IconCircle>
              Each user selects a role.
            </li>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>3</span>
              </IconCircle>
              Scribes record simple +1 triage counts by zone.
            </li>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>4</span>
              </IconCircle>
              Treatment and transport officers update patient flow.
            </li>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>5</span>
              </IconCircle>
              Command monitors live status.
            </li>
            <li>
              <IconCircle color="rgba(51,77,126,0.08)">
                <span className={styles.qsNum}>6</span>
              </IconCircle>
              Evaluators review the after-action summary.
            </li>
          </ol>
        </div>

        {/* ── Triage color key ── */}
        <div className={styles.colorKey}>
          <span className={styles.colorKeyTitle}>Triage Categories</span>
          <div className={styles.colorKeyGrid}>
            <div className={styles.colorKeyItem}>
              <span className={styles.colorKeyDot} style={{ background: '#b91c1c' }} />
              <span className={styles.colorKeyLabel}>Red</span>
              <span className={styles.colorKeyDesc}>Immediate</span>
            </div>
            <div className={styles.colorKeyItem}>
              <span className={styles.colorKeyDot} style={{ background: '#ca8a04' }} />
              <span className={styles.colorKeyLabel}>Yellow</span>
              <span className={styles.colorKeyDesc}>Delayed</span>
            </div>
            <div className={styles.colorKeyItem}>
              <span className={styles.colorKeyDot} style={{ background: '#15803d' }} />
              <span className={styles.colorKeyLabel}>Green</span>
              <span className={styles.colorKeyDesc}>Minor</span>
            </div>
            <div className={styles.colorKeyItem}>
              <span className={styles.colorKeyDot} style={{ background: '#374151' }} />
              <span className={styles.colorKeyLabel}>Black</span>
              <span className={styles.colorKeyDesc}>Expectant</span>
            </div>
          </div>
        </div>

        {/* ── Step-by-step guide ── */}
        <h2 className={styles.sectionHeading}>Step-by-Step Guide</h2>

        <div className={styles.accordionGroup}>
          <Accordion
            title="The Basic Concept"
            icon={<IconClipboard />}
            defaultOpen
          >
            {/* inline graphic: simple 3-column layout */}
            <div className={styles.conceptGrid}>
              <div className={styles.conceptItem}>
                <div className={styles.conceptIcon}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="#b91c1c" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="6" y="4" width="20" height="24" rx="2" />
                    <line x1="11" y1="10" x2="21" y2="10" />
                    <line x1="11" y1="14" x2="21" y2="14" />
                    <line x1="11" y1="18" x2="16" y2="18" />
                  </svg>
                </div>
                <span className={styles.conceptLabel}>Responders triage</span>
                <span className={styles.conceptSub}>Paper tags applied in the field</span>
              </div>
              <div className={styles.conceptItem}>
                <div className={styles.conceptIcon}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="8" y="3" width="16" height="26" rx="3" />
                    <line x1="13" y1="24" x2="19" y2="24" />
                    <circle cx="16" cy="14" r="4" />
                    <line x1="16" y1="12" x2="16" y2="16" />
                    <line x1="14" y1="14" x2="18" y2="14" />
                  </svg>
                </div>
                <span className={styles.conceptLabel}>Scribe records</span>
                <span className={styles.conceptSub}>Taps +1 per tag in app</span>
              </div>
              <div className={styles.conceptItem}>
                <div className={styles.conceptIcon}>
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--color-green)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="5" width="24" height="16" rx="2" />
                    <line x1="10" y1="27" x2="22" y2="27" />
                    <line x1="16" y1="21" x2="16" y2="27" />
                    <circle cx="11" cy="13" r="2" fill="#b91c1c" stroke="none" opacity="0.8" />
                    <circle cx="16" cy="13" r="2" fill="#ca8a04" stroke="none" opacity="0.8" />
                    <circle cx="21" cy="13" r="2" fill="#15803d" stroke="none" opacity="0.8" />
                  </svg>
                </div>
                <span className={styles.conceptLabel}>Command monitors</span>
                <span className={styles.conceptSub}>Live dashboard updates</span>
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>
                Triage Drill does not assign triage categories. It only records
                counts.
              </li>
              <li>
                Command sees live totals, zones, treatment area load, transport
                activity, and alerts.
              </li>
              <li>
                Evaluators use the activity timeline for after-action review.
              </li>
            </ul>
          </Accordion>

          <Accordion
            title="Step 1: Start or Join an Incident"
            icon={<IconLink />}
          >
            {/* Join code graphic */}
            <div className={styles.joinCodeGraphic}>
              <div className={styles.joinCodeDevice}>
                <span className={styles.joinCodeDeviceLabel}>Command</span>
                <div className={styles.joinCodeBox}>BUS-482</div>
              </div>
              <div className={styles.joinCodeArrows}>
                <svg width="40" height="60" viewBox="0 0 40 60" fill="none" stroke="var(--color-border)" strokeWidth="1.5">
                  <path d="M20 5 L35 20" />
                  <polyline points="30,16 35,20 31,24" />
                  <path d="M20 30 L35 30" />
                  <polyline points="30,26 35,30 30,34" />
                  <path d="M20 55 L35 40" />
                  <polyline points="30,36 35,40 31,44" />
                </svg>
              </div>
              <div className={styles.joinCodeTeam}>
                <span className={styles.joinCodeRole}>Scribe</span>
                <span className={styles.joinCodeRole}>Transport</span>
                <span className={styles.joinCodeRole}>Evaluator</span>
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>Incident Command starts a new incident or drill.</li>
              <li>The app generates a join code.</li>
              <li>
                Other users join the same incident using the join code or QR
                code.
              </li>
              <li>Each user selects their role.</li>
              <li>
                All devices share the same incident session when Supabase is
                configured.
              </li>
            </ul>
            <ExampleBox>
              Command starts "Bus Crash Drill" and receives join code{' '}
              <strong>BUS-482</strong>. The triage scribe, transport officer, and
              evaluator join using that code.
            </ExampleBox>
          </Accordion>

          <Accordion
            title="Step 2: Select Your Role"
            icon={<IconUsers />}
          >
            <div className={styles.roleGrid}>
              <RoleCard
                icon={<IconClipboard />}
                color="var(--color-primary)"
                name="Triage Scribe"
                desc="Records triage counts by zone using large +1 buttons."
              />
              <RoleCard
                icon={<IconHeart />}
                color="var(--color-red)"
                name="Treatment Area"
                desc="Tracks patient arrivals, awaiting transport, and transfers in each color area."
              />
              <RoleCard
                icon={<IconTruck />}
                color="var(--color-yellow)"
                name="Transport Officer"
                desc="Records unit names, destinations, loaded times, and departures."
              />
              <RoleCard
                icon={<IconMonitor />}
                color="var(--color-green)"
                name="Incident Command"
                desc="Views live totals, zone summaries, alerts, and transport bottlenecks."
              />
              <RoleCard
                icon={<IconCheck />}
                color="var(--color-text-secondary)"
                name="Evaluator"
                desc="Reviews timeline, final counts, bottlenecks, and exports after-action data."
              />
            </div>
          </Accordion>

          <Accordion
            title="Step 3: Record Triage Counts"
            icon={<IconPlus />}
          >
            {/* Visual: scribe tapping +1 */}
            <div className={styles.scribeGraphic}>
              <div className={styles.scribeRow}>
                <TagDot color="#b91c1c" />
                <span className={styles.scribeLabel}>Red paper tag applied</span>
                <span className={styles.scribeArrow}>&rarr;</span>
                <span className={styles.scribeAction}>+1 Red</span>
              </div>
              <div className={styles.scribeRow}>
                <TagDot color="#ca8a04" />
                <span className={styles.scribeLabel}>Yellow paper tag applied</span>
                <span className={styles.scribeArrow}>&rarr;</span>
                <span className={styles.scribeAction}>+1 Yellow</span>
              </div>
              <div className={styles.scribeRow}>
                <TagDot color="#15803d" />
                <span className={styles.scribeLabel}>Green paper tag applied</span>
                <span className={styles.scribeArrow}>&rarr;</span>
                <span className={styles.scribeAction}>+1 Green</span>
              </div>
              <div className={styles.scribeRow}>
                <TagDot color="#374151" />
                <span className={styles.scribeLabel}>Black paper tag applied</span>
                <span className={styles.scribeArrow}>&rarr;</span>
                <span className={styles.scribeAction}>+1 Black</span>
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>The triage scribe selects the current zone.</li>
              <li>The app records the color, zone, time, and role.</li>
              <li>The command dashboard updates automatically.</li>
            </ul>
            <ExampleBox>
              Responder applies a <TagDot color="#b91c1c" /> red paper tag
              &rarr; scribe taps <strong>+1 Red</strong> in Bus Area &rarr;
              command dashboard updates.
            </ExampleBox>
          </Accordion>

          <Accordion
            title="Step 4: Track Treatment Areas"
            icon={<IconHeart />}
          >
            {/* Treatment flow graphic */}
            <div className={styles.treatmentGraphic}>
              <div className={styles.treatmentStep}>
                <span className={styles.treatmentNum}>1</span>
                <span>Patients arrive at treatment area</span>
              </div>
              <div className={styles.treatmentStep}>
                <span className={styles.treatmentNum}>2</span>
                <span>Mark as <strong>Received</strong></span>
              </div>
              <div className={styles.treatmentStep}>
                <span className={styles.treatmentNum}>3</span>
                <span>Track <strong>Awaiting Transport</strong></span>
              </div>
              <div className={styles.treatmentStep}>
                <span className={styles.treatmentNum}>4</span>
                <span>Mark as <strong>Transported</strong>, <strong>Upgraded</strong>, or <strong>Downgraded</strong></span>
              </div>
            </div>
            <ExampleBox>
              <TagDot color="#b91c1c" /> Red Area receives 5 patients. Three are
              awaiting transport. Command can now see that Red Area needs
              ambulance attention.
            </ExampleBox>
          </Accordion>

          <Accordion
            title="Step 5: Record Transport Activity"
            icon={<IconTruck />}
          >
            {/* Transport record graphic */}
            <div className={styles.transportGraphic}>
              <div className={styles.transportField}>
                <span className={styles.transportFieldLabel}>Category</span>
                <span className={styles.transportFieldValue}>
                  <TagDot color="#b91c1c" /> Red
                </span>
              </div>
              <div className={styles.transportField}>
                <span className={styles.transportFieldLabel}>From</span>
                <span className={styles.transportFieldValue}>Red Area</span>
              </div>
              <div className={styles.transportField}>
                <span className={styles.transportFieldLabel}>Unit</span>
                <span className={styles.transportFieldValue}>Medic 3</span>
              </div>
              <div className={styles.transportField}>
                <span className={styles.transportFieldLabel}>Destination</span>
                <span className={styles.transportFieldValue}>Trauma Center</span>
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>Patient names are not required.</li>
              <li>
                The app tracks which categories are still waiting and which
                units have departed.
              </li>
            </ul>
          </Accordion>

          <Accordion
            title="Step 6: Monitor Command Dashboard"
            icon={<IconMonitor />}
          >
            {/* Dashboard preview graphic */}
            <div className={styles.dashPreview}>
              <div className={styles.dashRow}>
                <span className={styles.dashMetric}>
                  <span className={styles.dashMetricVal}>24</span>
                  <span className={styles.dashMetricLabel}>Total</span>
                </span>
                <span className={styles.dashMetric}>
                  <TagDot color="#b91c1c" />
                  <span className={styles.dashMetricVal}>5</span>
                </span>
                <span className={styles.dashMetric}>
                  <TagDot color="#ca8a04" />
                  <span className={styles.dashMetricVal}>9</span>
                </span>
                <span className={styles.dashMetric}>
                  <TagDot color="#15803d" />
                  <span className={styles.dashMetricVal}>9</span>
                </span>
                <span className={styles.dashMetric}>
                  <TagDot color="#374151" />
                  <span className={styles.dashMetricVal}>1</span>
                </span>
              </div>
              <div className={styles.dashAlert}>
                <span className={styles.dashAlertIcon}>!</span>
                Immediate area needs transport attention.
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>Incident Command watches live totals.</li>
              <li>
                The dashboard summarizes total patients, color counts, zones,
                recent activity, and alerts.
              </li>
              <li>
                Alerts identify possible bottlenecks such as red patients
                awaiting transport or crowded yellow areas.
              </li>
            </ul>
          </Accordion>

          <Accordion
            title="Step 7: Complete the Drill and Review"
            icon={<IconCheck />}
          >
            <ul className={styles.contentList}>
              <li>
                At the end of the drill, command marks the incident complete.
              </li>
              <li>The evaluator opens After-Action Review.</li>
              <li>
                The review shows final counts, timeline, transport totals,
                upgrades, downgrades, most active zone, and bottlenecks.
              </li>
              <li>Users can export JSON or CSV.</li>
            </ul>
          </Accordion>
        </div>

        {/* ── Try It Yourself ── */}
        <h2 className={styles.sectionHeading}>Try It Yourself</h2>

        <div className={styles.accordionGroup}>
          <Accordion title="Solo Demo Walkthrough" icon={<IconPlay />}>
            <p className={styles.bodyText}>
              You can explore the full app by yourself using a demo incident.
            </p>
            <ol className={styles.numberedList}>
              <li>Click <strong>Load Demo Incident</strong> from the home screen.</li>
              <li>Open <strong>Triage Scribe</strong> and add sample counts.</li>
              <li>Open <strong>Incident Command</strong> and view live totals.</li>
              <li>Open <strong>Treatment Area</strong> and record received patients.</li>
              <li>Open <strong>Transport Officer</strong> and record a departure.</li>
              <li>Return to <strong>Incident Command</strong> to see updated status.</li>
              <li>Complete the incident.</li>
              <li>Open <strong>After-Action Review</strong>.</li>
            </ol>

            <div className={styles.demoGrid}>
              <div className={styles.demoCard}>
                <span className={styles.demoCardTitle}>Bus Area</span>
                <div className={styles.demoCounts}>
                  <span className={styles.demoTag} style={{ color: '#b91c1c' }}>+2 Red</span>
                  <span className={styles.demoTag} style={{ color: '#ca8a04' }}>+4 Yellow</span>
                  <span className={styles.demoTag} style={{ color: '#15803d' }}>+8 Green</span>
                  <span className={styles.demoTag} style={{ color: '#374151' }}>+1 Black</span>
                </div>
              </div>
              <div className={styles.demoCard}>
                <span className={styles.demoCardTitle}>North Lot</span>
                <div className={styles.demoCounts}>
                  <span className={styles.demoTag} style={{ color: '#b91c1c' }}>+3 Red</span>
                  <span className={styles.demoTag} style={{ color: '#ca8a04' }}>+5 Yellow</span>
                  <span className={styles.demoTag} style={{ color: '#15803d' }}>+6 Green</span>
                </div>
              </div>
              <div className={styles.demoCard}>
                <span className={styles.demoCardTitle}>Red Treatment</span>
                <div className={styles.demoCounts}>
                  <span className={styles.demoTag}>+3 Received</span>
                  <span className={styles.demoTag}>+2 Awaiting</span>
                  <span className={styles.demoTag}>+1 Transported</span>
                </div>
              </div>
              <div className={styles.demoCard}>
                <span className={styles.demoCardTitle}>Transport</span>
                <div className={styles.demoCounts}>
                  <span className={styles.demoTag} style={{ color: '#b91c1c' }}>Red</span>
                  <span className={styles.demoTag}>Medic 3</span>
                  <span className={styles.demoTag}>Trauma Ctr</span>
                </div>
              </div>
            </div>
          </Accordion>

          <Accordion title="Using Multiple Devices" icon={<IconDevices />}>
            {/* Multi-device graphic */}
            <div className={styles.multiDeviceGraphic}>
              <div className={styles.mdCenter}>
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" stroke="var(--color-primary)" strokeWidth="1.5" strokeLinecap="round">
                  <circle cx="18" cy="18" r="14" strokeDasharray="4 3" />
                  <circle cx="18" cy="18" r="4" fill="rgba(51,77,126,0.1)" />
                </svg>
                <span className={styles.mdCenterLabel}>Shared Session</span>
              </div>
              <div className={styles.mdDevices}>
                <div className={styles.mdDevice}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                    <rect x="5" y="1" width="10" height="18" rx="2" />
                    <line x1="8" y1="16" x2="12" y2="16" />
                  </svg>
                  <span>Scribe</span>
                </div>
                <div className={styles.mdDevice}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
                    <rect x="5" y="1" width="10" height="18" rx="2" />
                    <line x1="8" y1="16" x2="12" y2="16" />
                  </svg>
                  <span>Transport</span>
                </div>
                <div className={styles.mdDevice}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="16" height="11" rx="1.5" />
                    <line x1="7" y1="17" x2="13" y2="17" />
                    <line x1="10" y1="14" x2="10" y2="17" />
                  </svg>
                  <span>Command</span>
                </div>
              </div>
            </div>
            <ul className={styles.contentList}>
              <li>One user starts the incident.</li>
              <li>Others join by code or QR code.</li>
              <li>Each person chooses their role.</li>
              <li>Actions from one device update dashboards on other devices.</li>
              <li>Requires Supabase configuration and deployment or shared network access.</li>
            </ul>
            <div className={styles.noteBox}>
              <strong>Network note:</strong> If the QR code uses{' '}
              <code>localhost</code>, phones will not connect because localhost
              points to the phone itself. For phone testing, deploy to Vercel or
              run Vite with <code>--host</code> and use the network URL.
            </div>
          </Accordion>
        </div>

        {/* ── What This App Does Not Do ── */}
        <div className={styles.accordionGroup} style={{ marginTop: 20 }}>
          <Accordion title="What Triage Drill Does Not Do" icon={<IconShield />}>
            <ul className={styles.contentList}>
              <li>It does not replace physical triage tags.</li>
              <li>It does not make medical decisions.</li>
              <li>It does not assign patient priority.</li>
              <li>It does not require patient names.</li>
              <li>It does not create full patient care reports.</li>
              <li>It does not replace local protocols or agency policy.</li>
            </ul>
          </Accordion>
        </div>

        {/* ── Safety / Scope ── */}
        <div className={styles.safetyCard}>
          <p className={styles.safetyText}>
            Triage Drill is a scene-status and drill-support tool. It does not
            replace responder judgment, medical direction, local triage
            protocols, or physical triage tags. Agencies should validate
            workflows according to their own policies before operational use.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleCard({
  icon,
  color,
  name,
  desc,
}: {
  icon: React.ReactNode;
  color: string;
  name: string;
  desc: string;
}) {
  return (
    <div className={styles.roleItem}>
      <span className={styles.roleIcon} style={{ color }}>{icon}</span>
      <div className={styles.roleText}>
        <span className={styles.roleLabel}>{name}</span>
        <span className={styles.roleDesc}>{desc}</span>
      </div>
    </div>
  );
}
