import React, { useState } from 'react';
import { TransmissionItem } from '../types/bb84';
import { Cpu, Terminal, Copy, Check, Info, Sparkles, ArrowRight, Layers } from 'lucide-react';

interface CircuitVisualizerProps {
  selectedQubit: TransmissionItem | null;
  qiskitAsciiCircuit: string;
  openqasm?: string;
  isRealQiskit: boolean;
}

export const CircuitVisualizer: React.FC<CircuitVisualizerProps> = ({
  selectedQubit,
  qiskitAsciiCircuit,
  openqasm,
  isRealQiskit,
}) => {
  const [activeView, setActiveView] = useState<'interactive' | 'qiskit_ascii' | 'openqasm'>('interactive');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qubit = selectedQubit || {
    index: 0,
    alice_bit: 1,
    alice_basis: 'x' as const,
    alice_state: '|-⟩',
    eve_intercepted: true,
    eve_basis: 'x' as const,
    eve_bit: 1,
    channel_noise: false,
    bob_basis: 'x' as const,
    bob_bit: 1,
    bases_match: true,
    bit_match: true,
    is_sample: false,
    has_error: false,
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      {/* Section Header with Clear Distinction Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
            <span>Circuit Inspection</span>
            <span>·</span>
            <span>AU Qiskit Fall Fest Track 7</span>
          </div>
          <h3 className="text-xl font-bold text-white mt-1">
            Quantum Circuit Visualization
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Inspecting Qubit <span className="font-mono text-cyan-300 font-bold">#{qubit.index}</span>.
            Toggle between the pedagogical step-by-step state evolution diagram and the compiled IBM Qiskit circuit representation.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-950 rounded-lg border border-slate-800 shrink-0">
          <button
            onClick={() => setActiveView('interactive')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeView === 'interactive'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Illustrative Diagram (Demo data)
          </button>
          <button
            onClick={() => setActiveView('qiskit_ascii')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeView === 'qiskit_ascii'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Qiskit Text Circuit
          </button>
          <button
            onClick={() => setActiveView('openqasm')}
            className={`px-3 py-1.5 text-xs font-medium rounded transition-colors ${
              activeView === 'openqasm'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            OpenQASM 3.0
          </button>
        </div>
      </div>

      {/* Distinction Badge */}
      <div className="mb-6 px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current View Type:</span>
          {activeView === 'interactive' ? (
            <span className="font-semibold text-cyan-400">
              Illustrative Pedagogical Diagram (Demo data — interactive state evolution model)
            </span>
          ) : (
            <span className="font-semibold text-emerald-400">
              {isRealQiskit
                ? 'Actual Qiskit QuantumCircuit Compilation'
                : 'Qiskit Architecture Representation (Demo data)'}
            </span>
          )}
        </div>
        <div className="text-[11px] font-mono">
          Engine Mode: <span className={isRealQiskit ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>{isRealQiskit ? 'Actual Qiskit Backend' : 'Demo data mode'}</span>
        </div>
      </div>

      {/* VIEW 1: Interactive Illustrative Circuit Diagram */}
      {activeView === 'interactive' && (
        <div className="space-y-6">
          {/* Visual Circuit Canvas */}
          <div className="p-6 bg-slate-950 rounded-xl border border-slate-800/80 overflow-x-auto">
            <div className="min-w-[700px] flex items-center justify-between relative py-6">
              {/* Quantum Wire Line */}
              <div className="absolute left-12 right-12 top-1/2 -translate-y-1/2 h-0.5 bg-slate-700 -z-0" />

              {/* Wire Label */}
              <div className="z-10 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs font-mono text-cyan-300 font-bold">
                q₀ |0⟩
              </div>

              {/* Step 1: Alice Preparation */}
              <div className="z-10 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-cyan-400 mb-2">
                  Alice Prep
                </span>
                <div className="flex items-center gap-2">
                  {qubit.alice_bit === 1 && (
                    <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500 flex items-center justify-center font-mono font-bold text-sm text-cyan-300 shadow-md">
                      X
                    </div>
                  )}
                  {qubit.alice_basis === 'x' && (
                    <div className="w-10 h-10 rounded bg-cyan-950 border border-cyan-500 flex items-center justify-center font-mono font-bold text-sm text-cyan-300 shadow-md">
                      H
                    </div>
                  )}
                  {qubit.alice_bit === 0 && qubit.alice_basis === '+' && (
                    <div className="w-10 h-10 rounded bg-slate-900 border border-slate-700 flex items-center justify-center font-mono text-xs text-slate-400">
                      I
                    </div>
                  )}
                </div>
                <span className="text-[11px] font-mono text-slate-300 mt-2">
                  State: <strong className="text-cyan-400">{qubit.alice_state}</strong>
                </span>
              </div>

              {/* Barrier 1 */}
              <div className="z-10 flex flex-col items-center h-20 justify-center">
                <div className="w-1 h-16 border-r-2 border-dashed border-slate-600" />
                <span className="text-[9px] text-slate-500 mt-1 uppercase">Channel</span>
              </div>

              {/* Step 2: Channel / Eve / Noise */}
              <div className="z-10 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-amber-400 mb-2">
                  {qubit.eve_intercepted ? 'Eve Intercept-Resend' : qubit.channel_noise ? 'Fiber Noise' : 'Channel (Lossless)'}
                </span>

                {qubit.eve_intercepted ? (
                  <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-950/40 border border-rose-800/80">
                    {qubit.eve_basis === 'x' && (
                      <div className="w-8 h-8 rounded bg-rose-900 border border-rose-500 flex items-center justify-center font-mono text-xs font-bold text-rose-200">
                        H
                      </div>
                    )}
                    <div className="w-8 h-8 rounded bg-rose-900 border border-rose-500 flex items-center justify-center font-mono text-xs font-bold text-rose-200" title="Measurement">
                      M
                    </div>
                    {qubit.eve_basis === 'x' && (
                      <div className="w-8 h-8 rounded bg-rose-900 border border-rose-500 flex items-center justify-center font-mono text-xs font-bold text-rose-200" title="Re-prep">
                        H
                      </div>
                    )}
                  </div>
                ) : qubit.channel_noise ? (
                  <div className="w-10 h-10 rounded bg-amber-950 border border-amber-500 flex items-center justify-center font-mono font-bold text-sm text-amber-300">
                    X
                  </div>
                ) : (
                  <div className="w-14 h-8 rounded bg-slate-900/80 border border-slate-700/80 flex items-center justify-center text-[10px] text-emerald-400 font-mono">
                    Identity
                  </div>
                )}

                <span className="text-[11px] font-mono text-slate-300 mt-2">
                  {qubit.eve_intercepted ? (
                    <span className="text-rose-400 font-semibold">
                      Eve Basis {qubit.eve_basis} → Collapsed to {qubit.eve_bit}
                    </span>
                  ) : qubit.channel_noise ? (
                    <span className="text-amber-400">Bit Flip Occurred</span>
                  ) : (
                    <span className="text-emerald-400">Undisturbed</span>
                  )}
                </span>
              </div>

              {/* Barrier 2 */}
              <div className="z-10 flex flex-col items-center h-20 justify-center">
                <div className="w-1 h-16 border-r-2 border-dashed border-slate-600" />
                <span className="text-[9px] text-slate-500 mt-1 uppercase">Detector</span>
              </div>

              {/* Step 3: Bob Measurement */}
              <div className="z-10 flex flex-col items-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400 mb-2">
                  Bob Measurement
                </span>
                <div className="flex items-center gap-2">
                  {qubit.bob_basis === 'x' && (
                    <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center font-mono font-bold text-sm text-emerald-300 shadow-md">
                      H
                    </div>
                  )}
                  <div className="w-10 h-10 rounded bg-emerald-950 border border-emerald-500 flex items-center justify-center font-mono font-bold text-sm text-emerald-300 shadow-md">
                    M
                  </div>
                </div>
                <span className="text-[11px] font-mono text-slate-300 mt-2">
                  Bob Basis: <strong className="text-emerald-400">{qubit.bob_basis}</strong> → Measured: <strong className="text-white">{qubit.bob_bit}</strong>
                </span>
              </div>

              {/* Classical Register Output */}
              <div className="z-10 bg-slate-900 border border-slate-700 px-3 py-1.5 rounded text-xs font-mono text-emerald-300 font-bold">
                c_bob: {qubit.bob_bit}
              </div>
            </div>
          </div>

          {/* Mathematical Step Annotations */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-cyan-400 mb-1">State Preparation Mechanics</div>
              <p className="text-slate-400 leading-relaxed">
                Alice prepares qubit #{qubit.index} with classical bit <strong className="text-white">{qubit.alice_bit}</strong> in the <strong className="text-cyan-300">{qubit.alice_basis === '+' ? 'computational (+)' : 'Hadamard (×)'}</strong> basis.
                Quantum state: <span className="font-mono text-cyan-300 font-bold">{qubit.alice_state}</span>.
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-amber-400 mb-1">Channel & Adversary Dynamics</div>
              <p className="text-slate-400 leading-relaxed">
                {qubit.eve_intercepted ? (
                  <span>
                    Eve intercepted this photon and measured using basis <strong className="text-rose-300">{qubit.eve_basis}</strong>.
                    {qubit.eve_basis === qubit.alice_basis
                      ? ' Her basis matched Alice, leaving state intact.'
                      : ' Her basis differed from Alice! Wave-function collapsed with 50% projection probability.'}
                  </span>
                ) : (
                  <span>
                    No eavesdropper intercepted this photon. The quantum state evolved unitarily across the channel.
                  </span>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800">
              <div className="font-bold text-emerald-400 mb-1">Measurement Outcome</div>
              <p className="text-slate-400 leading-relaxed">
                Bob measured in basis <strong className="text-emerald-300">{qubit.bob_basis}</strong>, yielding bit <strong className="text-white">{qubit.bob_bit}</strong>.
                {qubit.bases_match ? (
                  qubit.bit_match ? (
                    <span className="text-emerald-400 font-semibold"> Bases matched & bits agreed. Correct transmission.</span>
                  ) : (
                    <span className="text-rose-400 font-semibold"> Bases matched BUT bits differed! Detection error flagged.</span>
                  )
                ) : (
                  <span className="text-slate-500"> Bases differed. Bit safely discarded during classical sifting.</span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Real Qiskit ASCII Circuit */}
      {activeView === 'qiskit_ascii' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-mono">
              Qiskit QuantumCircuit.draw(output=&apos;text&apos;)
            </span>
            <button
              onClick={() => handleCopy(qiskitAsciiCircuit)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy ASCII'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
            {qiskitAsciiCircuit}
          </pre>
          <p className="text-[11px] text-slate-500 mt-2">
            This ASCII circuit is produced by IBM Qiskit compiling the Alice state preparation, quantum transmission channel,
            and Bob measurement basis rotation directly onto virtual registers.
          </p>
        </div>
      )}

      {/* VIEW 3: OpenQASM 3.0 Source */}
      {activeView === 'openqasm' && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 font-mono">
              OpenQASM 3.0 Circuit Definition
            </span>
            <button
              onClick={() => handleCopy(openqasm || '')}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-slate-800 rounded border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy QASM'}</span>
            </button>
          </div>
          <pre className="p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
            {openqasm || '// OpenQASM code representation\nOPENQASM 3.0;\ninclude "stdgates.inc";\nqubit q[1];\nbit c_bob[1];\nh q[0];\nh q[0];\nc_bob[0] = measure q[0];\n'}
          </pre>
          <p className="text-[11px] text-slate-500 mt-2">
            OpenQASM 3.0 specification ready for deployment on IBM Quantum real hardware systems or Aer simulator backends.
          </p>
        </div>
      )}
    </div>
  );
};
