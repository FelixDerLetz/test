import { Share } from "react-native";
import { ScanEntry } from "./types";

/**
 * Wandelt eine Liste von Scans in einen CSV-String um.
 * Escaped Anführungszeichen korrekt, damit auch Werte mit Kommas/Zeilenumbrüchen
 * in Excel/Numbers/Google Sheets sauber ankommen.
 */
export function toCsv(entries: ScanEntry[]): string {
  const header = ["Datum", "Typ", "Wert", "Favorit"];
  const escape = (field: string) => `"${field.replace(/"/g, '""')}"`;

  const rows = entries.map((e) => {
    const date = new Date(e.createdAt).toLocaleString("de-DE");
    return [
      escape(date),
      escape(e.type),
      escape(e.value),
      escape(e.isFavorite ? "Ja" : "Nein"),
    ].join(",");
  });

  return [header.map(escape).join(","), ...rows].join("\n");
}

/**
 * Öffnet das native Share-Sheet mit dem CSV-Inhalt als Text.
 * (Für einen echten Datei-Export bräuchte man expo-file-system + expo-sharing,
 * das reicht aber, um die Daten z. B. per Mail/AirDrop/WhatsApp weiterzugeben.)
 */
export async function shareBatchAsCsv(entries: ScanEntry[]): Promise<void> {
  if (entries.length === 0) return;
  const csv = toCsv(entries);
  await Share.share({
    message: csv,
    title: `Scan-Export (${entries.length} Einträge)`,
  });
}
