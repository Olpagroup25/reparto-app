/** "hace 5 min", "hace 2 h", "ayer", "hace 3 d" — coarse relative time for the
 * Sync tab. Spanish, no i18n layer in this app. */
export function timeAgo(iso: string | null, now: Date = new Date()): string {
  if (!iso) return 'nunca';
  const then = new Date(iso).getTime();
  const diffMs = now.getTime() - then;
  if (Number.isNaN(then)) return '—';

  const sec = Math.round(diffMs / 1000);
  if (sec < 45) return 'recién';
  const min = Math.round(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `hace ${hr} h`;
  const day = Math.round(hr / 24);
  if (day === 1) return 'ayer';
  if (day < 30) return `hace ${day} d`;
  return new Date(iso).toLocaleDateString();
}
