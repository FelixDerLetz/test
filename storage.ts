import AsyncStorage from "@react-native-async-storage/async-storage";
import { ScanEntry } from "./types";

const STORAGE_KEY = "@scan_app/history";

/**
 * Lädt alle gespeicherten Scans, neueste zuerst.
 */
export async function loadHistory(): Promise<ScanEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: ScanEntry[] = JSON.parse(raw);
    return parsed.sort((a, b) => b.createdAt - a.createdAt);
  } catch (error) {
    console.error("Fehler beim Laden der Historie:", error);
    return [];
  }
}

/**
 * Fügt einen neuen Scan hinzu und gibt die aktualisierte Liste zurück.
 * Vermeidet Duplikate innerhalb der letzten 3 Sekunden (Doppel-Scan-Schutz).
 */
export async function addScan(
  entry: Omit<ScanEntry, "id" | "createdAt" | "isFavorite">
): Promise<ScanEntry[]> {
  const history = await loadHistory();

  const recentDuplicate = history.find(
    (h) => h.value === entry.value && Date.now() - h.createdAt < 3000
  );
  if (recentDuplicate) {
    return history;
  }

  const newEntry: ScanEntry = {
    ...entry,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    createdAt: Date.now(),
    isFavorite: false,
  };

  const updated = [newEntry, ...history];
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Löscht einen einzelnen Scan-Eintrag.
 */
export async function deleteScan(id: string): Promise<ScanEntry[]> {
  const history = await loadHistory();
  const updated = history.filter((h) => h.id !== id);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Schaltet den Favoriten-Status eines Eintrags um.
 */
export async function toggleFavorite(id: string): Promise<ScanEntry[]> {
  const history = await loadHistory();
  const updated = history.map((h) =>
    h.id === id ? { ...h, isFavorite: !h.isFavorite } : h
  );
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

/**
 * Löscht die komplette Historie (z. B. für einen "Alles löschen"-Button).
 */
export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(STORAGE_KEY);
}
