export type ScanType =
  | "qr"
  | "ean13"
  | "ean8"
  | "code128"
  | "code39"
  | "upc_a"
  | "upc_e"
  | "pdf417"
  | "aztec"
  | "datamatrix"
  | "unknown";

export interface ScanEntry {
  id: string;
  value: string;
  type: ScanType;
  createdAt: number; // Unix timestamp (ms)
  isFavorite: boolean;
  note?: string;
  folderId?: string | null;
  tags: string[];
}

export type RootScreen = "scan" | "history" | "detail";
