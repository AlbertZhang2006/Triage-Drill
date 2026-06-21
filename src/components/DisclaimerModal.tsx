import { acknowledge } from '../disclaimer';
import styles from './DisclaimerModal.module.css';

interface Props {
  onAccept: () => void;
}

export default function DisclaimerModal({ onAccept }: Props) {
  function handleAccept() {
    acknowledge();
    onAccept();
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h2 className={styles.title}>Triage Drill</h2>
        <p className={styles.purpose}>
          This app provides scene status tracking, drill management, and
          command visibility for mass casualty incidents. It is designed for
          triage scribes, treatment area staff, transport group, incident
          command, and after-action review.
        </p>
        <div className={styles.points}>
          <div className={styles.point}>
            This tool does not replace responder judgment or assign medical
            triage categories.
          </div>
          <div className={styles.point}>
            Physical triage tags remain the primary field workflow.
          </div>
          <div className={styles.point}>
            For operational deployment, agencies must validate all workflows
            against local protocols and medical direction.
          </div>
        </div>
        <button className={styles.acceptBtn} onClick={handleAccept}>
          I Understand
        </button>
      </div>
    </div>
  );
}
