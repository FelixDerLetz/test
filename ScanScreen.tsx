import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  Dimensions,
  Animated,
} from "react-native";
import { CameraView, useCameraPermissions, BarcodeScanningResult } from "expo-camera";
import * as Haptics from "expo-haptics";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScanType } from "../types";

const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.7;

function ScanLine({ active }: { active: boolean }) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!active) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(translateY, {
          toValue: FRAME_SIZE - 4,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [active, translateY]);

  if (!active) return null;

  return (
    <Animated.View
      style={[styles.scanLine, { transform: [{ translateY }] }]}
      pointerEvents="none"
    />
  );
}

interface Props {
  onScanned: (value: string, type: ScanType) => void;
  onOpenHistory: () => void;
  batchMode: boolean;
  onToggleBatchMode: () => void;
  batchCount: number;
  onOpenBatch: () => void;
}

export default function ScanScreen({
  onScanned,
  onOpenHistory,
  batchMode,
  onToggleBatchMode,
  batchCount,
  onOpenBatch,
}: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [torchOn, setTorchOn] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const lastScanRef = useRef<{ value: string; time: number } | null>(null);

  const handleBarcodeScanned = useCallback(
    (result: BarcodeScanningResult) => {
      const now = Date.now();
      // Verhindert, dass derselbe Code mehrfach pro Sekunde feuert
      if (
        lastScanRef.current &&
        lastScanRef.current.value === result.data &&
        now - lastScanRef.current.time < 1500
      ) {
        return;
      }
      lastScanRef.current = { value: result.data, time: now };

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setIsPaused(true);

      const type = (result.type as ScanType) ?? "unknown";
      onScanned(result.data, type);

      // Im Batch-Modus kurze Pause (schnell weiterscannen möglich),
      // im Einzel-Modus länger, da erst das Ergebnis-Sheet geschlossen wird.
      setTimeout(() => setIsPaused(false), batchMode ? 700 : 1200);
    },
    [onScanned, batchMode]
  );

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.centered}>
        <Text style={styles.permissionTitle}>Kamerazugriff benötigt</Text>
        <Text style={styles.permissionText}>
          Um Codes zu scannen, braucht die App Zugriff auf deine Kamera.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={requestPermission}>
          <Text style={styles.primaryButtonText}>Zugriff erlauben</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torchOn}
        onBarcodeScanned={isPaused ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            "qr",
            "ean13",
            "ean8",
            "code128",
            "code39",
            "upc_a",
            "upc_e",
            "pdf417",
            "aztec",
            "datamatrix",
          ],
        }}
      />

      {/* Abdunklungs-Overlay mit Scan-Rahmen */}
      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.overlayRow} />
        <View style={styles.overlayMiddleRow}>
          <View style={styles.overlaySide} />
          <View style={[styles.scanFrame, isPaused && styles.scanFrameActive]}>
            <ScanLine active={!isPaused} />
          </View>
          <View style={styles.overlaySide} />
        </View>
        <View style={styles.overlayRow} />
      </View>

      <SafeAreaView style={styles.topBar}>
        <Text style={styles.title}>{batchMode ? "Batch-Scan" : "Scannen"}</Text>
        <View style={styles.topBarRight}>
          <Pressable
            style={[styles.iconButton, batchMode && styles.iconButtonActive]}
            onPress={onToggleBatchMode}
          >
            <Text style={styles.iconButtonText}>
              {batchMode ? "📦 Batch An" : "📦 Batch Aus"}
            </Text>
          </Pressable>
          <Pressable
            style={styles.iconButton}
            onPress={() => setTorchOn((v) => !v)}
          >
            <Text style={styles.iconButtonText}>{torchOn ? "🔦 An" : "🔦 Aus"}</Text>
          </Pressable>
        </View>
      </SafeAreaView>

      <SafeAreaView style={styles.bottomBar}>
        <Text style={styles.hint}>
          {batchMode
            ? `${batchCount} gescannt — halte weitere Codes vor die Kamera`
            : isPaused
            ? "Code erkannt ✓"
            : "Halte einen Code in den Rahmen"}
        </Text>
        <View style={styles.bottomButtonRow}>
          {batchMode && batchCount > 0 && (
            <TouchableOpacity style={styles.batchButton} onPress={onOpenBatch}>
              <Text style={styles.historyButtonText}>Batch ansehen ({batchCount})</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.historyButton} onPress={onOpenHistory}>
            <Text style={styles.historyButtonText}>Verlauf öffnen</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    backgroundColor: "#0F172A",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    textAlign: "center",
  },
  permissionText: {
    fontSize: 15,
    color: "#94A3B8",
    textAlign: "center",
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  primaryButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  overlay: { ...StyleSheet.absoluteFillObject, flexDirection: "column" },
  overlayRow: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  overlayMiddleRow: { flexDirection: "row", height: FRAME_SIZE },
  overlaySide: { flex: 1, backgroundColor: "rgba(0,0,0,0.55)" },
  scanFrame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    borderWidth: 3,
    borderColor: "#3B82F6",
    borderRadius: 24,
    overflow: "hidden",
  },
  scanFrameActive: { borderColor: "#22C55E" },
  scanLine: {
    height: 3,
    width: "100%",
    backgroundColor: "#3B82F6",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.8,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  topBarRight: { flexDirection: "row", gap: 8 },
  iconButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  iconButtonActive: { backgroundColor: "#3B82F6" },
  iconButtonText: { color: "#fff", fontWeight: "600", fontSize: 12 },
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 20,
    gap: 12,
  },
  hint: { color: "#E2E8F0", fontSize: 15, fontWeight: "500" },
  bottomButtonRow: { flexDirection: "row", gap: 10 },
  historyButton: {
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  batchButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  historyButtonText: { color: "#fff", fontWeight: "600" },
});
