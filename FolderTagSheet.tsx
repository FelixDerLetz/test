import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from "react-native";
import { Folder } from "../folders";
import { ScanEntry } from "../types";

interface Props {
  entry: ScanEntry;
  folders: Folder[];
  onAssignFolder: (folderId: string | null) => void;
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  onCreateFolder: (name: string) => void;
  onClose: () => void;
}

export default function FolderTagSheet({
  entry,
  folders,
  onAssignFolder,
  onAddTag,
  onRemoveTag,
  onCreateFolder,
  onClose,
}: Props) {
  const [newFolderName, setNewFolderName] = useState("");
  const [newTag, setNewTag] = useState("");

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    onCreateFolder(newFolderName.trim());
    setNewFolderName("");
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    onAddTag(newTag.trim());
    setNewTag("");
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <Text style={styles.title}>Organisieren</Text>
        <Text style={styles.valuePreview} numberOfLines={1}>
          {entry.value}
        </Text>

        <ScrollView style={styles.scroll}>
          <Text style={styles.sectionLabel}>Ordner</Text>
          <View style={styles.chipsWrap}>
            <TouchableOpacity
              style={[styles.chip, !entry.folderId && styles.chipActive]}
              onPress={() => onAssignFolder(null)}
            >
              <Text style={styles.chipText}>Kein Ordner</Text>
            </TouchableOpacity>
            {folders.map((folder) => (
              <TouchableOpacity
                key={folder.id}
                style={[
                  styles.chip,
                  entry.folderId === folder.id && {
                    backgroundColor: folder.color,
                  },
                ]}
                onPress={() => onAssignFolder(folder.id)}
              >
                <Text style={styles.chipText}>📁 {folder.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inlineRow}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Neuer Ordner..."
              placeholderTextColor="#64748B"
              value={newFolderName}
              onChangeText={setNewFolderName}
              onSubmitEditing={handleCreateFolder}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleCreateFolder}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionLabel, { marginTop: 20 }]}>Tags</Text>
          <View style={styles.chipsWrap}>
            {entry.tags.length === 0 && (
              <Text style={styles.emptyTagsText}>Noch keine Tags.</Text>
            )}
            {entry.tags.map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.tagChip}
                onPress={() => onRemoveTag(tag)}
              >
                <Text style={styles.chipText}>#{tag} ✕</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.inlineRow}>
            <TextInput
              style={styles.inlineInput}
              placeholder="Neuer Tag..."
              placeholderTextColor="#64748B"
              value={newTag}
              onChangeText={setNewTag}
              onSubmitEditing={handleAddTag}
            />
            <TouchableOpacity style={styles.addButton} onPress={handleAddTag}>
              <Text style={styles.addButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.doneButton} onPress={onClose}>
          <Text style={styles.doneButtonText}>Fertig</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#111827",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "75%",
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#374151",
    alignSelf: "center",
    marginBottom: 16,
  },
  title: { color: "#fff", fontSize: 18, fontWeight: "700" },
  valuePreview: { color: "#64748B", fontSize: 13, marginTop: 2, marginBottom: 16 },
  scroll: { marginBottom: 12 },
  sectionLabel: { color: "#94A3B8", fontSize: 12, fontWeight: "700", marginBottom: 10 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  chipActive: { backgroundColor: "#3B82F6" },
  chipText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "rgba(59,130,246,0.25)",
  },
  emptyTagsText: { color: "#4B5563", fontSize: 13 },
  inlineRow: { flexDirection: "row", gap: 8 },
  inlineInput: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: "#fff",
    fontSize: 14,
  },
  addButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  addButtonText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  doneButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  doneButtonText: { color: "#E2E8F0", fontWeight: "600", fontSize: 15 },
});
