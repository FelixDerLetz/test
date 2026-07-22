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

## Ideen für Phase 2 (der eigentliche Mehrwert gegenüber der reinen OS-Funktion)

Das hier ist der Teil, der ein Abo rechtfertigt — reines Scannen kann jedes Handy bereits selbst:

- **Cloud-Sync** zwischen Geräten (z. B. Supabase, Firebase)
- **Batch-Scan-Modus** für mehrere Codes hintereinander mit CSV/Excel-Export
- **Dokumenten-Scan mit Kantenerkennung** (`react-native-document-scanner-plugin`) + PDF-Export
- **OCR-Texterkennung** aus Fotos (z. B. `expo-text-recognition` oder ML-Kit-Bridge)
- **Team-Ordner** zum gemeinsamen Sammeln von Scans
- **Automatisierungen**: z. B. bei jedem WLAN-QR-Scan automatisch verbinden, bei vCard-QR automatisch Kontakt anlegen

## Rechtliche Hinweise (Kurzfassung, siehe vorheriges Gespräch)

Falls daraus ein kommerzielles Abo-Produkt wird: Informationspflichten (Preis, Laufzeit, Kündigung) vor dem Kauf klar anzeigen, 14-tägiges Widerrufsrecht einhalten, und seit Juni 2026 in der EU eine Online-Widerrufsfunktion direkt in der App/auf der Webseite bereitstellen.
