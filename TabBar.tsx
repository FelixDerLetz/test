import React from "react";
import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type TabKey = "scan" | "generate" | "stats" | "history";

interface Tab {
  key: TabKey;
  label: string;
  icon: string;
  premium?: boolean;
}

const TABS: Tab[] = [
  { key: "scan", label: "Scannen", icon: "🎯" },
  { key: "generate", label: "Erstellen", icon: "🔳", premium: true },
  { key: "stats", label: "Statistik", icon: "📊", premium: true },
  { key: "history", label: "Verlauf", icon: "🕓" },
];

interface Props {
  active: TabKey;
  onChange: (tab: TabKey) => void;
  onSettings: () => void;
}

export default function TabBar({ active, onChange, onSettings }: Props) {
  return (
    <SafeAreaView edges={["bottom"]} style={styles.wrapper}>
      <View style={styles.bar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={styles.tab}
            onPress={() => onChange(tab.key)}
          >
            <Text style={styles.icon}>{tab.icon}</Text>
            <Text style={[styles.label, active === tab.key && styles.labelActive]}>
              {tab.label}
              {tab.premium ? " ✦" : ""}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.tab} onPress={onSettings}>
          <Text style={styles.icon}>⚙️</Text>
          <Text style={styles.label}>Mehr</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#0B1220", borderTopWidth: 1, borderTopColor: "#1E293B" },
  bar: { flexDirection: "row", paddingTop: 8, paddingBottom: 4 },
  tab: { flex: 1, alignItems: "center", gap: 2 },
  icon: { fontSize: 18 },
  label: { color: "#64748B", fontSize: 10, fontWeight: "600" },
  labelActive: { color: "#3B82F6" },
});
