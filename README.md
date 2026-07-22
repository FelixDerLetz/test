# Scan App

Eine React-Native/Expo-App zum Scannen von QR-Codes und Barcodes (EAN, Code128, PDF417, Aztec, DataMatrix u. a.), mit lokal gespeichertem Verlauf, Favoriten und Teilen-Funktion.

## Setup

Voraussetzungen: Node.js (LTS), npm, sowie die **Expo Go** App auf deinem Handy (iOS/Android) zum schnellen Testen — oder Xcode/Android Studio für einen Dev-Build.

```bash
# 1. Abhängigkeiten installieren
npm install

# 2. Entwicklungsserver starten
npm run start
```

Danach den QR-Code aus dem Terminal mit der **Expo Go**-App scannen (Android: direkt über die App, iOS: über die Kamera-App), oder:

```bash
npm run ios       # iOS-Simulator (nur auf macOS)
npm run android   # Android-Emulator
```

> Kamerazugriff funktioniert nicht im Web-Simulator (`npm run web`) zuverlässig — zum Testen der Scan-Funktion ein echtes Gerät oder einen Emulator mit Kamera-Passthrough nutzen.

## Wichtig: Testen in Expo Snack (Browser, ohne Installation)

Snacks Git-Import scheitert aktuell oft an PNG-Dateien (Fehler `"$": Required`
beim Datei-Upload). Da die Icons in Snack sowieso nicht sichtbar wären
(Icon/Splash sieht man erst bei einem echten Build), beim Hochladen zu GitHub
für den Snack-Test einfach den `assets/`-Ordner weglassen:

- **Beim ersten Hochladen auf GitHub:** nur `App.tsx`, `app.json`,
  `babel.config.js`, `package.json`, `tsconfig.json` und den `src/`-Ordner
  hochladen — `assets/` beim Upload einfach nicht mit auswählen.
- **Falls du schon ein Repo mit allem hast:** lösche dort nur den
  `assets/`-Ordner wieder heraus (Ordner öffnen → jede Datei einzeln über
  "..." → Delete file). Danach sollte der Snack-Import klappen.

Für einen echten Build später (EAS Build, App Store/Play Store) bleibt der
`assets/`-Ordner in deinem lokalen Projekt einfach bestehen — er wird nur für
den Snack-Test kurzzeitig aus dem Repo rausgehalten.

## Projektstruktur

```
scan-app/
├── App.tsx                    # Verbindet Scan-, History- und Result-Ansicht
├── app.json                   # Expo-Konfiguration (Kamera-Permissions etc.)
├── src/
│   ├── types.ts                # ScanEntry, ScanType Typdefinitionen
│   ├── storage.ts              # AsyncStorage-Persistenz (Verlauf, Favoriten)
│   └── screens/
│       ├── ScanScreen.tsx      # Kamera-Livevorschau + Erkennung
│       ├── HistoryScreen.tsx   # Liste aller Scans, Filter, Löschen, Teilen
│       └── ResultSheet.tsx     # Bottom-Sheet nach erfolgreichem Scan
```

## Funktionsumfang (Phase 1 — bereits umgesetzt)

- Live-Kamera-Scan für QR-Codes und gängige Barcode-Formate
- Taschenlampen-Toggle
- Automatischer Doppel-Scan-Schutz (kein Spam bei gehaltenem Code)
- Lokale Verlaufsspeicherung (AsyncStorage, bleibt nach App-Neustart erhalten)
- Favoriten markieren/filtern
- Teilen-Funktion (native Share-Sheet)
- Links direkt aus dem Ergebnis öffnen

## Phase 2 — umgesetzt ✅

Das hier ist der Teil, der ein Abo rechtfertigt — reines Scannen kann jedes Handy bereits selbst:

- **Batch-Scan-Modus**: Toggle oben rechts im Scan-Screen. Mehrere Codes werden ohne Unterbrechung hintereinander gesammelt statt nach jedem Scan ein Dialog zu zeigen.
- **CSV-Export**: In der Batch-Zusammenfassung ("Batch ansehen") lässt sich die gesammelte Liste als CSV über das native Share-Sheet exportieren/versenden (Mail, WhatsApp, Dateien-App etc.).
- **Smart Content Detection**: Erkennt automatisch WLAN-QR-Codes (zeigt SSID/Passwort), vCards (Name/Telefon/E-Mail antippbar), E-Mail-Adressen, Telefonnummern, SMS-Links und Standort-Codes (`geo:`) — und bietet direkt die passende Aktion statt nur Rohtext.

Neue Dateien dafür: `src/contentDetector.ts` (Erkennungslogik), `src/export.ts` (CSV-Erzeugung), `src/screens/BatchSummaryScreen.tsx`.

## Design/UX — umgesetzt ✅

