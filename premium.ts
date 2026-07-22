import AsyncStorage from "@react-native-async-storage/async-storage";

const PREMIUM_KEY = "@scan_app/is_premium";

/**
 * WICHTIG: Das hier ist nur ein lokaler Freischalt-Schalter zum Testen/Entwickeln.
 * Für ein echtes Abo-Modell im Store müsste das durch eine richtige
 * In-App-Purchase-Anbindung ersetzt werden (z. B. RevenueCat oder
 * expo-in-app-purchases), die den Kaufstatus bei Apple/Google verifiziert.
 * Diese lokale Variante lässt sich sonst durch Neuinstallation der App umgehen.
 */

export async function isPremium(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PREMIUM_KEY);
  return value === "true";
}

export async function setPremium(value: boolean): Promise<void> {
  await AsyncStorage.setItem(PREMIUM_KEY, value ? "true" : "false");
}

export const PREMIUM_FEATURES = [
  {
    icon: "🔳",
    title: "QR-Code-Generator",
    text: "Erstelle eigene QR-Codes für Links, WLAN-Zugänge, Kontakte und Text.",
  },
  {
    icon: "📊",
    title: "Statistik-Dashboard",
    text: "Sieh deine Scan-Aktivität, häufigste Code-Typen und Trends auf einen Blick.",
  },
  {
    icon: "🗂️",
    title: "Ordner & Tags",
    text: "Organisiere deine Scans in eigenen Ordnern und markiere sie mit Tags.",
  },
];
