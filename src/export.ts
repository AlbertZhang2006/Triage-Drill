import type { Incident } from './types';

function fmtTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function csvEscape(val: string): string {
  if (val.includes(',') || val.includes('"') || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export function buildCSV(incident: Incident): string {
  const header = 'timestamp,time,actorRole,actionType,category,zoneOrArea,note';
  const rows = incident.activityLog.map((e) =>
    [
      new Date(e.timestamp).toISOString(),
      fmtTime(e.timestamp),
      e.actorRole,
      e.actionType,
      e.category ?? '',
      csvEscape(e.zoneOrArea ?? ''),
      csvEscape(e.note),
    ].join(','),
  );
  return header + '\n' + rows.join('\n');
}

export function buildJSON(incident: Incident): string {
  return JSON.stringify(incident, null, 2);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportJSON(incident: Incident) {
  const blob = new Blob([buildJSON(incident)], { type: 'application/json' });
  downloadBlob(blob, `${slugify(incident.name)}-aar.json`);
}

export function exportCSV(incident: Incident) {
  const blob = new Blob([buildCSV(incident)], { type: 'text/csv' });
  downloadBlob(blob, `${slugify(incident.name)}-activity-log.csv`);
}
