import React from 'react';
import type { ActiveTab } from './Navbar';
import {
  SunMedium,
  Wheat,
  TrendingUp,
  HardDriveDownload,
  Coins,
  Droplets,
  ScanLine,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Link001, Link005 } from './v1/skiper40';

interface DashboardTabProps {
  onNavigate: (tab: ActiveTab) => void;
  networkStatus: 'online' | 'cached' | 'offline';
  pendingMutationsCount: number;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onNavigate,
  networkStatus,
  pendingMutationsCount,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-neutral-950 border border-emerald-800/40 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700/60 font-mono">
                Sub-Zero Latency Edge Stack
              </span>
              <span className="flex items-center space-x-1 text-xs text-neutral-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero-Trust Client Compute</span>
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
              Sovereign Agricultural Intelligence
            </h1>
            <p className="text-sm sm:text-base text-neutral-300 leading-relaxed font-sans">
              High-precision FAO-56 Penman-Monteith evapotranspiration balance, spatial Mandi net profit realization, and edge foliar diagnostics executing 100% on the farmer’s device.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3">
            <button
              onClick={() => onNavigate('scanner')}
              className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-950/50 hover:shadow-emerald-900/40 transition-all flex items-center space-x-2"
            >
              <ScanLine className="w-4 h-4" />
              <span>Scan Foliage</span>
            </button>
            <button
              onClick={() => onNavigate('mandi')}
              className="px-5 py-3 rounded-xl bg-neutral-900/90 hover:bg-neutral-800 text-white font-bold text-sm border border-neutral-700 hover:border-emerald-600/60 transition-all flex items-center space-x-2"
            >
              <Coins className="w-4 h-4 text-emerald-400" />
              <span>Compare Mandi Rates</span>
            </button>
          </div>
        </div>
      </section>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weather ET0 */}
        <article className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Reference ET (ET0)</span>
            <SunMedium className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-display font-extrabold text-white">4.82</span>
            <span className="text-xs text-neutral-400">mm/day</span>
          </div>
          <div className="mt-3 text-xs text-emerald-400 font-medium">
            <Link001 onClick={() => onNavigate('irrigation')}>FAO-56 Penman-Monteith Engine</Link001>
          </div>
        </article>

        {/* Primary Plot Stage */}
        <article className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Primary Plot Status</span>
            <Wheat className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-display font-bold text-white">Wheat (HD 3086)</span>
          </div>
          <div className="mt-3 text-xs text-amber-400 font-medium">
            <span>Mid-Season Peak (Kc = 1.15)</span>
          </div>
        </article>

        {/* Top Mandi NRV */}
        <article className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Optimal Mandi NRV</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-display font-extrabold text-emerald-400">₹2,476</span>
            <span className="text-xs text-neutral-400">/qtl net</span>
          </div>
          <div className="mt-3 text-xs text-emerald-300 font-medium">
            <Link001 onClick={() => onNavigate('mandi')}>Khanna Mandi (+₹120 spread)</Link001>
          </div>
        </article>

        {/* Offline Sync State */}
        <article className="p-5 rounded-2xl bg-neutral-900/80 border border-neutral-800/80 hover:border-neutral-700 transition shadow">
          <div className="flex items-center justify-between text-neutral-400 text-xs font-semibold uppercase tracking-wider">
            <span>Dexie v2 Persistence</span>
            <HardDriveDownload className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-2xl font-display font-bold text-white capitalize">
              {networkStatus}
            </span>
            <span className="text-xs text-neutral-400">({pendingMutationsCount} queued)</span>
          </div>
          <div className="mt-3 text-xs text-blue-400 font-medium">
            <Link001 onClick={() => onNavigate('sync')}>13 Stores Active & Durable</Link001>
          </div>
        </article>
      </div>

      {/* Autonomous Modules Grid */}
      <section className="space-y-4 pt-2">
        <h2 className="text-xl font-display font-bold text-white">Edge Agronomic Capabilities</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Mandi Card */}
          <div
            onClick={() => onNavigate('mandi')}
            className="group p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-emerald-600/60 cursor-pointer transition shadow-lg hover:shadow-emerald-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-white group-hover:text-emerald-400 transition-colors">
                Mandi Arbitrage Engine
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Computes net realization (NRV) factoring round-trip transport haulage, multi-vehicle logistics, APMC fees, and road vs geodesic distance routing.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-emerald-400 font-bold">
              <Link005>Calculate Mandi Take-Home</Link005>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Hydrology Card */}
          <div
            onClick={() => onNavigate('irrigation')}
            className="group p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-blue-600/60 cursor-pointer transition shadow-lg hover:shadow-blue-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
                <Droplets className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-white group-hover:text-blue-400 transition-colors">
                FAO-56 Hydrological Engine
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Exact Penman-Monteith ET0, growth-stage crop coefficient curves (Kc), root-zone depletion, and tubewell pump discharge runtimes.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-blue-400 font-bold">
              <Link005>Schedule Field Irrigation</Link005>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Scanner Card */}
          <div
            onClick={() => onNavigate('scanner')}
            className="group p-6 rounded-2xl bg-neutral-900/80 border border-neutral-800 hover:border-amber-600/60 cursor-pointer transition shadow-lg hover:shadow-amber-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-105 transition-transform">
                <ScanLine className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-display font-bold text-white group-hover:text-amber-400 transition-colors">
                Edge Computer Vision
              </h3>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 leading-relaxed">
                Foliar pathogen inference with Laplacian blur variance rejection, Shannon entropy uncertainty bounds, and verified organic treatment dosages.
              </p>
            </div>
            <div className="mt-6 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-amber-400 font-bold">
              <Link005>Diagnose Foliar Health</Link005>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
