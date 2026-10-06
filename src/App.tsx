import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ConceptOverview } from './components/ConceptOverview';
import { ExperimentControls } from './components/ExperimentControls';
import { ResultsDeck } from './components/ResultsDeck';
import { TransmissionTable } from './components/TransmissionTable';
import { CircuitVisualizer } from './components/CircuitVisualizer';
import { ComparisonChart } from './components/ComparisonChart';
import { TheoryAndLimitations } from './components/TheoryAndLimitations';
import { BackendModal } from './components/BackendModal';
import {
  ScenarioType,
  SimulationResult,
  BackendHealth,
  ExperimentHistoryItem,
} from './types/bb84';
import { Shield, Sparkles, AlertCircle, ArrowUpRight, Cpu, Zap } from 'lucide-react';

export default function App() {
  const [scenario, setScenario] = useState<ScenarioType>('ideal');
  const [numBits, setNumBits] = useState<number>(128);
  const [noiseRate, setNoiseRate] = useState<number>(0.08);
  const [eveRate, setEveRate] = useState<number>(1.0);
  const [sampleRatio, setSampleRatio] = useState<number>(0.5);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedQubitIndex, setSelectedQubitIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<string>('simulation');
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const [backendHealth, setBackendHealth] = useState<BackendHealth>({
    status: 'checking',
    backend_url: 'http://127.0.0.1:5050',
    has_qiskit: false,
    has_aer: false,
    is_real_qiskit: false,
  });

  const [history, setHistory] = useState<ExperimentHistoryItem[]>([]);

  // Health check query
  const checkBackendHealth = useCallback(async () => {
    try {
      // Try direct connection or container proxy
      let res;
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1200);
        res = await fetch('http://127.0.0.1:5050/api/health', { signal: controller.signal });
        clearTimeout(timeoutId);
      } catch {
        res = await fetch('/api/health');
      }

      if (res && res.ok) {
        const data = await res.json();
        setBackendHealth({
          status: 'connected',
          backend_url: 'http://127.0.0.1:5050',
          has_qiskit: data.has_qiskit ?? data.python_data?.has_qiskit ?? false,
          has_aer: data.has_aer ?? data.python_data?.has_aer ?? false,
          is_real_qiskit: true,
          message: data.message,
        });
        return;
      }
    } catch {
      // Backend unreachable
    }
    setBackendHealth((prev) => ({
      ...prev,
      status: 'disconnected',
      is_real_qiskit: false,
    }));
  }, []);

  // Run simulation handler
  const handleRunSimulation = useCallback(async () => {
    setIsLoading(true);
    setBackendError(null);

    // Normalize scenario identifier
    const targetScenario = scenario === 'intercept_resend' ? 'eve' : scenario;
    const requestPayload = {
      scenario: targetScenario,
      qubits: numBits,
      eveInterceptRate: (targetScenario === 'eve' || targetScenario === 'combined') ? eveRate : 0,
      noise: (targetScenario === 'noisy' || targetScenario === 'combined') ? noiseRate : 0,
      qberTestSampleRatio: sampleRatio,
    };

    try {
      let resp;
      let usedEndpoint = 'http://127.0.0.1:5050/api/simulate';

      // First attempt direct call to http://127.0.0.1:5050/api/simulate
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        resp = await fetch('http://127.0.0.1:5050/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
      } catch {
        // If direct fetch is blocked by browser Mixed Content in HTTPS or CORS, use server proxy
        usedEndpoint = '/api/simulate (proxy to 127.0.0.1:5050)';
        resp = await fetch('/api/simulate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestPayload),
        });
      }

      if (resp && resp.ok) {
        const data: SimulationResult = await resp.json();
        setResult(data);
        setSelectedQubitIndex(0);
        setBackendError(null);

        // Update backend status to connected
        setBackendHealth((prev) => ({
          ...prev,
          status: 'connected',
          is_real_qiskit: true,
        }));

        // Add to history
        const historyItem: ExperimentHistoryItem = {
          id: Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          scenario: data.scenario,
          num_bits: data.transmittedQubits ?? data.transmitted_count,
          qber: data.qber ?? data.estimated_qber,
          qberPercent: data.qberPercent,
          verdict: data.verdict ?? data.security_verdict,
          sifted_length: data.siftedKeyLength ?? data.sifted_key_length,
          matching_basis_count: data.matchingBases ?? data.matching_basis_count,
          is_real_qiskit: true,
          executionMode: data.executionMode ?? 'Actual Qiskit backend mode',
        };

        setHistory((prev) => [historyItem, ...prev.slice(0, 19)]);
      } else {
        throw new Error(`Simulation request to ${usedEndpoint} failed with status: ${resp?.status}`);
      }
    } catch (err: any) {
      console.error('Simulation execution failed:', err);
      setBackendError(
        'Backend unavailable: Unable to reach Qiskit backend on http://127.0.0.1:5050. Please ensure python3 backend/app.py is running on port 5050.'
      );
      setBackendHealth((prev) => ({
        ...prev,
        status: 'disconnected',
        is_real_qiskit: false,
      }));
    } finally {
      setIsLoading(false);
    }
  }, [scenario, numBits, noiseRate, eveRate, sampleRatio]);

  // Initial load: check health and run initial simulation
  useEffect(() => {
    checkBackendHealth();
    handleRunSimulation();
  }, []);

  const selectedQubit = result?.transmissions?.find((t) => t.index === selectedQubitIndex) || null;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation Bar */}
      <Header
        backendHealth={backendHealth}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-8">
        {/* Hero & Hackathon Context Banner */}
        <div className="border-b border-slate-800/80 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-widest flex-wrap">
              <span>AU Qiskit Fall Fest</span>
              <span>·</span>
              <span>Track 7: Quantum Cryptography</span>
              <span>·</span>
              <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold ${
                backendHealth.status === 'connected'
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-amber-950/80 text-amber-300 border border-amber-800'
              }`}>
                {backendHealth.status === 'connected' ? 'Actual Qiskit Backend Mode' : 'Demo Mode (Backend Disconnected)'}
              </span>
              {backendHealth.status === 'connected' && (
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-cyan-400" />
                  <span>Powered by Qiskit Aer</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-1">
              Q-Sentinel: BB84 Quantum Key Distribution Simulator
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1.5 max-w-3xl leading-relaxed">
              An educational quantum cybersecurity simulator demonstrating state preparation, conjugate basis measurements,
              wave-function collapse eavesdropping detection, and Shor-Preskill privacy amplification boundaries.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <button
              onClick={() => {
                setScenario('ideal');
                setTimeout(() => handleRunSimulation(), 50);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/50 transition-colors cursor-pointer"
            >
              Run Ideal
            </button>
            <button
              onClick={() => {
                setScenario('eve');
                setTimeout(() => handleRunSimulation(), 50);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/50 transition-colors cursor-pointer"
            >
              Run Eve
            </button>
            <button
              onClick={() => {
                setScenario('noisy');
                setTimeout(() => handleRunSimulation(), 50);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 border border-amber-800/50 transition-colors cursor-pointer"
            >
              Run Noisy
            </button>
            <button
              onClick={() => {
                setScenario('combined');
                setTimeout(() => handleRunSimulation(), 50);
              }}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-950/40 hover:bg-purple-900/50 text-purple-300 border border-purple-800/50 transition-colors cursor-pointer"
            >
              Run Combined
            </button>
          </div>
        </div>

        {/* Section 1: Concept Explanation of BB84 & Actors */}
        <section id="protocol">
          <ConceptOverview />
        </section>

        {/* Section 2: Experiment Controls Studio */}
        <section id="simulation">
          <ExperimentControls
            scenario={scenario}
            onSelectScenario={(s) => setScenario(s)}
            numBits={numBits}
            onChangeNumBits={setNumBits}
            noiseRate={noiseRate}
            onChangeNoiseRate={setNoiseRate}
            eveRate={eveRate}
            onChangeEveRate={setEveRate}
            sampleRatio={sampleRatio}
            onChangeSampleRatio={setSampleRatio}
            isLoading={isLoading}
            onRunSimulation={handleRunSimulation}
            backendHealth={backendHealth}
            backendError={backendError}
          />
        </section>

        {/* Section 3: Simulation Results Cards & Sifted Key Deck */}
        <section id="results">
          <ResultsDeck
            result={result}
            onSelectQubit={setSelectedQubitIndex}
            selectedQubitIndex={selectedQubitIndex}
          />
        </section>

        {/* Section 4: Circuit Visualizer (Clearly distinguishing Illustrative vs Real Qiskit) */}
        <section id="circuit">
          <CircuitVisualizer
            selectedQubit={selectedQubit}
            qiskitAsciiCircuit={result?.qiskit_ascii_circuit || ''}
            openqasm={result?.openqasm}
            isRealQiskit={backendHealth.status === 'connected'}
          />
        </section>

        {/* Section 5: Transmission Inspector (Photon-by-photon table) */}
        {result && result.transmissions && (
          <section id="telemetry">
            <TransmissionTable
              transmissions={result.transmissions}
              selectedQubitIndex={selectedQubitIndex}
              onSelectQubit={setSelectedQubitIndex}
            />
          </section>
        )}

        {/* Section 6: Comparison Chart & Threshold Bounds */}
        <section id="comparison">
          <ComparisonChart history={history} />
        </section>

        {/* Section 7: Theoretical Rigor, Mathematical Proof & Limitations of QBER */}
        <section id="theory">
          <TheoryAndLimitations />
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-300">Q-Sentinel Simulator</span>
            <span>·</span>
            <span>AU Qiskit Fall Fest Track 7 Prototype</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <button
              onClick={() => setIsBackendModalOpen(true)}
              className="hover:text-cyan-300 transition-colors cursor-pointer"
            >
              Backend API Contract
            </button>
            <span>·</span>
            <span>Powered by Qiskit Aer</span>
            <span>·</span>
            <span>Educational Use Only</span>
          </div>
        </div>
      </footer>

      {/* Backend & Qiskit Setup Modal */}
      <BackendModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        backendHealth={backendHealth}
        onRefreshHealth={checkBackendHealth}
      />
    </div>
  );
}
