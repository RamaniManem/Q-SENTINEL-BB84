import React from 'react';
import { AlertTriangle, BookOpen, ShieldAlert, Cpu, Terminal, CheckCircle2, Lock, Lightbulb } from 'lucide-react';

export const TheoryAndLimitations: React.FC = () => {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 tracking-wide uppercase">
          <span>Theoretical Rigor & Cryptanalysis</span>
          <span>·</span>
          <span>AU Qiskit Fall Fest Track 7</span>
        </div>
        <h3 className="text-xl font-bold text-white mt-1">
          Cryptographic Interpretation & Limitations of QBER
        </h3>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
          QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis.
          Under ideal BB84 assumptions, a randomly chosen intercept-resend attack introduces approximately 25% QBER in the sifted key on average. Finite simulation results vary.
        </p>
      </div>

      {/* Part 1: Why Eve Induces 25% Error */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
        <h4 className="text-sm font-bold text-cyan-400 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4" />
          <span>The Exact Mathematical Derivation: Why Eve Induces 25% QBER (Theoretical Demo Data)</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under ideal BB84 assumptions, a randomly chosen intercept-resend attack introduces approximately 25% QBER in the sifted key on average. Finite simulation results vary. Consider Alice transmitting a photon in either the Rectilinear basis (+ basis: |0⟩ or |1⟩) or Diagonal basis (× basis: |+⟩ or |-⟩):
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="font-semibold text-white block mb-1">Case 1: Eve Guesses Basis Correctly (Probability = 50%)</span>
            <p className="text-slate-400 leading-relaxed">
              If Eve selects the same basis as Alice, she measures the exact eigenstate (|0⟩ or |+⟩).
              Her re-prepared photon is in the original state |ψ⟩. When Bob measures in Alice&apos;s basis,
              Bob receives the identical bit. <strong>Error probability = 0%</strong>.
            </p>
          </div>

          <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800">
            <span className="font-semibold text-rose-300 block mb-1">Case 2: Eve Guesses Basis Incorrectly (Probability = 50%)</span>
            <p className="text-slate-400 leading-relaxed">
              If Alice prepared |0⟩ and Eve measures in the diagonal (×) basis, the state projects onto |+⟩ or |-⟩ with equal probability:
              |⟨+|0⟩|² = 1/2. Eve then transmits this diagonal state to Bob. When Bob measures in Alice&apos;s rectilinear basis,
              the state projects back with 50% probability to |1⟩. <strong>Error probability = 50%</strong>.
            </p>
          </div>
        </div>

        <div className="mt-4 p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg font-mono text-xs text-cyan-300">
          Theoretical Expectation: QBER(Eve) = P(wrong basis) × P(bit flip | wrong basis) = 0.5 × 0.5 = 25.0% (Demo data reference)
        </div>
      </div>

      {/* Part 2: The 11% Shor-Preskill Bound */}
      <div className="bg-slate-950 p-5 rounded-xl border border-slate-800/80">
        <h4 className="text-sm font-bold text-amber-400 mb-2 flex items-center gap-2">
          <Lightbulb className="w-4 h-4" />
          <span>Why is ~11% the Security Threshold? (Shor-Preskill Bound)</span>
        </h4>
        <p className="text-xs text-slate-300 leading-relaxed">
          QBER below configured threshold → Continue protocol checks.
          QBER is an error-rate estimate, not a standalone proof of security. The threshold depends on protocol assumptions and security analysis.
          The asymptotic secret key generation rate r in BB84 with one-way classical post-processing is given by:
        </p>

        <div className="my-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg font-mono text-xs text-emerald-300">
          r = 1 - 2 · H₂(Q)
          <span className="text-[11px] text-slate-400 block mt-1 font-sans">
            where H₂(p) = -p · log₂(p) - (1-p) · log₂(1-p) is the binary Shannon entropy function.
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The factor of 2 accounts for both bit-error reconciliation and phase-error privacy amplification.
          Solving for r = 0:
        </p>
        <div className="mt-2 text-xs font-mono text-slate-200">
          1 - 2 · H₂(Q) = 0  ⟹  H₂(Q) = 0.5  ⟹  Q ≈ 11.0028%
        </div>
        <p className="text-xs text-slate-400 mt-2 leading-relaxed">
          If estimated QBER &gt; 11%, Eve&apos;s potential mutual information with the raw key exceeds the mutual information between Alice and Bob (I(A:E) ≥ I(A:B)).
          Under this condition, no classical privacy amplification can distill a provably secret one-time pad, and Alice and Bob <strong>must abort</strong>.
        </p>
      </div>

      {/* Part 3: Physical Limitations of QBER in the Real World */}
      <div>
        <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Limitations of QBER in Physical Implementations</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* PNS Attack */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-rose-400 block mb-1">
              1. Photon Number Splitting (PNS) Attacks
            </span>
            <p className="text-slate-400 leading-relaxed">
              Standard laser sources emit faint attenuated coherent pulses rather than true single-photon states.
              According to Poisson statistics, some pulses contain 2 or more identical photons.
              An eavesdropper can siphon off one photon without disturbing the other, measuring it later without introducing any QBER!
              <span className="text-cyan-300 block mt-1">
                Modern defense: Decoy State protocol (randomly alternating faint pulse intensities).
              </span>
            </p>
          </div>

          {/* Detector Blinding */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-amber-400 block mb-1">
              2. Detector Blinding & Trojan Horse Attacks
            </span>
            <p className="text-slate-400 leading-relaxed">
              Single-Photon Avalanche Diodes (SPADs) can be blinded with continuous-wave optical illumination,
              forcing detectors into linear classical photodiode mode. Eve can trigger clicks at will by sending
              tailored pulses, dictating Bob&apos;s measurement results while generating zero QBER.
            </p>
          </div>

          {/* Classical Auth Need */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-cyan-400 block mb-1">
              3. Unauthenticated Classical Channel (MitM)
            </span>
            <p className="text-slate-400 leading-relaxed">
              BB84 assumes public announcements occur over an <em>authenticated</em> channel.
              If Eve can intercept and alter classical messages between Alice and Bob, she can execute a classic
              Man-in-the-Middle attack by establishing independent quantum keys with each party.
              QKD requires initial shared secrets for Carter-Wegman universal hashing.
            </p>
          </div>

          {/* Loss vs Eve */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
            <span className="font-bold text-emerald-400 block mb-1">
              4. Dark Counts & Fiber Attenuation
            </span>
            <p className="text-slate-400 leading-relaxed">
              Optical fiber incurs ~ 0.2 dB/km attenuation at 1550 nm.
              Detector dark counts (false triggers from thermal fluctuations) are independent of distance.
              As signal decreases over distance, dark counts dominate, driving baseline QBER above 11% even in the total absence of Eve.
            </p>
          </div>
        </div>
      </div>

      {/* Hackathon Disclaimer Banner */}
      <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs text-slate-300 leading-relaxed">
          <strong className="text-white">Educational Disclaimer: </strong>
          Q-Sentinel is an interactive pedagogical simulator developed for AU Qiskit Fall Fest Track 7.
          It demonstrates quantum mechanical state evolution, projective measurement collapse, and classical post-processing bounds.
          It does not guarantee production cryptographic security or replace certified QKD hardware platforms.
        </div>
      </div>
    </div>
  );
};
