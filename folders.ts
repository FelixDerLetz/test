import AsyncStorage from "@react-native-async-storage/async-storage";

const FOLDERS_KEY = "@scan_app/folders";

export interface Folder {
  id: string;
  name: string;
  color: string;
}

const FOLDER_COLORS = ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444", "#A855F7", "#14B8A6"];

export async function loadFolders(): Promise<Folder[]> {
  try {
    const raw = await AsyncStorage.getItem(FOLDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (error) {
    console.error("Fehler beim Laden der Ordner:", error);
    return [];
  }
}

export async function createFolder(name: string): Promise<Folder[]> {
  const folders = await loadFolders();
  const trimmed = name.trim();
  if (!trimmed) return folders;

  const newFolder: Folder = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: trimmed,
    color: FOLDER_COLORS[folders.length % FOLDER_COLORS.length],
  };

  const updated = [...folders, newFolder];
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
  return updated;
}

export async function deleteFolder(id: string): Promise<Folder[]> {
  const folders = await loadFolders();
  const updated = folders.filter((f) => f.id !== id);
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
  return updated;
}

export async function renameFolder(id: string, name: string): Promise<Folder[]> {
  const folders = await loadFolders();
  const trimmed = name.trim();
  if (!trimmed) return folders;
  const updated = folders.map((f) => (f.id === id ? { ...f, name: trimmed } : f));
  await AsyncStorage.setItem(FOLDERS_KEY, JSON.stringify(updated));
  return updated;
}
