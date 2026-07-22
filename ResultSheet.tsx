import React from "react";
import { StyleSheet, View, Text, TouchableOpacity, Linking } from "react-native";
import { detectContent, contentKindLabel } from "../contentDetector";

interface Props {
  entry: { value: string; type: string };
  onClose: () => void;
}

export default function ResultSheet({ entry, onClose }: Props) {
  const detected = detectContent(entry.value);

  const renderActions = () => {
    switch (detected.kind) {
      case "url":
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(detected.raw)}
          >
            <Text style={styles.primaryButtonText}>Link öffnen</Text>
          </TouchableOpacity>
        );

      case "wifi":
        return (
          <View style={styles.infoBox}>
            <Text style={styles.infoRow}>
              Netzwerk: <Text style={styles.infoValue}>{detected.wifi?.ssid}</Text>
            </Text>
            {detected.wifi?.password ? (
              <Text style={styles.infoRow} selectable>
                Passwort:{" "}
                <Text style={styles.infoValue} selectable>
                  {detected.wifi.password}
                </Text>
              </Text>
            ) : (
              <Text style={styles.infoRow}>Kein Passwort hinterlegt</Text>
            )}
            <Text style={styles.hintText}>
              Automatisches Verbinden ist aus Sicherheitsgründen nicht möglich —
              bitte manuell in den WLAN-Einstellungen auswählen.
            </Text>
          </View>
        );

      case "vcard":
        return (
          <View style={styles.infoBox}>
            {detected.vcard?.name && (
              <Text style={styles.infoRow}>
                Name: <Text style={styles.infoValue}>{detected.vcard.name}</Text>
              </Text>
            )}
            {detected.vcard?.org && (
              <Text style={styles.infoRow}>
                Firma: <Text style={styles.infoValue}>{detected.vcard.org}</Text>
              </Text>
            )}
            {detected.vcard?.phone && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`tel:${detected.vcard?.phone}`)}
              >
                <Text style={styles.linkRow}>📞 {detected.vcard.phone}</Text>
              </TouchableOpacity>
            )}
            {detected.vcard?.email && (
              <TouchableOpacity
                onPress={() => Linking.openURL(`mailto:${detected.vcard?.email}`)}
              >
                <Text style={styles.linkRow}>✉️ {detected.vcard.email}</Text>
              </TouchableOpacity>
            )}
          </View>
        );

      case "email":
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(`mailto:${detected.email}`)}
          >
            <Text style={styles.primaryButtonText}>E-Mail schreiben</Text>
          </TouchableOpacity>
        );

      case "phone":
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => Linking.openURL(`tel:${detected.phone}`)}
          >
            <Text style={styles.primaryButtonText}>Anrufen</Text>
          </TouchableOpacity>
        );

      case "sms":
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              Linking.openURL(
                `sms:${detected.phone}${
                  detected.smsBody ? `?body=${encodeURIComponent(detected.smsBody)}` : ""
                }`
              )
            }
          >
            <Text style={styles.primaryButtonText}>SMS öffnen</Text>
          </TouchableOpacity>
        );

      case "geo":
        return (
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() =>
              Linking.openURL(
                `https://maps.google.com/?q=${detected.geo?.lat},${detected.geo?.lng}`
              )
            }
          >
            <Text style={styles.primaryButtonText}>In Karten öffnen</Text>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.sheet}>
        <Text style={styles.type}>{contentKindLabel(detected.kind).toUpperCase()}</Text>
        <Text style={styles.value} selectable numberOfLines={4}>
          {entry.value}
        </Text>

        <View style={styles.actions}>
          {renderActions()}
          <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
            <Text style={styles.secondaryButtonText}>Weiter scannen</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 40,
    gap: 16,
  },
  type: { color: "#3B82F6", fontSize: 13, fontWeight: "700" },
  value: { color: "#fff", fontSize: 18, fontWeight: "500" },
  actions: { gap: 10, marginTop: 8 },
  infoBox: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 12,
    padding: 14,
    gap: 8,
  },
  infoRow: { color: "#94A3B8", fontSize: 14 },
  infoValue: { color: "#fff", fontWeight: "600" },
  linkRow: { color: "#3B82F6", fontSize: 15, fontWeight: "600" },
  hintText: { color: "#64748B", fontSize: 12, marginTop: 4 },
  primaryButton: {
    backgroundColor: "#3B82F6",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  secondaryButton: {
    backgroundColor: "rgba(255,255,255,0.08)",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryButtonText: { color: "#E2E8F0", fontWeight: "600", fontSize: 16 },
});
