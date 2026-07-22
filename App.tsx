import React, { useState, useCallback, useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultSheet from "./src/screens/ResultSheet";
import BatchSummaryScreen from "./src/screens/BatchSummaryScreen";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import { addScan } from "./src/storage";
import { RootScreen, ScanEntry, ScanType } from "./src/types";

const ONBOARDING_KEY = "@scan_app/onboarding_seen";

type Screen = RootScreen | "batch";

export default function App() {
  const [screen, setScreen] = useState<Screen>("scan");
  const [lastResult, setLastResult] = useState<{ value: string; type: string } | null>(
    null
  );
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [batchMode, setBatchMode] = useState(false);
  const [batch, setBatch] = useState<ScanEntry[]>([]);

  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(ONBOARDING_KEY).then((value) => {
      setShowOnboarding(value !== "true");
    });
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
        // Im Batch-Modus: neu gespeicherten Eintrag zur aktuellen Session hinzufügen,
        // aber KEIN Ergebnis-Sheet zeigen — das würde den Scan-Fluss unterbrechen.
        const justAdded = updated[0];
        setBatch((prev) => [justAdded, ...prev]);
      } else {
        setLastResult({ value, type });
      }
    },
    [batchMode]
  );

  const handleToggleBatchMode = () => {
    setBatchMode((v) => !v);
  };

  const handleRemoveFromBatch = (id: string) => {
    setBatch((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {showOnboarding === null ? null : showOnboarding ? (
        <OnboardingScreen onDone={handleOnboardingDone} />
      ) : (
        <>
          {screen === "scan" && (
            <ScanScreen
              onScanned={handleScanned}
              onOpenHistory={() => setScreen("history")}
              batchMode={batchMode}
              onToggleBatchMode={handleToggleBatchMode}
              batchCount={batch.length}
              onOpenBatch={() => setScreen("batch")}
            />
          )}

          {screen === "history" && (
            <HistoryScreen
              onBack={() => setScreen("scan")}
              refreshKey={historyRefreshKey}
            />
          )}

          {screen === "batch" && (
            <BatchSummaryScreen
              batch={batch}
              onRemove={handleRemoveFromBatch}
              onDone={() => setScreen("scan")}
            />
          )}

          {screen === "scan" && !batchMode && lastResult && (
            <ResultSheet entry={lastResult} onClose={() => setLastResult(null)} />
          )}
        </>
      )}
    </SafeAreaProvider>
  );
}
