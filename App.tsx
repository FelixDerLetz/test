import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultSheet from "./src/screens/ResultSheet";
import BatchSummaryScreen from "./src/screens/BatchSummaryScreen";
import { addScan } from "./src/storage";
import { RootScreen, ScanEntry, ScanType } from "./src/types";

type Screen = RootScreen | "batch";

export default function App() {
  const [screen, setScreen] = useState<Screen>("scan");
  const [lastResult, setLastResult] = useState<{ value: string; type: string } | null>(
    null
  );
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const [batchMode, setBatchMode] = useState(false);
  const [batch, setBatch] = useState<ScanEntry[]>([]);

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
    </SafeAreaProvider>
  );
}
