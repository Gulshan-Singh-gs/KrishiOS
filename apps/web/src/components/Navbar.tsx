import React from 'react';
import {
  Sprout,
  Droplets,
  Coins,
  ScanLine,
  Mic,
  RefreshCw,
  Wifi,
  WifiOff,
  Database,
} from 'lucide-react';
import { Link003 } from './v1/skiper40';

export type ActiveTab = 'dashboard' | 'mandi' | 'irrigation' | 'scanner' | 'voice' | 'sync';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  networkStatus: 'online' | 'cached' | 'offline';
  pendingMutationsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  networkStatus,
  pendingMutationsCount,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-xl border-b border-neutral-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-600 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-display font-extrabold tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                  KrishiOS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-400 border border-emerald-800/80 font-mono font-semibold">
                  v1.0.1 Enterprise
                </span>
              </div>
              <p className="text-[11px] text-neutral-400 hidden sm:block font-medium">
                Autonomous Agronomic & Mandi Intelligence
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center space-x-3">
            {/* Real-time Network Pill */}
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all ${
                networkStatus === 'online'
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-700/80 shadow-sm shadow-emerald-950'
                  : networkStatus === 'cached'
                  ? 'bg-amber-950/70 text-amber-300 border-amber-700/80 shadow-sm shadow-amber-950'
                  : 'bg-rose-950/70 text-rose-300 border-rose-700/80 shadow-sm shadow-rose-950'
              }`}
            >
              {networkStatus === 'online' ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : networkStatus === 'cached' ? (
                <Database className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-rose-400" />
              )}
              <span className="capitalize">
                {networkStatus === 'online'
                  ? 'Gateway Live'
                  : networkStatus === 'cached'
                  ? 'Cached Datasets'
                  : 'Offline Mode'}
              </span>
            </div>

            {/* Outbox Badge with Link */}
            <button
              onClick={() => setActiveTab('sync')}
              className="flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-emerald-600/60 transition shadow"
              title="Durable Outbox Queue"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 text-emerald-400 ${
                  pendingMutationsCount > 0 ? 'animate-spin' : ''
                }`}
              />
              <span>{pendingMutationsCount} Pending</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation with Skiper Micro-Interaction */}
        <nav aria-label="Main Navigation" className="flex space-x-1 sm:space-x-2 py-2 overflow-x-auto no-scrollbar border-t border-neutral-800/40">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Sprout },
            { id: 'mandi', label: 'Mandi Arbitrage', icon: Coins },
            { id: 'irrigation', label: 'Agro-Hydrology', icon: Droplets },
            { id: 'scanner', label: 'Foliar Scanner', icon: ScanLine },
            { id: 'voice', label: 'Vernacular Voice', icon: Mic },
            { id: 'sync', label: 'Offline Center', icon: RefreshCw },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/60'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} />
                <Link003 className={isActive ? 'text-white font-bold' : ''}>
                  {tab.label}
                </Link003>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
