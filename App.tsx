import React, { useState, useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { View, StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultSheet from "./src/screens/ResultSheet";
import BatchSummaryScreen from "./src/screens/BatchSummaryScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import GenerateScreen from "./src/screens/GenerateScreen";
import StatsScreen from "./src/screens/StatsScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import PaywallScreen from "./src/screens/PaywallScreen";
import TabBar, { TabKey } from "./src/components/TabBar";

import { addScan } from "./src/storage";
import { isPremium } from "./src/premium";
import { ScanEntry, ScanType } from "./src/types";

const ONBOARDING_KEY = "@scan_app/onboarding_seen";

type Overlay = "none" | "batch" | "settings" | "paywall";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  const [tab, setTab] = useState<TabKey>("scan");
  const [overlay, setOverlay] = useState<Overlay>("none");

  const [lastResult, setLastResult] = useState<{ value: string; type: string } | null>(
    null
  );
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [batchMode, setBatchMode] = useState(false);
  const [batch, setBatch] = useState<ScanEntry[]>([]);

  const [premium, setPremiumState] = useState(false);

  useEffect(() => {
    (async () => {
      const [onboardingSeen, premiumStatus] = await Promise.all([
        AsyncStorage.getItem(ONBOARDING_KEY),
        isPremium(),
      ]);
      setShowOnboarding(onboardingSeen !== "true");
      setPremiumState(premiumStatus);
    })();
  }, []);

  const handleOnboardingDone = () => {
    AsyncStorage.setItem(ONBOARDING_KEY, "true");
    setShowOnboarding(false);
  };

  const handleScanned = useCallback(
    async (value: string, type: ScanType) => {
      const updated = await addScan({ value, type });
      setHistoryRefreshKey((k) => k + 1);

      if (batchMode) {
        const justAdded = updated[0];
        setBatch((prev) => [justAdded, ...prev]);
      } else {
        setLastResult({ value, type });
      }
    },
    [batchMode]
  );

  const refreshPremium = useCallback(async () => {
    setPremiumState(await isPremium());
  }, []);

  const handleTabPress = (nextTab: TabKey) => {
    if ((nextTab === "generate" || nextTab === "stats") && !premium) {
      setOverlay("paywall");
      return;
    }
    setTab(nextTab);
  };

  if (showOnboarding === null) {
    return (
      <SafeAreaProvider>
        <View style={styles.blank} />
      </SafeAreaProvider>
    );
  }

  if (showOnboarding) {
    return (
      <SafeAreaProvider>
        <StatusBar style="light" />
        <OnboardingScreen onDone={handleOnboardingDone} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <View style={styles.root}>
        <View style={styles.content}>
          {overlay === "settings" ? (
            <SettingsScreen
              onBack={() => setOverlay("none")}
              onNeedsPaywall={() => setOverlay("paywall")}
            />
          ) : (
            <>
              {tab === "scan" && (
                <ScanScreen
                  onScanned={handleScanned}
                  onOpenHistory={() => setTab("history")}
                  batchMode={batchMode}
                  onToggleBatchMode={() => setBatchMode((v) => !v)}
                  batchCount={batch.length}
                  onOpenBatch={() => setOverlay("batch")}
                />
              )}
              {tab === "generate" && <GenerateScreen />}
              {tab === "stats" && <StatsScreen refreshKey={historyRefreshKey} />}
              {tab === "history" && (
                <HistoryScreen
                  onBack={() => setTab("scan")}
                  refreshKey={historyRefreshKey}
                  premium={premium}
                  onNeedsPaywall={() => setOverlay("paywall")}
                />
              )}
            </>
          )}
        </View>

        {overlay !== "settings" && (
          <TabBar active={tab} onChange={handleTabPress} onSettings={() => setOverlay("settings")} />
        )}
      </View>

      {overlay === "batch" && (
        <View style={styles.overlayFill}>
          <BatchSummaryScreen
            batch={batch}
            onRemove={(id) => setBatch((prev) => prev.filter((b) => b.id !== id))}
            onDone={() => setOverlay("none")}
          />
        </View>
      )}

      {overlay === "paywall" && (
        <PaywallScreen
          onClose={() => setOverlay("none")}
          onActivated={async () => {
            await refreshPremium();
            setOverlay("none");
          }}
        />
      )}

      {tab === "scan" && overlay === "none" && !batchMode && lastResult && (
        <ResultSheet entry={lastResult} onClose={() => setLastResult(null)} />
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  blank: { flex: 1, backgroundColor: "#0F172A" },
  root: { flex: 1, backgroundColor: "#0F172A" },
  content: { flex: 1 },
  overlayFill: { ...StyleSheet.absoluteFillObject, backgroundColor: "#0F172A" },
});
