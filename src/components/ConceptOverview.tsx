import React, { useState } from 'react';
import { ArrowRight, Lock, Eye, Zap, AlertTriangle, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const ConceptOverview: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
            <span>Quantum Key Distribution</span>
            <span>·</span>
            <span>Bennett-Brassard 1984 Protocol</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            How BB84 Detects Eavesdroppers via Quantum Mechanics
          </h2>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl leading-relaxed">
            BB84 leverages two mutually unbiased, non-orthogonal quantum bases. Because quantum states cannot be cloned
            (No-Cloning Theorem) and measuring an unknown quantum state irreversibly collapses it (Heisenberg Uncertainty),
            any eavesdropping attempt by Eve inevitably introduces measurable bit errors (QBER) that Alice and Bob detect during public sifting.
          </p>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="self-start md:self-auto flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors shrink-0"
        >
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
          <span>{isExpanded ? 'Hide Protocol Details' : 'View Protocol Steps'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* 3 Actor Pipeline Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        {/* Alice */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Transmitter</span>
              <span className="text-xs font-mono text-slate-400">Step 1 & 4</span>
            </div>
            <h3 className="text-base font-semibold text-white mt-1">Alice (Sender)</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Generates random classical bits and chooses a random basis for each qubit:
            </p>
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Rectilinear (+) Basis:</span>
                <span className="text-cyan-300">0 → |0⟩, 1 → |1⟩</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Diagonal (×) Basis:</span>
                <span className="text-cyan-300">0 → |+⟩, 1 → |-⟩</span>
              </div>
            </div>
          </div>
        </div>

        {/* Eve / Channel */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-amber-900/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Eavesdropper / Noise</span>
              <span className="text-xs font-mono text-slate-400">Step 2 (Channel)</span>
            </div>
            <h3 className="text-base font-semibold text-white mt-1">Eve (Adversary)</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Intercept-resend attack. Under ideal BB84 assumptions, a randomly chosen intercept-resend attack introduces approximately 25% QBER in the sifted key on average. Finite simulation results vary.
            </p>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="p-2 rounded bg-amber-950/30 border border-amber-900/50 text-amber-200/90 text-xs">
                <span className="font-semibold">Quantum Penalty:</span> If Eve guesses the wrong basis (50% chance), she collapses the state. When Bob measures in Alice&apos;s basis, Bob has a 50% chance of getting the wrong bit!
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Theoretical Benchmark (Demo data): <span className="text-amber-300 font-bold">~25.0% QBER</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bob */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Receiver</span>
              <span className="text-xs font-mono text-slate-400">Step 3 & 4</span>
            </div>
            <h3 className="text-base font-semibold text-white mt-1">Bob (Recipient)</h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-normal">
              Independently measures each photon in a randomly chosen basis (+ or ×).
            </p>
            <div className="mt-3 space-y-1.5 text-xs font-mono">
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Public Basis Sifting:</span>
                <span className="text-emerald-300">Keep when Basis matches</span>
              </div>
              <div className="p-1.5 rounded bg-slate-900 border border-slate-800 flex items-center justify-between text-slate-300">
                <span>Security Threshold:</span>
                <span className="text-emerald-300 text-[11px]">QBER below configured threshold → Continue protocol checks</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Analysis Note */}
      <div className="mt-4 p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg text-xs text-slate-400 flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-slate-200">Security Context: </strong>
          QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis.
        </p>
      </div>

      {/* Expanded detailed breakdown */}
      {isExpanded && (
        <div className="mt-5 pt-5 border-t border-slate-800 text-xs text-slate-300 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="font-bold text-cyan-400 mb-1">1. Quantum Transmission</div>
              Alice emits single polarized photons across the quantum channel. No classical bit value is exposed over the air.
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="font-bold text-cyan-400 mb-1">2. Basis Sifting</div>
              Alice & Bob announce only their chosen bases (+ or ×) over the classical channel. They discard bits where bases differed.
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="font-bold text-amber-400 mb-1">3. QBER Estimation</div>
              They sacrifice a random sample of sifted bits by comparing them publicly to calculate error rate Q = errors / sample.
            </div>
            <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800">
              <div className="font-bold text-emerald-400 mb-1">4. Privacy Amplification</div>
              If Q is below the security threshold, classical error correction and privacy amplification distill a key. QBER is an error-rate estimate, not a standalone proof of security.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
