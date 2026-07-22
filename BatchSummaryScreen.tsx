import React from "react";
import { StyleSheet, View, Text, FlatList, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScanEntry } from "../types";
import { shareBatchAsCsv } from "../export";
import { contentKindLabel, detectContent } from "../contentDetector";

interface Props {
  batch: ScanEntry[];
  onDone: () => void;
  onRemove: (id: string) => void;
}

export default function BatchSummaryScreen({ batch, onDone, onRemove }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <Text style={styles.title}>Batch-Scan</Text>
        <Text style={styles.subtitle}>{batch.length} Codes gesammelt</Text>
      </View>

      <FlatList
        data={batch}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>
              Noch nichts gescannt. Halte einfach nacheinander mehrere Codes vor
              die Kamera.
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const detected = detectContent(item.value);
          return (
            <View style={styles.row}>
              <View style={styles.rowIndex}>
                <Text style={styles.rowIndexText}>{index + 1}</Text>
              </View>
              <View style={styles.rowContent}>
                <Text style={styles.rowKind}>
                  {contentKindLabel(detected.kind)} · {item.type.toUpperCase()}
                </Text>
                <Text style={styles.rowValue} numberOfLines={1}>
                  {item.value}
                </Text>
              </View>
              <TouchableOpacity onPress={() => onRemove(item.id)}>
                <Text style={styles.removeText}>✕</Text>
              </TouchableOpacity>
            </View>
          );
        }}
      />

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.exportButton, batch.length === 0 && styles.disabledButton]}
          disabled={batch.length === 0}
          onPress={() => shareBatchAsCsv(batch)}
        >
          <Text style={styles.exportButtonText}>Als CSV teilen/exportieren</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={onDone}>
          <Text style={styles.doneButtonText}>Fertig — zurück zum Scannen</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  header: { paddingHorizontal: 20, paddingVertical: 16 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700" },
  subtitle: { color: "#94A3B8", fontSize: 14, marginTop: 2 },
  listContent: { padding: 20, paddingTop: 4, gap: 10 },
  emptyState: { alignItems: "center", marginTop: 60, paddingHorizontal: 20 },
  emptyStateText: { color: "#64748B", fontSize: 14, textAlign: "center" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  rowIndex: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  rowIndexText: { color: "#fff", fontWeight: "700", fontSize: 12 },
  rowContent: { flex: 1 },
  rowKind: { color: "#3B82F6", fontSize: 11, fontWeight: "700", marginBottom: 2 },
  rowValue: { color: "#fff", fontSize: 14 },
  removeText: { color: "#64748B", fontSize: 16, paddingHorizontal: 6 },
  footer: { padding: 20, gap: 10 },
  exportButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  disabledButton: { opacity: 0.4 },
  exportButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  doneButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  doneButtonText: { color: "#E2E8F0", fontWeight: "600", fontSize: 15 },
});
