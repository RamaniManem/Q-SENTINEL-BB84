import React from 'react';
import { ExperimentHistoryItem, ScenarioType } from '../types/bb84';
import { BarChart3, TrendingUp, AlertTriangle, ShieldCheck, History, ArrowRight } from 'lucide-react';

interface ComparisonChartProps {
  history: ExperimentHistoryItem[];
  onReplayExperiment?: (item: ExperimentHistoryItem) => void;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  history,
}) => {
  // Scenario averages or baselines
  const benchmarks = [
    {
      scenario: 'Ideal Channel',
      key: 'ideal',
      typicalQber: 0.0,
      description: 'Lossless fiber, zero eavesdropping (Theoretical reference / Demo data)',
      verdict: 'NOMINAL',
      color: 'bg-emerald-500',
      textColor: 'text-emerald-400',
    },
    {
      scenario: 'Noisy Channel (10% Noise)',
      key: 'noisy',
      typicalQber: 10.0,
      description: 'Fiber birefringence & thermal decoherence (Simulated model / Demo data)',
      verdict: 'BORDERLINE',
      color: 'bg-amber-500',
      textColor: 'text-amber-400',
    },
    {
      scenario: 'Security Threshold Bound',
      key: 'threshold',
      typicalQber: 11.0,
      description: 'Protocol-dependent threshold bound for key distillation',
      verdict: 'THRESHOLD',
      color: 'bg-red-500',
      textColor: 'text-red-400',
      isThreshold: true,
    },
    {
      scenario: 'Intercept-Resend (Eve)',
      key: 'intercept_resend',
      typicalQber: 25.0,
      description: 'Under ideal BB84 assumptions, introduces ~25% QBER on average. Finite simulation results vary. (Demo data)',
      verdict: 'ABORT',
      color: 'bg-rose-500',
      textColor: 'text-rose-400',
    },
  ];

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
          <span>Comparative Metrics</span>
          <span>·</span>
          <span>Security Bounds</span>
        </div>
        <h3 className="text-xl font-bold text-white mt-1">
          QBER Comparison Across Scenarios
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          Visualizing the error rate spectrum against the 11% Shor-Preskill threshold bound.
          Under ideal BB84 assumptions, a randomly chosen intercept-resend attack introduces approximately 25% QBER in the sifted key on average. Finite simulation results vary.
        </p>
      </div>

      {/* Security Context Note */}
      <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-400">
        <strong className="text-slate-200">Analysis Note: </strong>
        QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis.
      </div>

      {/* Benchmark Spectrum Chart */}
      <div className="bg-slate-950 p-6 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-6">
          <span>Scenario Profile</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Secure Zone (&lt; 11%)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Abort Zone (&ge; 11%)</span>
            </span>
          </div>
        </div>

        {/* Bar comparison layout */}
        <div className="space-y-5">
          {benchmarks.map((b) => {
            const barWidth = Math.min(100, (b.typicalQber / 30) * 100);
            return (
              <div key={b.key} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold ${b.isThreshold ? 'text-red-400 font-bold' : 'text-slate-200'}`}>
                      {b.scenario}
                    </span>
                    <span className="text-[11px] text-slate-500 hidden sm:inline">
                      · {b.description}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className={`font-bold tabular-nums ${b.textColor}`}>
                      {b.typicalQber.toFixed(1)}% QBER
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-sans ${
                        b.typicalQber < 11
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                          : b.typicalQber === 11
                          ? 'bg-red-950 text-red-300 border border-red-800/50'
                          : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                      }`}
                    >
                      {b.verdict}
                    </span>
                  </div>
                </div>

                {/* Progress bar with 11% line */}
                <div className="relative h-4 bg-slate-900 rounded-md overflow-hidden border border-slate-800">
                  {/* Threshold marker vertical line at (11 / 30) * 100 = 36.6% */}
                  <div
                    className="absolute top-0 bottom-0 w-0.5 bg-red-500/80 z-20"
                    style={{ left: `${(11 / 30) * 100}%` }}
                    title="11% Security Threshold"
                  />
                  
                  <div
                    className={`h-full ${b.color} transition-all duration-500 rounded-sm opacity-90`}
                    style={{ width: `${Math.max(2, barWidth)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <span>0% (Ideal)</span>
          <span className="text-red-400 font-semibold">▲ 11.0% Shor-Preskill Bound</span>
          <span>30% Max Scale</span>
        </div>
      </div>

      {/* Historical Runs in this session */}
      {history.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <span>Experiment Run History (Current Session)</span>
            </h4>
            <span className="text-xs text-slate-400">{history.length} runs executed</span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Scenario</th>
                  <th className="py-2.5 px-3">Execution Mode</th>
                  <th className="py-2.5 px-3">Qubits (N)</th>
                  <th className="py-2.5 px-3">Matching (M)</th>
                  <th className="py-2.5 px-3">Sifted Length</th>
                  <th className="py-2.5 px-3">Estimated QBER</th>
                  <th className="py-2.5 px-3">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {history.map((item) => {
                  const isSecure = item.verdict === 'SECURE';
                  return (
                    <tr key={item.id} className="hover:bg-slate-900/50">
                      <td className="py-2 px-3 text-slate-500">{item.timestamp}</td>
                      <td className="py-2 px-3 font-semibold text-white capitalize">
                        {item.scenario.replace('_', ' ')}
                      </td>
                      <td className="py-2 px-3">
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-bold ${item.is_real_qiskit ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                          {item.is_real_qiskit ? 'Actual Qiskit' : 'Demo data'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-slate-300">{item.num_bits}</td>
                      <td className="py-2 px-3 text-cyan-400">{item.matching_basis_count}</td>
                      <td className="py-2 px-3 text-emerald-400">{item.sifted_length}</td>
                      <td
                        className={`py-2 px-3 font-bold ${
                          isSecure ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(item.qber * 100).toFixed(1)}%
                      </td>
                      <td className="py-2 px-3">
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-bold ${
                            isSecure
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                              : 'bg-rose-950 text-rose-300 border border-rose-800/50'
                          }`}
                        >
                          {isSecure ? 'Below Threshold' : 'Threshold Exceeded'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
