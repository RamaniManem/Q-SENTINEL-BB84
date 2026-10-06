import React from 'react';
import { SimulationResult } from '../types/bb84';
import { ShieldCheck, AlertOctagon, CheckCircle2, Key, Cpu, HelpCircle, Terminal, Info, Zap } from 'lucide-react';

interface ResultsDeckProps {
  result: SimulationResult | null;
  onSelectQubit: (index: number) => void;
  selectedQubitIndex: number;
}

export const ResultsDeck: React.FC<ResultsDeckProps> = ({
  result,
  onSelectQubit,
  selectedQubitIndex,
}) => {
  if (!result) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
        <Cpu className="w-12 h-12 mx-auto mb-3 opacity-30 text-cyan-400" />
        <h3 className="text-base font-semibold text-slate-300">Awaiting Simulation Execution</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Configure parameters above and click &quot;Run Simulation&quot; to execute real quantum circuit simulation on the local Qiskit Aer backend.
        </p>
      </div>
    );
  }

  // Extract returned fields from backend API
  const transmittedQubits = result.transmittedQubits ?? result.transmitted_count ?? 128;
  const matchingBases = result.matchingBases ?? result.matching_basis_count ?? 0;
  const siftedKeyLength = result.siftedKeyLength ?? result.sifted_key_length ?? 0;
  const testSampleSize = result.testSampleSize ?? result.test_sample_size ?? 0;
  const errors = result.errors ?? result.test_sample_errors ?? 0;
  const qber = result.qber ?? result.estimated_qber ?? 0.0;
  const qberPercent = result.qberPercent ?? `${(qber * 100).toFixed(1)}%`;
  const thresholdPercent = result.thresholdPercent ?? '11.0%';
  const verdict = result.verdict ?? (qber < 0.11 ? 'QBER below configured threshold -> Continue protocol checks' : 'ABORT PROTOCOL -> Threshold exceeded');
  const executionMode = result.executionMode ?? (result.backend_engine?.is_real_qiskit ? 'Actual Qiskit backend mode' : 'Demo data mode');
  const engine = result.engine ?? (result.backend_info?.engine || 'Qiskit Aer Simulator');
  const note = result.note ?? 'QBER is an error-rate estimate, not a standalone proof of security. Powered by Qiskit Aer.';
  const aliceSiftedBits = result.aliceSiftedBits ?? '';
  const bobSiftedBits = result.bobSiftedBits ?? '';
  const retainedAliceBits = result.retainedAliceBits ?? (result.raw_secret_key_alice || '');
  const retainedBobBits = result.retainedBobBits ?? (result.raw_secret_key_bob || '');
  const eveInterceptRate = result.eveInterceptRate ?? (result.experiment_settings?.eve_intercept_rate ?? 0);
  const noise = result.noise ?? (result.experiment_settings?.noise_rate ?? 0);

  const isBelowThreshold = qber < 0.11;
  const isActualQiskit = !executionMode.toLowerCase().includes('demo');

  return (
    <div className="space-y-6">
      {/* 4 Main Results Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Transmitted Qubits */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-400">transmittedQubits (N)</div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-white tabular-nums">
              {transmittedQubits}
            </div>
          </div>
          <div className="text-xs text-slate-500">Photons sent from Alice</div>
        </div>

        {/* Card 2: Matching Bases */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-400">matchingBases (M)</div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-cyan-400 tabular-nums">
              {matchingBases}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {transmittedQubits > 0 ? ((matchingBases / transmittedQubits) * 100).toFixed(0) : 0}% of N (Theoretical: ~50%)
          </div>
        </div>

        {/* Card 3: Sifted Key Length */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
          <div className="text-xs font-medium text-slate-400">siftedKeyLength (L)</div>
          <div className="my-2">
            <div className="text-3xl font-bold font-mono text-emerald-400 tabular-nums">
              {siftedKeyLength}
            </div>
          </div>
          <div className="text-xs text-slate-500">
            {testSampleSize} sample bits used for testSampleSize
          </div>
        </div>

        {/* Card 4: Estimated QBER */}
        <div
          className={`border rounded-xl p-5 flex flex-col justify-between ${
            isBelowThreshold
              ? 'bg-slate-900/60 border-slate-800'
              : 'bg-rose-950/20 border-rose-800/50'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span>qber / qberPercent</span>
            <span
              className={`text-[11px] font-bold ${
                isBelowThreshold ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isBelowThreshold ? '● NOMINAL' : '▲ ELEVATED'}
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-2">
            <div
              className={`text-3xl font-bold font-mono tabular-nums ${
                isBelowThreshold ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {qberPercent}
            </div>
            <span className="text-xs text-slate-400">/ threshold {thresholdPercent}</span>
          </div>
          <div className="text-xs text-slate-500">
            {errors} errors in {testSampleSize} test bits (qber: {qber.toFixed(4)})
          </div>
        </div>
      </div>

      {/* Protocol Verdict & Cryptographic Evaluation Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 ${
          isBelowThreshold
            ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200'
            : 'bg-rose-950/30 border-rose-800/60 text-rose-200'
        }`}
      >
        <div className="flex items-start gap-3.5">
          {isBelowThreshold ? (
            <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-lg bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
              <AlertOctagon className="w-5 h-5" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white tracking-wide">
                verdict: {verdict}
              </h4>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold ${isActualQiskit ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                {executionMode}
              </span>
              {isActualQiskit && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Powered by Qiskit Aer</span>
                </span>
              )}
            </div>
            <p className="text-xs mt-1.5 text-slate-300 leading-relaxed max-w-3xl">
              {note}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 italic">
              Crucial Protocol Note: QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis. No quantum advantage is claimed.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono shrink-0 pl-12 md:pl-0">
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Engine</span>
            <span className="text-xs font-bold text-white">
              {engine}
            </span>
          </div>
        </div>
      </div>

      {/* Technical Response Metadata Readout (Displaying API returned fields) */}
      <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              API Returned Fields Summary
            </h4>
          </div>
          <span className="text-[11px] font-mono text-cyan-300">
            {executionMode}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">transmittedQubits</span>
            <span className="text-white font-bold">{transmittedQubits}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">matchingBases</span>
            <span className="text-cyan-400 font-bold">{matchingBases}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">siftedKeyLength</span>
            <span className="text-emerald-400 font-bold">{siftedKeyLength}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">testSampleSize</span>
            <span className="text-slate-300 font-bold">{testSampleSize}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">errors</span>
            <span className={errors > 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>{errors}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">qber</span>
            <span className={isBelowThreshold ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>{qber.toFixed(4)} ({qberPercent})</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">thresholdPercent</span>
            <span className="text-slate-300 font-bold">{thresholdPercent}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">eveInterceptRate</span>
            <span className="text-amber-400 font-bold">{eveInterceptRate}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800">
            <span className="text-slate-500 block text-[10px]">noise</span>
            <span className="text-amber-400 font-bold">{noise}</span>
          </div>
          <div className="p-2.5 rounded bg-slate-900 border border-slate-800 col-span-2 sm:col-span-3">
            <span className="text-slate-500 block text-[10px]">engine</span>
            <span className="text-cyan-300 font-bold">{engine}</span>
          </div>
        </div>
      </div>

      {/* Sifted Key Inspection Section */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-white">Sifted &amp; Retained Bit Strings</h4>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/20 border border-emerald-500/60 inline-block" />
              <span>retainedAliceBits / retainedBobBits</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-500/20 border border-cyan-500/60 inline-block" />
              <span>testSampleSize (Disclosed)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/30 border border-rose-500 inline-block" />
              <span>errors</span>
            </span>
          </div>
        </div>

        {/* Returned Bit Strings Readout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
              <span>aliceSiftedBits:</span>
              <span className="text-slate-500">Length: {aliceSiftedBits.length}</span>
            </div>
            <div className="text-cyan-300 font-bold tracking-wider break-all max-h-16 overflow-y-auto">
              {aliceSiftedBits || '—'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
              <span>bobSiftedBits:</span>
              <span className="text-slate-500">Length: {bobSiftedBits.length}</span>
            </div>
            <div className="text-cyan-300 font-bold tracking-wider break-all max-h-16 overflow-y-auto">
              {bobSiftedBits || '—'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
              <span>retainedAliceBits (Key candidate):</span>
              <span className="text-slate-500">Length: {retainedAliceBits.length}</span>
            </div>
            <div className="text-emerald-300 font-bold tracking-wider break-all max-h-16 overflow-y-auto">
              {retainedAliceBits || '—'}
            </div>
          </div>

          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between font-sans">
              <span>retainedBobBits:</span>
              <span className="text-slate-500">Length: {retainedBobBits.length}</span>
            </div>
            <div className="text-emerald-300 font-bold tracking-wider break-all max-h-16 overflow-y-auto">
              {retainedBobBits || '—'}
            </div>
          </div>
        </div>

        {/* Visual bit strings (if transmissions array exists) */}
        {result.transmissions && result.transmissions.length > 0 && (
          <div className="pt-2">
            <div className="text-xs text-slate-400 mb-2 font-sans">
              Interactive Sifted Bits Inspection (Click any bit to inspect qubit circuit):
            </div>
            <div className="flex flex-wrap gap-1">
              {result.transmissions
                .filter((t) => t.bases_match)
                .map((t) => {
                  const isSample = t.is_sample;
                  const isErr = t.has_error;
                  const isSelected = t.index === selectedQubitIndex;
                  return (
                    <button
                      key={`sifted-${t.index}`}
                      onClick={() => onSelectQubit(t.index)}
                      className={`w-7 h-7 rounded text-center flex flex-col items-center justify-center font-bold text-xs font-mono transition-all cursor-pointer ${
                        isSelected
                          ? 'ring-2 ring-white ring-offset-1 ring-offset-slate-950'
                          : ''
                      } ${
                        isErr
                          ? 'bg-rose-500/30 text-rose-200 border border-rose-500'
                          : isSample
                          ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-700/60'
                          : 'bg-emerald-950/50 text-emerald-300 border border-emerald-700/60'
                      }`}
                      title={`Qubit #${t.index} | Alice: ${t.alice_bit} (${t.alice_basis}) | Bob: ${t.bob_bit} (${t.bob_basis})`}
                    >
                      <span>{t.alice_bit}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
