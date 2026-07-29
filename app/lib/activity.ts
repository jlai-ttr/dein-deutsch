// Activity tracking — fire whenever a meaningful learning event happens
// Stored per-day as Set<eventType>. Heatmap-friendly.

export type ActivityEvent = 'lesson' | 'vocab' | 'practice' | 'read' | 'write' | 'listen' | 'speak' | 'culture' | 'kultur';

const STORAGE_KEY = 'dein-deutsch-activity';

interface ActivityLog {
  [dateISO: string]: ActivityEvent[];
}

function load(): ActivityLog {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function save(log: ActivityLog) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

export function trackEvent(event: ActivityEvent) {
  const log = load();
  const today = new Date().toISOString().slice(0, 10);
  if (!log[today]) log[today] = [];
  if (!log[today].includes(event)) {
    log[today].push(event);
    save(log);
  }
}

export function getActivityForDate(date: string): ActivityEvent[] {
  const log = load();
  return log[date] || [];
}

export function getActivityRange(days: number): { date: string; events: ActivityEvent[]; active: boolean }[] {
  const log = load();
  const out: { date: string; events: ActivityEvent[]; active: boolean }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    out.push({
      date: iso,
      events: log[iso] || [],
      active: !!(log[iso] && log[iso].length > 0),
    });
  }
  return out;
}

export function getStreak(): number {
  const log = load();
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    if (log[iso] && log[iso].length > 0) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }
  return streak;
}

export function getTotalDaysStudied(): number {
  const log = load();
  return Object.keys(log).filter(d => log[d].length > 0).length;
}