- **App-Icon, Adaptive Icon (Android) & Splash Screen**: generierte Assets unter `assets/`, in `app.json` verknüpft
- **Onboarding**: 3 Slides beim allerersten Start (`src/screens/OnboardingScreen.tsx`), wird per AsyncStorage-Flag nur einmal gezeigt — danach direkt zum Scan-Screen
- **Animierte Scan-Linie**: läuft im Kamera-Rahmen auf und ab, solange kein Code erkannt wird — macht den Screen deutlich lebendiger als ein statischer Rahmen

Die Icon-Assets sind bewusst simpel gehalten (Scan-Rahmen-Motiv in Blau/Dunkelblau) — ein professionelles Branding würdest du eher mit einem Designer oder Tool wie Figma verfeinern, bevor du live gehst.

## Premium-Features — umgesetzt ✅

Alle drei laufen komplett offline, keine Server-Anbindung nötig:

- **QR-Code-Generator** (`src/screens/GenerateScreen.tsx`): erstellt QR-Codes für Links, WLAN-Zugänge, Kontakte (vCard) und freien Text. Export als Bild (via `react-native-view-shot`) oder als reiner Text/Inhalt über das native Share-Sheet.
- **Statistik-Dashboard** (`src/screens/StatsScreen.tsx`): zeigt Scans der letzten 7 Tage als Balkendiagramm, Aufschlüsselung nach Code-Typ und Kennzahlen (gesamt/heute/Favoriten) — alles aus den lokal gespeicherten Daten berechnet, keine externen Chart-Bibliotheken nötig.
- **Ordner & Tags** (`src/folders.ts`, `src/screens/FolderTagSheet.tsx`): Scans lassen sich im Verlauf über "🗂️ Organisieren" in eigene Ordner einsortieren und mit beliebig vielen Tags versehen. Der Verlauf bekommt dafür eine Ordner-Filterleiste oben (neben "Alle"/"Favoriten").

Zugriff: Tab-Leiste unten (Erstellen ✦, Statistik ✦) für die ersten beiden. Ordner & Tags sind direkt im Verlauf integriert — jede Karte hat einen "Organisieren"-Button, der bei fehlendem Premium-Status den Paywall-Screen öffnet.

### Wie die Freischaltung funktioniert (wichtig!)

`src/premium.ts` enthält aktuell nur einen **lokalen Demo-Schalter** (`setPremium(true)`), der in den Einstellungen bzw. im Paywall-Screen über "Premium freischalten (Demo)" gesetzt wird. **Das ist kein echtes Bezahlmodell** — jeder kann es durch Neuinstallation umgehen. Für den echten Store-Release muss das ersetzt werden durch:

- **RevenueCat** (empfohlen — verwaltet Abo-Logik, Kündigung, Familienfreigabe etc. für dich) oder
- **`expo-in-app-purchases`** direkt gegen Apple/Google In-App-Käufe

Die Kauflogik läuft dabei komplett über Apple/Google (kein eigener Server nötig) — das passt weiterhin zu "komplett lokal", nur die Zahlungsabwicklung selbst liegt zwangsläufig bei den Stores (eigene Kreditkartenabwicklung in Apps ist ohnehin gegen die Store-Richtlinien).

### Testen — Einschränkungen in Snack

- **QR-Bild-Export**: `react-native-view-shot` funktioniert in Expo Go auf echten Geräten; im Snack-Web-Preview ggf. eingeschränkt.
- **Statistik-Dashboard & Ordner/Tags**: laufen überall problemlos, reine JS-Berechnung bzw. AsyncStorage.

## Ideen für Phase 3 (brauchen einen eigenen Server bzw. native Module)

- **Cloud-Sync** zwischen Geräten (z. B. Supabase, Firebase) — erfordert Backend + Login
- **Dokumenten-Scan mit Kantenerkennung** (`react-native-document-scanner-plugin`) + PDF-Export — läuft nicht in Expo Go, braucht einen Dev-Build
- **OCR-Texterkennung** aus Fotos (ML-Kit-Bridge) — ebenfalls nativer Code nötig
- **Team-Ordner** zum gemeinsamen Sammeln von Scans — erfordert Backend
- **Automatisches WLAN-Verbinden** bei WLAN-QR-Scan — aus Sicherheitsgründen von iOS/Android nur eingeschränkt bzw. gar nicht per App erlaubt

## Rechtliche Hinweise (Kurzfassung, siehe vorheriges Gespräch)

Falls daraus ein kommerzielles Abo-Produkt wird: Informationspflichten (Preis, Laufzeit, Kündigung) vor dem Kauf klar anzeigen, 14-tägiges Widerrufsrecht einhalten, und seit Juni 2026 in der EU eine Online-Widerrufsfunktion direkt in der App/auf der Webseite bereitstellen.
