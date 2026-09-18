import { DEFAULT_SETTINGS, type HistoryItem, type HistoryKind, type Settings } from "./types";

const SETTINGS_KEY = "nova.settings";
const HISTORY_KEY = "nova.history";

const isBrowser = () => typeof window !== "undefined";

export function loadSettings(): Settings {
  if (!isBrowser()) return DEFAULT_SETTINGS;
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  if (!isBrowser()) return;
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("nova:settings"));
}

export function maskKey(key: string) {
  if (!key) return "";
  const tail = key.slice(-4);
  return `${"•".repeat(Math.min(24, Math.max(8, key.length - 4)))}${tail}`;
}

export function loadHistory(): HistoryItem[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const items = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(items) ? items.sort((a, b) => b.createdAt - a.createdAt) : [];
  } catch {
    return [];
  }
}

function writeHistory(items: HistoryItem[]) {
  if (!isBrowser()) return;
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, 200)));
  window.dispatchEvent(new Event("nova:history"));
}

export function addHistory(input: { kind: HistoryKind; title: string; content: string }) {
  const item: HistoryItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    title: input.title.trim() || "Untitled",
    preview: input.content.replace(/\s+/g, " ").trim().slice(0, 180),
    content: input.content,
    createdAt: Date.now(),
  };
  writeHistory([item, ...loadHistory()]);
  return item;
}

export function deleteHistory(id: string) {
  writeHistory(loadHistory().filter((i) => i.id !== id));
}

export function clearHistory() {
  writeHistory([]);
}

export function exportLocalData() {
  const settings = loadSettings();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      settings: { provider: settings.provider, model: settings.model },
      history: loadHistory(),
    },
    null,
    2,
  );
}

export function downloadBlob(filename: string, content: string, type = "application/json") {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
