import React from 'react';
import { Shield, Radio, Terminal, Cpu } from 'lucide-react';
import { BackendHealth } from '../types/bb84';

interface HeaderProps {
  backendHealth: BackendHealth;
  onOpenBackendModal: () => void;
  activeTab: string;
  onSelectTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  backendHealth,
  onOpenBackendModal,
  activeTab,
  onSelectTab,
}) => {
  const isConnected = backendHealth.status === 'connected';
  const isRealQiskit = backendHealth.is_real_qiskit;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <a href="/" className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Q-Sentinel</span>
              <span className="text-xs font-normal text-cyan-400/80 hidden sm:inline">
                / AU Qiskit Fall Fest Track 7
              </span>
            </a>
          </div>
        </div>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <button
            onClick={() => onSelectTab('simulation')}
            className={`transition-colors text-left ${
              activeTab === 'simulation'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulation Studio
          </button>
          <button
            onClick={() => onSelectTab('telemetry')}
            className={`transition-colors text-left ${
              activeTab === 'telemetry'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Transmission Inspector
          </button>
          <button
            onClick={() => onSelectTab('circuit')}
            className={`transition-colors text-left ${
              activeTab === 'circuit'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quantum Circuit
          </button>
          <button
            onClick={() => onSelectTab('comparison')}
            className={`transition-colors text-left ${
              activeTab === 'comparison'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Benchmarks & Trends
          </button>
          <button
            onClick={() => onSelectTab('theory')}
            className={`transition-colors text-left ${
              activeTab === 'theory'
                ? 'text-cyan-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Theory & Limitations
          </button>
        </nav>

        {/* Zone 3: Primary action & connection status */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenBackendModal}
            className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all text-slate-300 hover:text-white bg-slate-900 border-slate-700/80 hover:border-slate-600"
            title="Inspect Qiskit Backend Connection & Python Engine"
          >
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected
                  ? isRealQiskit
                    ? 'bg-emerald-400 animate-pulse'
                    : 'bg-cyan-400'
                  : 'bg-amber-400'
              }`}
            />
            <span className="hidden sm:inline">
              {isConnected
                ? isRealQiskit
                  ? 'Qiskit Aer: Connected'
                  : 'Python Daemon: Active'
                : 'Demo Mode: Disconnected'}
            </span>
            <span className="sm:hidden">
              {isConnected ? 'Backend' : 'Demo'}
            </span>
            <Terminal className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
