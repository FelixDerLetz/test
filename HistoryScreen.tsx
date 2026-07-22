import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScanEntry } from "../types";
import { loadHistory, deleteScan, toggleFavorite, clearHistory } from "../storage";

interface Props {
  onBack: () => void;
  refreshKey: number;
}

export default function HistoryScreen({ onBack, refreshKey }: Props) {
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  const refresh = useCallback(async () => {
    const data = await loadHistory();
    setHistory(data);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh, refreshKey]);

  const handleDelete = async (id: string) => {
    const updated = await deleteScan(id);
    setHistory(updated);
  };

  const handleToggleFavorite = async (id: string) => {
    const updated = await toggleFavorite(id);
    setHistory(updated);
  };

  const handleClearAll = () => {
    Alert.alert(
      "Verlauf löschen",
      "Möchtest du wirklich alle gespeicherten Scans löschen?",
      [
        { text: "Abbrechen", style: "cancel" },
        {
          text: "Löschen",
          style: "destructive",
          onPress: async () => {
            await clearHistory();
            setHistory([]);
          },
        },
      ]
    );
  };

  const handleShare = async (entry: ScanEntry) => {
    try {
      await Share.share({ message: entry.value });
    } catch (error) {
      console.error("Teilen fehlgeschlagen:", error);
    }
  };

  const visibleHistory =
    filter === "favorites" ? history.filter((h) => h.isFavorite) : history;

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>‹ Scannen</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Verlauf</Text>
        <TouchableOpacity onPress={handleClearAll}>
          <Text style={styles.clearText}>Löschen</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[styles.filterChip, filter === "all" && styles.filterChipActive]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "all" && styles.filterChipTextActive,
            ]}
          >
            Alle ({history.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === "favorites" && styles.filterChipActive,
          ]}
          onPress={() => setFilter("favorites")}
        >
          <Text
            style={[
              styles.filterChipText,
              filter === "favorites" && styles.filterChipTextActive,
            ]}
          >
            ★ Favoriten ({history.filter((h) => h.isFavorite).length})
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={visibleHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === "favorites"
                ? "Noch keine Favoriten markiert."
                : "Noch keine Scans vorhanden."}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
              <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
            </View>
            <Text style={styles.cardValue} numberOfLines={2}>
              {item.value}
            </Text>
            <View style={styles.cardActions}>
              <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
                <Text style={styles.actionText}>
                  {item.isFavorite ? "★ Favorit" : "☆ Merken"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleShare(item)}>
                <Text style={styles.actionText}>Teilen</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Text style={[styles.actionText, styles.deleteText]}>Löschen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
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
    paddingVertical: 12,
  },
  backButton: {},
  backButtonText: { color: "#3B82F6", fontSize: 16, fontWeight: "600" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  clearText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
  filterRow: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  filterChipActive: { backgroundColor: "#3B82F6" },
  filterChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  filterChipTextActive: { color: "#fff" },
  listContent: { padding: 20, paddingTop: 8, gap: 12 },
  emptyState: { alignItems: "center", marginTop: 80 },
  emptyStateText: { color: "#64748B", fontSize: 15 },
  card: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardType: { color: "#3B82F6", fontSize: 12, fontWeight: "700" },
  cardDate: { color: "#64748B", fontSize: 12 },
  cardValue: { color: "#fff", fontSize: 15, marginBottom: 12 },
  cardActions: { flexDirection: "row", gap: 20 },
  actionText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  deleteText: { color: "#EF4444" },
});
