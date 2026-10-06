import React, { useState } from 'react';
import { TransmissionItem } from '../types/bb84';
import { Check, X, ShieldAlert, Cpu, Eye, Filter } from 'lucide-react';

interface TransmissionTableProps {
  transmissions: TransmissionItem[];
  selectedQubitIndex: number;
  onSelectQubit: (index: number) => void;
}

export const TransmissionTable: React.FC<TransmissionTableProps> = ({
  transmissions,
  selectedQubitIndex,
  onSelectQubit,
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'matching' | 'errors' | 'sampled'>('all');

  const filtered = transmissions.filter((t) => {
    if (filterMode === 'matching') return t.bases_match;
    if (filterMode === 'errors') return t.has_error;
    if (filterMode === 'sampled') return t.is_sample;
    return true;
  });

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Photon Transmission Inspector</span>
            <span className="text-xs text-slate-400 font-normal">
              ({filtered.length} of {transmissions.length} qubits)
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Select any qubit to render its step-by-step quantum circuit gates and wave-function collapse below.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-lg border border-slate-800">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterMode === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All Qubits
          </button>
          <button
            onClick={() => setFilterMode('matching')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterMode === 'matching'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Matching Bases
          </button>
          <button
            onClick={() => setFilterMode('sampled')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterMode === 'sampled'
                ? 'bg-amber-500/20 text-amber-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sampled (QBER)
          </button>
          <button
            onClick={() => setFilterMode('errors')}
            className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
              filterMode === 'errors'
                ? 'bg-rose-500/20 text-rose-300 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Errors Only
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto max-h-96 rounded-lg border border-slate-800">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950/80 sticky top-0 border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
            <tr>
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Alice Bit</th>
              <th className="py-2.5 px-3">Alice Basis</th>
              <th className="py-2.5 px-3">Prepared State</th>
              <th className="py-2.5 px-3">Eve Intercept?</th>
              <th className="py-2.5 px-3">Eve Basis / Bit</th>
              <th className="py-2.5 px-3">Bob Basis</th>
              <th className="py-2.5 px-3">Bob Measured</th>
              <th className="py-2.5 px-3">Bases Match</th>
              <th className="py-2.5 px-3">Bit Match</th>
              <th className="py-2.5 px-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 bg-slate-950/30">
            {filtered.map((t) => {
              const isSelected = t.index === selectedQubitIndex;
              return (
                <tr
                  key={t.index}
                  onClick={() => onSelectQubit(t.index)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-cyan-950/40 text-cyan-200 font-semibold border-l-2 border-cyan-400'
                      : 'hover:bg-slate-900/60 text-slate-300'
                  }`}
                >
                  <td className="py-2 px-3 text-slate-500 font-bold tabular-nums">
                    #{t.index}
                  </td>
                  <td className="py-2 px-3 font-bold text-white">{t.alice_bit}</td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300">
                      {t.alice_basis === '+' ? 'Rect (+)' : 'Diag (×)'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-cyan-400">{t.alice_state}</td>
                  <td className="py-2 px-3">
                    {t.eve_intercepted ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>Intercepted</span>
                      </span>
                    ) : (
                      <span className="text-slate-600">None</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {t.eve_intercepted ? (
                      <span className="text-rose-300">
                        {t.eve_basis} / {t.eve_bit}
                      </span>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-emerald-300">
                      {t.bob_basis === '+' ? 'Rect (+)' : 'Diag (×)'}
                    </span>
                  </td>
                  <td className="py-2 px-3 font-bold text-white">{t.bob_bit}</td>
                  <td className="py-2 px-3">
                    {t.bases_match ? (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" />
                        <span>Match</span>
                      </span>
                    ) : (
                      <span className="text-slate-600 flex items-center gap-1">
                        <X className="w-3.5 h-3.5" />
                        <span>Discard</span>
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">
                    {t.bases_match ? (
                      t.bit_match ? (
                        <span className="text-emerald-400">Equal</span>
                      ) : (
                        <span className="text-rose-400 font-bold">ERROR</span>
                      )
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>
                  <td className="py-2 px-3 font-sans text-[11px]">
                    {t.has_error ? (
                      <span className="text-rose-400 font-bold">Sample Error</span>
                    ) : t.is_sample ? (
                      <span className="text-cyan-400">QBER Sample (Match)</span>
                    ) : t.bases_match ? (
                      <span className="text-emerald-400 font-bold">Distilled Key</span>
                    ) : (
                      <span className="text-slate-500">Sift Discarded</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
