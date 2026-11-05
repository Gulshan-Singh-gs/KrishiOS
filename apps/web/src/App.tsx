import { useState, useEffect, useCallback } from 'react';
import { Navbar, type ActiveTab } from './components/Navbar';
import { DashboardTab } from './components/DashboardTab';
import { MandiArbitrageTab } from './components/MandiArbitrageTab';
import { IrrigationTab } from './components/IrrigationTab';
import { CropScannerTab } from './components/CropScannerTab';
import { VoiceAssistantTab } from './components/VoiceAssistantTab';
import { SyncCenterTab } from './components/SyncCenterTab';
import { localDb } from './db/localDb';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [networkStatus, setNetworkStatus] = useState<'online' | 'cached' | 'offline'>('online');
  const [pendingMutationsCount, setPendingMutationsCount] = useState<number>(0);

  const refreshOutboxCount = useCallback(async () => {
    try {
      const count = await localDb.syncOutbox
        .where('status')
        .equals('queued')
        .count();
      setPendingMutationsCount(count);
    } catch {
      // fallback
    }
  }, []);

  const checkConnectivityState = useCallback(async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setNetworkStatus('offline');
      return;
    }
    const isGatewayReachable = await localDb.probeConnectivity('/health', 2500);
    setNetworkStatus(isGatewayReachable ? 'online' : 'cached');
  }, []);

  useEffect(() => {
    checkConnectivityState();
    refreshOutboxCount();

    const interval = setInterval(() => {
      checkConnectivityState();
      refreshOutboxCount();
    }, 10000);

    const handleOnline = () => checkConnectivityState();
    const handleOffline = () => setNetworkStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [checkConnectivityState, refreshOutboxCount]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans selection:bg-emerald-600 selection:text-white">
      {/* Top Navbar & Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        networkStatus={networkStatus}
        pendingMutationsCount={pendingMutationsCount}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onNavigate={(tab) => setActiveTab(tab)}
            networkStatus={networkStatus}
            pendingMutationsCount={pendingMutationsCount}
          />
        )}

        {activeTab === 'mandi' && <MandiArbitrageTab />}

        {activeTab === 'irrigation' && <IrrigationTab />}

        {activeTab === 'scanner' && <CropScannerTab />}

        {activeTab === 'voice' && (
          <VoiceAssistantTab onNavigate={(tab) => setActiveTab(tab)} />
        )}

        {activeTab === 'sync' && (
          <SyncCenterTab
            networkStatus={networkStatus}
            onRefreshOutbox={refreshOutboxCount}
          />
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-4 text-center text-xs text-neutral-500">
        <p>KrishiOS Enterprise v1.0.1 • Client-First Deterministic Agronomic Intelligence • Zero-Trust Edge Architecture</p>
      </footer>
    </div>
  );
}
