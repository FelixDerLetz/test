import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import QRCode from "react-native-qrcode-svg";
import ViewShot from "react-native-view-shot";

type GenMode = "url" | "wifi" | "vcard" | "text";

const MODES: { key: GenMode; label: string }[] = [
  { key: "url", label: "Link" },
  { key: "wifi", label: "WLAN" },
  { key: "vcard", label: "Kontakt" },
  { key: "text", label: "Text" },
];

export default function GenerateScreen() {
  const [mode, setMode] = useState<GenMode>("url");
  const [url, setUrl] = useState("https://");
  const [ssid, setSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const shotRef = useRef<ViewShot>(null);

  const buildValue = (): string => {
    switch (mode) {
      case "url":
        return url.trim();
      case "wifi":
        return `WIFI:T:WPA;S:${ssid.trim()};P:${wifiPassword.trim()};;`;
      case "vcard":
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${name.trim()}\nTEL:${phone.trim()}\nEMAIL:${email.trim()}\nEND:VCARD`;
      case "text":
        return text.trim();
    }
  };

  const value = buildValue();
  const hasContent = value.replace(/^https?:\/\/$/, "").length > 0;

  const handleShareImage = async () => {
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri) {
        await Share.share({ url: uri, title: "Mein QR-Code" });
      }
    } catch (error) {
      console.error("Teilen des QR-Codes fehlgeschlagen:", error);
    }
  };

  const handleShareText = async () => {
    await Share.share({ message: value });
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>QR-Code erstellen</Text>

        <View style={styles.modeRow}>
          {MODES.map((m) => (
            <TouchableOpacity
              key={m.key}
              style={[styles.modeChip, mode === m.key && styles.modeChipActive]}
              onPress={() => setMode(m.key)}
            >
              <Text
                style={[
                  styles.modeChipText,
                  mode === m.key && styles.modeChipTextActive,
                ]}
              >
                {m.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.form}>
          {mode === "url" && (
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://beispiel.de"
              placeholderTextColor="#64748B"
              autoCapitalize="none"
              keyboardType="url"
            />
          )}

          {mode === "wifi" && (
            <>
              <TextInput
                style={styles.input}
                value={ssid}
                onChangeText={setSsid}
                placeholder="Netzwerkname (SSID)"
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={styles.input}
                value={wifiPassword}
                onChangeText={setWifiPassword}
                placeholder="Passwort"
                placeholderTextColor="#64748B"
                secureTextEntry
              />
            </>
          )}

          {mode === "vcard" && (
            <>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Name"
                placeholderTextColor="#64748B"
              />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Telefonnummer"
                placeholderTextColor="#64748B"
                keyboardType="phone-pad"
              />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="E-Mail"
                placeholderTextColor="#64748B"
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </>
          )}

          {mode === "text" && (
            <TextInput
              style={[styles.input, styles.textArea]}
              value={text}
              onChangeText={setText}
              placeholder="Beliebiger Text..."
              placeholderTextColor="#64748B"
              multiline
              numberOfLines={4}
            />
          )}
        </View>

        {hasContent && (
          <View style={styles.previewSection}>
            <ViewShot
              ref={shotRef}
              options={{ format: "png", quality: 1 }}
              style={styles.qrCard}
            >
              <QRCode value={value} size={220} backgroundColor="#fff" />
            </ViewShot>

            <View style={styles.shareRow}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareImage}>
                <Text style={styles.shareButtonText}>Als Bild teilen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.shareButton, styles.shareButtonSecondary]}
                onPress={handleShareText}
              >
                <Text style={styles.shareButtonText}>Inhalt teilen</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  scrollContent: { padding: 20, paddingBottom: 60 },
  title: { color: "#fff", fontSize: 22, fontWeight: "700", marginBottom: 16 },
  modeRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  modeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  modeChipActive: { backgroundColor: "#3B82F6" },
  modeChipText: { color: "#94A3B8", fontSize: 13, fontWeight: "600" },
  modeChipTextActive: { color: "#fff" },
  form: { gap: 12, marginBottom: 24 },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#fff",
    fontSize: 15,
  },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  previewSection: { alignItems: "center", gap: 20 },
  qrCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  shareRow: { flexDirection: "row", gap: 10 },
  shareButton: {
    backgroundColor: "#3B82F6",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareButtonSecondary: { backgroundColor: "rgba(255,255,255,0.1)" },
  shareButtonText: { color: "#fff", fontWeight: "600", fontSize: 14 },
});
