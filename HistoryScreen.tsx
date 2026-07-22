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
import {
  loadHistory,
  deleteScan,
  toggleFavorite,
  clearHistory,
  assignFolder,
  setTags,
} from "../storage";
import { Folder, loadFolders, createFolder } from "../folders";
import FolderTagSheet from "./FolderTagSheet";

interface Props {
  onBack: () => void;
  refreshKey: number;
  premium: boolean;
  onNeedsPaywall: () => void;
}

type FilterMode = "all" | "favorites" | { folderId: string };

export default function HistoryScreen({
  onBack,
  refreshKey,
  premium,
  onNeedsPaywall,
}: Props) {
  const [history, setHistory] = useState<ScanEntry[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [filter, setFilter] = useState<FilterMode>("all");
  const [organizingEntry, setOrganizingEntry] = useState<ScanEntry | null>(null);

  const refresh = useCallback(async () => {
    const [data, folderData] = await Promise.all([loadHistory(), loadFolders()]);
    setHistory(data);
    setFolders(folderData);
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

  const handleOpenOrganize = (entry: ScanEntry) => {
    if (!premium) {
      onNeedsPaywall();
      return;
    }
    setOrganizingEntry(entry);
  };

  const handleAssignFolder = async (folderId: string | null) => {
    if (!organizingEntry) return;
    const updated = await assignFolder(organizingEntry.id, folderId);
    setHistory(updated);
    setOrganizingEntry(updated.find((h) => h.id === organizingEntry.id) ?? null);
  };

  const handleCreateFolder = async (name: string) => {
    const updatedFolders = await createFolder(name);
    setFolders(updatedFolders);
  };

  const handleAddTag = async (tag: string) => {
    if (!organizingEntry) return;
    const nextTags = Array.from(new Set([...organizingEntry.tags, tag]));
    const updated = await setTags(organizingEntry.id, nextTags);
    setHistory(updated);
    setOrganizingEntry(updated.find((h) => h.id === organizingEntry.id) ?? null);
  };

  const handleRemoveTag = async (tag: string) => {
    if (!organizingEntry) return;
    const nextTags = organizingEntry.tags.filter((t) => t !== tag);
    const updated = await setTags(organizingEntry.id, nextTags);
    setHistory(updated);
    setOrganizingEntry(updated.find((h) => h.id === organizingEntry.id) ?? null);
  };

  const visibleHistory = history.filter((h) => {
    if (filter === "all") return true;
    if (filter === "favorites") return h.isFavorite;
    return h.folderId === filter.folderId;
  });

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const folderById = (id?: string | null) => folders.find((f) => f.id === id);

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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterRow}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
        data={[{ key: "all" }, { key: "favorites" }, ...folders.map((f) => ({ key: f.id, folder: f }))]}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => {
          if (item.key === "all") {
            const active = filter === "all";
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter("all")}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  Alle ({history.length})
                </Text>
              </TouchableOpacity>
            );
          }
          if (item.key === "favorites") {
            const active = filter === "favorites";
            return (
              <TouchableOpacity
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setFilter("favorites")}
              >
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                  ★ Favoriten ({history.filter((h) => h.isFavorite).length})
                </Text>
              </TouchableOpacity>
            );
          }
          const folder = item.folder!;
          const active = typeof filter === "object" && filter.folderId === folder.id;
          const count = history.filter((h) => h.folderId === folder.id).length;
          return (
            <TouchableOpacity
              style={[
                styles.filterChip,
                active && { backgroundColor: folder.color },
              ]}
              onPress={() => setFilter({ folderId: folder.id })}
            >
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>
                📁 {folder.name} ({count})
              </Text>
            </TouchableOpacity>
          );
        }}
      />

      <FlatList
        data={visibleHistory}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              {filter === "favorites"
                ? "Noch keine Favoriten markiert."
                : typeof filter === "object"
                ? "In diesem Ordner ist noch nichts."
                : "Noch keine Scans vorhanden."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const folder = folderById(item.folderId);
          return (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardType}>{item.type.toUpperCase()}</Text>
                <Text style={styles.cardDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <Text style={styles.cardValue} numberOfLines={2}>
                {item.value}
              </Text>

              {(folder || item.tags.length > 0) && (
                <View style={styles.badgeRow}>
                  {folder && (
                    <View style={[styles.folderBadge, { backgroundColor: folder.color }]}>
                      <Text style={styles.folderBadgeText}>📁 {folder.name}</Text>
                    </View>
                  )}
                  {item.tags.map((tag) => (
                    <View key={tag} style={styles.tagBadge}>
                      <Text style={styles.tagBadgeText}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.cardActions}>
                <TouchableOpacity onPress={() => handleToggleFavorite(item.id)}>
                  <Text style={styles.actionText}>
                    {item.isFavorite ? "★ Favorit" : "☆ Merken"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpenOrganize(item)}>
                  <Text style={styles.actionText}>
                    🗂️ Organisieren{!premium ? " ✦" : ""}
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
          );
        }}
      />

      {organizingEntry && (
        <FolderTagSheet
          entry={organizingEntry}
          folders={folders}
          onAssignFolder={handleAssignFolder}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          onCreateFolder={handleCreateFolder}
          onClose={() => setOrganizingEntry(null)}
        />
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
    paddingVertical: 12,
  },
  backButton: {},
  backButtonText: { color: "#3B82F6", fontSize: 16, fontWeight: "600" },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  clearText: { color: "#EF4444", fontSize: 15, fontWeight: "600" },
  filterRow: { flexGrow: 0, marginBottom: 8 },
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
  cardValue: { color: "#fff", fontSize: 15, marginBottom: 10 },
  badgeRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 10 },
  folderBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  folderBadgeText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  tagBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: "rgba(59,130,246,0.2)",
  },
  tagBadgeText: { color: "#93C5FD", fontSize: 11, fontWeight: "700" },
  cardActions: { flexDirection: "row", gap: 16, flexWrap: "wrap" },
  actionText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  deleteText: { color: "#EF4444" },
});
