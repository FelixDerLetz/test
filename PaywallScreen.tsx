import React from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { PREMIUM_FEATURES, setPremium } from "../premium";

interface Props {
  onClose: () => void;
  onActivated: () => void;
}

export default function PaywallScreen({ onClose, onActivated }: Props) {
  const handleActivateDemo = async () => {
    await setPremium(true);
    onActivated();
  };

  return (
    <View style={styles.backdrop}>
      <SafeAreaView style={styles.sheet} edges={["bottom"]}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.eyebrow}>PREMIUM</Text>
        <Text style={styles.title}>Hol dir alle Funktionen</Text>

        <View style={styles.featureList}>
          {PREMIUM_FEATURES.map((f) => (
            <View key={f.title} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <View style={styles.featureTextBlock}>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureText}>{f.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={handleActivateDemo}>
          <Text style={styles.ctaButtonText}>Premium freischalten (Demo)</Text>
        </TouchableOpacity>
        <Text style={styles.demoHint}>
          Demo-Modus: schaltet lokal frei, ohne echte Zahlung. Für den echten
          Store-Release wird das durch In-App-Käufe ersetzt.
        </Text>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  closeButton: { position: "absolute", top: 16, right: 16, zIndex: 1 },
  closeButtonText: { color: "#64748B", fontSize: 18 },
  eyebrow: { color: "#3B82F6", fontSize: 12, fontWeight: "800", letterSpacing: 1 },
  title: { color: "#fff", fontSize: 24, fontWeight: "800", marginTop: 6, marginBottom: 24 },
  featureList: { gap: 18, marginBottom: 28 },
  featureRow: { flexDirection: "row", gap: 14, alignItems: "flex-start" },
  featureIcon: { fontSize: 26 },
  featureTextBlock: { flex: 1 },
  featureTitle: { color: "#fff", fontSize: 15, fontWeight: "700", marginBottom: 2 },
  featureText: { color: "#94A3B8", fontSize: 13, lineHeight: 18 },
  ctaButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
  },
  ctaButtonText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  demoHint: { color: "#4B5563", fontSize: 11, textAlign: "center", paddingBottom: 8 },
});
