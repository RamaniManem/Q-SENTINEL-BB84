import React from 'react';
import { Play, ShieldCheck, UserX, Activity, AlertCircle, Info, RefreshCw, Layers } from 'lucide-react';
import { ScenarioType, BackendHealth } from '../types/bb84';

interface ExperimentControlsProps {
  scenario: ScenarioType;
  onSelectScenario: (scenario: ScenarioType) => void;
  numBits: number;
  onChangeNumBits: (bits: number) => void;
  noiseRate: number;
  onChangeNoiseRate: (rate: number) => void;
  eveRate: number;
  onChangeEveRate: (rate: number) => void;
  sampleRatio: number;
  onChangeSampleRatio: (ratio: number) => void;
  isLoading: boolean;
  onRunSimulation: () => void;
  backendHealth: BackendHealth;
  backendError?: string | null;
}

export const ExperimentControls: React.FC<ExperimentControlsProps> = ({
  scenario,
  onSelectScenario,
  numBits,
  onChangeNumBits,
  noiseRate,
  onChangeNoiseRate,
  eveRate,
  onChangeEveRate,
  sampleRatio,
  onChangeSampleRatio,
  isLoading,
  onRunSimulation,
  backendHealth,
  backendError,
}) => {
  const isBackendReal = backendHealth.status === 'connected';

  // Normalize scenario check
  const isIdeal = scenario === 'ideal';
  const isEve = scenario === 'eve' || scenario === 'intercept_resend';
  const isNoisy = scenario === 'noisy';
  const isCombined = scenario === 'combined';

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      {/* Backend Error Banner */}
      {backendError && (
        <div className="mb-6 p-4 rounded-lg bg-rose-950/40 border border-rose-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200 leading-relaxed">
            <strong className="text-white block font-semibold mb-0.5">Backend Connection Error:</strong>
            {backendError}
          </div>
        </div>
      )}

      {/* Backend Status Disclaimer Banner */}
      {!isBackendReal && !backendError && (
        <div className="mb-6 p-3.5 rounded-lg bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">Notice on Execution Engine: </span>
            <span>
              External Python backend on port 5050 is not yet reachable. Running in <strong>Demo Mode</strong>.
              Per protocol guidelines, demo data is clearly labelled and never presented as actual Qiskit Aer execution.
            </span>
          </div>
        </div>
      )}

      {/* Scenario Selection Header */}
      <div className="mb-4">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-400 block mb-2">
          Select Experiment Scenario
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Ideal Channel */}
          <button
            type="button"
            onClick={() => onSelectScenario('ideal')}
            className={`p-4 rounded-lg text-left border transition-all cursor-pointer ${
              isIdeal
                ? 'bg-cyan-950/40 border-cyan-500/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Ideal Channel</span>
              <ShieldCheck
                className={`w-4 h-4 ${isIdeal ? 'text-cyan-400' : 'text-slate-500'}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              No eavesdropper, lossless channel. Expected QBER ~ 0.0%. Ideal secret key distillation baseline.
            </p>
            <div className="mt-3 text-[11px] font-mono text-cyan-300">
              eveInterceptRate: 0 · noise: 0
            </div>
          </button>

          {/* Intercept-Resend (Eve) */}
          <button
            type="button"
            onClick={() => onSelectScenario('eve')}
            className={`p-4 rounded-lg text-left border transition-all cursor-pointer ${
              isEve
                ? 'bg-rose-950/40 border-rose-500/80 shadow-[0_0_15px_rgba(244,63,94,0.15)] ring-1 ring-rose-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Eve (Intercept-Resend)</span>
              <UserX
                className={`w-4 h-4 ${isEve ? 'text-rose-400' : 'text-slate-500'}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Under ideal BB84 assumptions, a randomly chosen intercept-resend attack introduces approximately 25% QBER in the sifted key on average. Finite simulation results vary.
            </p>
            <div className="mt-3 text-[11px] font-mono text-rose-300">
              eveInterceptRate: {eveRate} · noise: 0
            </div>
          </button>

          {/* Noisy Channel */}
          <button
            type="button"
            onClick={() => onSelectScenario('noisy')}
            className={`p-4 rounded-lg text-left border transition-all cursor-pointer ${
              isNoisy
                ? 'bg-amber-950/40 border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)] ring-1 ring-amber-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Noisy Channel</span>
              <Activity
                className={`w-4 h-4 ${isNoisy ? 'text-amber-400' : 'text-slate-500'}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Thermal/fiber birefringence introduces depolarizing bit and phase flip errors without an active attacker.
            </p>
            <div className="mt-3 text-[11px] font-mono text-amber-300">
              noise: {noiseRate} · eve: 0
            </div>
          </button>

          {/* Combined (Eve + Noise) */}
          <button
            type="button"
            onClick={() => onSelectScenario('combined')}
            className={`p-4 rounded-lg text-left border transition-all cursor-pointer ${
              isCombined
                ? 'bg-purple-950/40 border-purple-500/80 shadow-[0_0_15px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/50'
                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-white">Combined (Eve + Noise)</span>
              <Layers
                className={`w-4 h-4 ${isCombined ? 'text-purple-400' : 'text-slate-500'}`}
              />
            </div>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Simultaneous eavesdropping and environmental channel attenuation to evaluate composite error rates.
            </p>
            <div className="mt-3 text-[11px] font-mono text-purple-300">
              eveInterceptRate: {eveRate} · noise: {noiseRate}
            </div>
          </button>
        </div>
      </div>

      {/* Security Analysis Note & Live Mode Banner */}
      <div className="mb-4 p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis.
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-2 font-mono text-[11px]">
          <span className="text-slate-500">Mode:</span>
          <span className={`px-2 py-0.5 rounded font-bold ${isBackendReal ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
            {isBackendReal ? 'Actual Qiskit backend mode' : 'Demo Mode'}
          </span>
          {isBackendReal && (
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
              Powered by Qiskit Aer
            </span>
          )}
        </div>
      </div>

      {/* Parameter Controls Deck */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-800/80">
        {/* Qubit Count (Default: 128) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">Transmitted Qubits (qubits)</label>
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {numBits} qubits
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {[32, 64, 128, 256].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => onChangeNumBits(val)}
                className={`flex-1 py-1.5 text-xs font-mono rounded transition-colors cursor-pointer ${
                  numBits === val
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5">
            128 qubits standard benchmark for statistical significance in QBER estimation.
          </p>
        </div>

        {/* Dynamic Scenario Parameter Slider */}
        <div>
          {isEve || isCombined ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">eveInterceptRate</label>
                <span className="text-xs font-mono font-bold text-rose-400 tabular-nums">
                  {eveRate.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={eveRate}
                onChange={(e) => onChangeEveRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Probability that Eve intercepts each photon along the quantum channel.
              </p>
            </div>
          ) : isNoisy ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Channel noise</label>
                <span className="text-xs font-mono font-bold text-amber-400 tabular-nums">
                  {noiseRate.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0.02"
                max="0.30"
                step="0.01"
                value={noiseRate}
                onChange={(e) => onChangeNoiseRate(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
              <p className="text-[11px] text-slate-500 mt-1.5">
                Depolarizing and phase flip rate applied during transmission.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">Channel Noise &amp; Eve</label>
                <span className="text-xs font-mono font-bold text-emerald-400 tabular-nums">
                  0.0 (Lossless)
                </span>
              </div>
              <div className="h-1.5 bg-emerald-500/20 rounded-lg w-full mt-3">
                <div className="h-full bg-emerald-500 rounded-lg w-0"></div>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Ideal channel: zero thermal noise, zero eavesdropping interception.
              </p>
            </div>
          )}
        </div>

        {/* Public Sample Ratio Slider */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium text-slate-300">qberTestSampleRatio</label>
            <span className="text-xs font-mono font-bold text-cyan-400 tabular-nums">
              {sampleRatio.toFixed(2)} ({Math.round(sampleRatio * 100)}%)
            </span>
          </div>
          <input
            type="range"
            min="0.2"
            max="0.8"
            step="0.05"
            value={sampleRatio}
            onChange={(e) => onChangeSampleRatio(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
          />
          <p className="text-[11px] text-slate-500 mt-1.5">
            Fraction of matching basis sifted bits sacrificed to publicly measure QBER.
          </p>
        </div>
      </div>

      {/* Action Execution Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400 flex items-center gap-2 flex-wrap">
          <span>Backend Target:</span>
          <span className="font-mono text-cyan-300">
            http://127.0.0.1:5050/api/simulate
          </span>
          <span className="text-slate-600">·</span>
          <span>POST JSON</span>
        </div>

        <button
          type="button"
          onClick={onRunSimulation}
          disabled={isLoading}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Executing Real Qiskit Simulation...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Run Simulation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
