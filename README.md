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

## Ideen für Phase 3 (brauchen einen eigenen Server bzw. native Module)

- **Cloud-Sync** zwischen Geräten (z. B. Supabase, Firebase) — erfordert Backend + Login
- **Dokumenten-Scan mit Kantenerkennung** (`react-native-document-scanner-plugin`) + PDF-Export — läuft nicht in Expo Go, braucht einen Dev-Build
- **OCR-Texterkennung** aus Fotos (ML-Kit-Bridge) — ebenfalls nativer Code nötig
- **Team-Ordner** zum gemeinsamen Sammeln von Scans — erfordert Backend
- **Automatisches WLAN-Verbinden** bei WLAN-QR-Scan — aus Sicherheitsgründen von iOS/Android nur eingeschränkt bzw. gar nicht per App erlaubt

## Rechtliche Hinweise (Kurzfassung, siehe vorheriges Gespräch)

Falls daraus ein kommerzielles Abo-Produkt wird: Informationspflichten (Preis, Laufzeit, Kündigung) vor dem Kauf klar anzeigen, 14-tägiges Widerrufsrecht einhalten, und seit Juni 2026 in der EU eine Online-Widerrufsfunktion direkt in der App/auf der Webseite bereitstellen.
