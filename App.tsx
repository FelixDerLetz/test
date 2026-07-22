import React, { useState, useCallback } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import ScanScreen from "./src/screens/ScanScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import ResultSheet from "./src/screens/ResultSheet";
import { addScan } from "./src/storage";
import { RootScreen, ScanType } from "./src/types";

export default function App() {
  const [screen, setScreen] = useState<RootScreen>("scan");
  const [lastResult, setLastResult] = useState<{ value: string; type: string } | null>(
    null
  );
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  const handleScanned = useCallback(async (value: string, type: ScanType) => {
    await addScan({ value, type });
    setLastResult({ value, type });
    setHistoryRefreshKey((k) => k + 1);
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />

      {screen === "scan" && (
        <ScanScreen
          onScanned={handleScanned}
          onOpenHistory={() => setScreen("history")}
        />
      )}

      {screen === "history" && (
        <HistoryScreen
          onBack={() => setScreen("scan")}
          refreshKey={historyRefreshKey}
        />
      )}

      {screen === "scan" && lastResult && (
        <ResultSheet entry={lastResult} onClose={() => setLastResult(null)} />
      )}
    </SafeAreaProvider>
  );
}
