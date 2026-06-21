import { useState } from 'react';
import { useStore } from '../store';
import { isZoneEmpty } from '../types';
import styles from './ZoneManager.module.css';

interface Props {
  onClose: () => void;
}

export default function ZoneManager({ onClose }: Props) {
  const zones = useStore((s) => s.incident.zones);
  const addZone = useStore((s) => s.addZone);
  const renameZone = useStore((s) => s.renameZone);
  const deleteZone = useStore((s) => s.deleteZone);

  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) return;
    addZone(newName.trim());
    setNewName('');
  }

  function startRename(id: string, currentName: string) {
    setEditingId(id);
    setEditingName(currentName);
    setConfirmDeleteId(null);
  }

  function commitRename() {
    if (!editingId || !editingName.trim()) return;
    renameZone(editingId, editingName.trim());
    setEditingId(null);
    setEditingName('');
  }

  function handleRenameKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditingId(null); setEditingName(''); }
  }

  function handleDelete(id: string) {
    deleteZone(id);
    setConfirmDeleteId(null);
  }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <span className={styles.panelTitle}>Manage Zones</span>
        <button className={styles.closeBtn} onClick={onClose}>Done</button>
      </div>

      <div className={styles.zoneList}>
        {zones.length === 0 && (
          <p className={styles.empty}>No zones. Add one below.</p>
        )}
        {zones.map((zone) => {
          const empty = isZoneEmpty(zone);
          const total = zone.redCount + zone.yellowCount + zone.greenCount + zone.blackCount;
          const isEditing = editingId === zone.id;
          const isConfirming = confirmDeleteId === zone.id;

          return (
            <div key={zone.id} className={styles.zoneRow}>
              {isEditing ? (
                <div className={styles.renameRow}>
                  <input
                    className={styles.renameInput}
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={handleRenameKey}
                    autoFocus
                  />
                  <button className={styles.saveBtn} onClick={commitRename}>
                    Save
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => { setEditingId(null); setEditingName(''); }}
                  >
                    Cancel
                  </button>
                </div>
              ) : isConfirming ? (
                <div className={styles.confirmRow}>
                  <span className={styles.confirmText}>
                    Delete "{zone.name}"?
                  </span>
                  <button
                    className={styles.confirmYes}
                    onClick={() => handleDelete(zone.id)}
                  >
                    Delete
                  </button>
                  <button
                    className={styles.cancelBtn}
                    onClick={() => setConfirmDeleteId(null)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div className={styles.zoneInfo}>
                    <span className={styles.zoneName}>{zone.name}</span>
                    {total > 0 && (
                      <span className={styles.zoneCount}>{total} patients</span>
                    )}
                  </div>
                  <div className={styles.zoneActions}>
                    <button
                      className={styles.actionLink}
                      onClick={() => startRename(zone.id, zone.name)}
                    >
                      Rename
                    </button>
                    <button
                      className={`${styles.actionLink} ${!empty ? styles.actionDisabled : styles.actionDelete}`}
                      disabled={!empty}
                      onClick={() => setConfirmDeleteId(zone.id)}
                      title={empty ? 'Delete zone' : 'Cannot delete zone with patients'}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <form className={styles.addForm} onSubmit={handleAdd}>
        <input
          className={styles.addInput}
          placeholder="New zone name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button
          type="submit"
          className={styles.addBtn}
          disabled={!newName.trim()}
        >
          Add Zone
        </button>
      </form>
    </div>
  );
}
