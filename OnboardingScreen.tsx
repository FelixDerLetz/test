import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

interface Slide {
  icon: string;
  title: string;
  text: string;
}

const SLIDES: Slide[] = [
  {
    icon: "🎯",
    title: "Alles im Blick",
    text: "Halte QR-Codes oder Barcodes einfach vor die Kamera — erkannt wird automatisch, ganz ohne Auslöser.",
  },
  {
    icon: "📦",
    title: "Batch-Scan",
    text: "Aktiviere den Batch-Modus, um mehrere Codes am Stück zu sammeln, z. B. für eine Inventur — danach als CSV exportieren.",
  },
  {
    icon: "⚡",
    title: "Smart erkannt",
    text: "WLAN-Zugänge, Kontakte, E-Mails und Telefonnummern werden erkannt — du bekommst direkt die passende Aktion, nicht nur Rohtext.",
  },
];

interface Props {
  onDone: () => void;
}

export default function OnboardingScreen({ onDone }: Props) {
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList<Slide>>(null);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    if (newIndex !== index) setIndex(newIndex);
  };

  const goNext = () => {
    if (index < SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1, animated: true });
    } else {
      onDone();
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <TouchableOpacity style={styles.skip} onPress={onDone}>
        <Text style={styles.skipText}>Überspringen</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={SLIDES}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <View style={styles.slide}>
            <Text style={styles.emoji}>{item.icon}</Text>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.text}>{item.text}</Text>
          </View>
        )}
      />

      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === index && styles.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={goNext}>
        <Text style={styles.buttonText}>
          {index === SLIDES.length - 1 ? "Los geht's" : "Weiter"}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0F172A" },
  skip: { alignSelf: "flex-end", paddingHorizontal: 24, paddingTop: 8 },
  skipText: { color: "#64748B", fontSize: 14, fontWeight: "600" },
  slide: {
    width,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emoji: { fontSize: 64, marginBottom: 24 },
  title: { color: "#fff", fontSize: 24, fontWeight: "700", marginBottom: 12 },
  text: {
    color: "#94A3B8",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  dots: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  dotActive: { backgroundColor: "#3B82F6", width: 20 },
  button: {
    backgroundColor: "#3B82F6",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
