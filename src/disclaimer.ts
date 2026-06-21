const STORAGE_KEY = 'mci-triage-disclaimer-acknowledged';

export function hasAcknowledged(): boolean {
  return localStorage.getItem(STORAGE_KEY) === '1';
}

export function acknowledge(): void {
  localStorage.setItem(STORAGE_KEY, '1');
}
