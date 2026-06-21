import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { useStore } from '../store';
import styles from './JoinCodeDisplay.module.css';

export default function JoinCodeDisplay() {
  const joinCode = useStore((s) => s.joinCode);
  const mode = useStore((s) => s.mode);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!joinCode) return;
    // Generate QR code encoding the join URL
    const joinUrl = `${window.location.origin}?join=${joinCode}`;
    QRCode.toDataURL(joinUrl, {
      width: 160,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    }).then(setQrUrl).catch(() => {});
  }, [joinCode]);

  if (!joinCode) return null;

  function handleCopy() {
    if (!joinCode) return;
    navigator.clipboard.writeText(joinCode).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => {});
  }

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <span className={styles.label}>
          {mode === 'demo' ? 'Demo Session' : 'Session Code'}
        </span>
      </div>
      <div className={styles.codeRow}>
        <span className={styles.code}>{joinCode}</span>
        <button className={styles.copyBtn} onClick={handleCopy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      {mode !== 'demo' && qrUrl && (
        <div className={styles.qrSection}>
          <img className={styles.qrImg} src={qrUrl} alt={`QR code for ${joinCode}`} />
          <span className={styles.qrHint}>Scan to join on another device</span>
        </div>
      )}
    </div>
  );
}
