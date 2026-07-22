import React, { useEffect, useState, useMemo } from "react";
import { StyleSheet, View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { loadHistory } from "../storage";
import { ScanEntry } from "../types";

interface Props {
  refreshKey: number;
}

function getLastNDaysCounts(entries: ScanEntry[], days: number): number[] {
  const now = new Date();
  now.setHours(23, 59, 59, 999);
  const counts = new Array(days).fill(0);

  for (const entry of entries) {
    const diffMs = now.getTime() - entry.createdAt;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < days) {
      counts[days - 1 - diffDays] += 1;
    }
  }
  return counts;
}

export default function StatsScreen({ refreshKey }: Props) {
  const [entries, setEntries] = useState<ScanEntry[]>([]);

  useEffect(() => {
    loadHistory().then(setEntries);
  }, [refreshKey]);

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of entries) {
      counts[e.type] = (counts[e.type] ?? 0) + 1;
    }
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [entries]);

  const weekCounts = useMemo(() => getLastNDaysCounts(entries, 7), [entries]);
  const maxWeekCount = Math.max(...weekCounts, 1);
  const maxTypeCount = Math.max(...typeCounts.map(([, c]) => c), 1);

  const favoritesCount = entries.filter((e) => e.isFavorite).length;
  const totalCount = entries.length;
  const todayCount = weekCounts[weekCounts.length - 1];

  const dayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
  const todayIndex = (new Date().getDay() + 6) % 7; // Montag = 0
  const labelsForBars = Array.from({ length: 7 }, (_, i) => {
    const idx = (todayIndex - 6 + i + 7) % 7;
    return dayLabels[idx];
  });

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Statistik</Text>

        <View style={styles.statRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Scans gesamt</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{todayCount}</Text>
            <Text style={styles.statLabel}>Heute</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{favoritesCount}</Text>
            <Text style={styles.statLabel}>Favoriten</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Letzte 7 Tage</Text>
        <View style={styles.chartCard}>
          <View style={styles.barRow}>
            {weekCounts.map((count, i) => (
              <View key={i} style={styles.barColumn}>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.bar,
                      { height: `${(count / maxWeekCount) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.barValue}>{count}</Text>
                <Text style={styles.barLabel}>{labelsForBars[i]}</Text>
              </View>
            ))}
          </View>
        </View>

        <Text style={styles.sectionTitle}>Code-Typen</Text>
        <View style={styles.chartCard}>
          {typeCounts.length === 0 ? (
            <Text style={styles.emptyText}>Noch keine Daten vorhanden.</Text>
          ) : (
            typeCounts.map(([type, count]) => (
              <View key={type} style={styles.typeRow}>
                <Text style={styles.typeLabel}>{type.toUpperCase()}</Text>
                <View style={styles.typeBarTrack}>
                  <View
                    style={[
                      styles.typeBar,
                      { width: `${(count / maxTypeCount) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.typeCount}>{count}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  statRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  statValue: { color: "#3B82F6", fontSize: 24, fontWeight: "800" },
  statLabel: { color: "#94A3B8", fontSize: 12, marginTop: 4, textAlign: "center" },
  sectionTitle: {
    color: "#E2E8F0",
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },
  chartCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
  },
  barRow: { flexDirection: "row", justifyContent: "space-between", height: 140 },
  barColumn: { alignItems: "center", flex: 1, justifyContent: "flex-end" },
  barTrack: {
    width: 14,
    height: 90,
    justifyContent: "flex-end",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 7,
    overflow: "hidden",
  },
  bar: { width: "100%", backgroundColor: "#3B82F6", borderRadius: 7 },
  barValue: { color: "#fff", fontSize: 11, fontWeight: "700", marginTop: 6 },
  barLabel: { color: "#64748B", fontSize: 11, marginTop: 2 },
  emptyText: { color: "#64748B", fontSize: 14, textAlign: "center", padding: 8 },
  typeRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  typeLabel: { color: "#94A3B8", fontSize: 11, fontWeight: "700", width: 70 },
  typeBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 5,
    overflow: "hidden",
  },
  typeBar: { height: "100%", backgroundColor: "#3B82F6", borderRadius: 5 },
  typeCount: { color: "#fff", fontSize: 12, fontWeight: "700", width: 24, textAlign: "right" },
});
