import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { isPremium, setPremium, PREMIUM_FEATURES } from "../premium";

interface Props {
  onBack: () => void;
  onNeedsPaywall: () => void;
}

export default function SettingsScreen({ onBack, onNeedsPaywall }: Props) {
  const [premium, setPremiumState] = useState(false);

  useEffect(() => {
    isPremium().then(setPremiumState);
  }, []);

  const handleResetPremium = async () => {
    await setPremium(false);
    setPremiumState(false);
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.backText}>‹ Zurück</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Einstellungen</Text>
        <View style={{ width: 60 }} />
      </View>

      <View style={styles.section}>
        <View style={styles.row}>
          <View>
            <Text style={styles.rowTitle}>Premium-Status</Text>
            <Text style={styles.rowSubtitle}>
              {premium ? "Aktiv (Demo)" : "Nicht aktiv"}
            </Text>
          </View>
          {!premium && (
            <TouchableOpacity style={styles.upgradeButton} onPress={onNeedsPaywall}>
              <Text style={styles.upgradeButtonText}>Upgrade</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {!premium && (
        <View style={styles.section}>
          <Text style={styles.featuresTitle}>Mit Premium bekommst du:</Text>
          {PREMIUM_FEATURES.map((f) => (
            <Text key={f.title} style={styles.featureLine}>
              {f.icon} {f.title}
            </Text>
          ))}
        </View>
      )}

      {premium && (
        <TouchableOpacity style={styles.resetButton} onPress={handleResetPremium}>
          <Text style={styles.resetButtonText}>Premium zurücksetzen (nur zum Testen)</Text>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  backText: { color: "#3B82F6", fontSize: 15, fontWeight: "600", width: 60 },
  title: { color: "#fff", fontSize: 17, fontWeight: "700" },
  section: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  rowTitle: { color: "#fff", fontSize: 15, fontWeight: "600" },
  rowSubtitle: { color: "#64748B", fontSize: 12, marginTop: 2 },
  upgradeButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  upgradeButtonText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  featuresTitle: { color: "#94A3B8", fontSize: 13, fontWeight: "700", marginBottom: 10 },
  featureLine: { color: "#E2E8F0", fontSize: 14, marginBottom: 8 },
  resetButton: { marginHorizontal: 20, marginTop: 8, alignItems: "center" },
  resetButtonText: { color: "#EF4444", fontSize: 13, fontWeight: "600" },
});
