import React, { useState, useEffect } from 'react';
import { X, Terminal, CheckCircle2, AlertCircle, RefreshCw, Copy, Check, ExternalLink, Code } from 'lucide-react';
import { BackendHealth } from '../types/bb84';

interface BackendModalProps {
  isOpen: boolean;
  onClose: () => void;
  backendHealth: BackendHealth;
  onRefreshHealth: () => Promise<void>;
}

export const BackendModal: React.FC<BackendModalProps> = ({
  isOpen,
  onClose,
  backendHealth,
  onRefreshHealth,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'contract' | 'code'>('status');
  const [pythonCode, setPythonCode] = useState<string>('');
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === 'code' && !pythonCode) {
      setIsLoadingCode(true);
      fetch('/api/python-code')
        .then((r) => r.text())
        .then((text) => setPythonCode(text))
        .catch(() => setPythonCode('# Error loading Python Qiskit source code'))
        .finally(() => setIsLoadingCode(false));
    }
  }, [isOpen, activeTab, pythonCode]);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefreshHealth();
    setIsRefreshing(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isConnected = backendHealth.status === 'connected';
  const isRealQiskit = backendHealth.is_real_qiskit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Qiskit Backend & API Architecture</h3>
              <p className="text-xs text-slate-400">AU Qiskit Fall Fest Track 7 Integration Interface</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/30 text-xs">
          <button
            onClick={() => setActiveTab('status')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'status'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Backend Health & Runtime
          </button>
          <button
            onClick={() => setActiveTab('contract')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'contract'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            REST API Contract
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'code'
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Python Qiskit Source Code
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-300">
          {activeTab === 'status' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isConnected
                        ? isRealQiskit
                          ? 'bg-emerald-400 animate-pulse'
                          : 'bg-cyan-400'
                        : 'bg-amber-400'
                    }`}
                  />
                  <div>
                    <div className="font-bold text-white text-sm">
                      {isConnected
                        ? isRealQiskit
                          ? 'IBM Qiskit Aer Engine Connected'
                          : 'Python Backend Daemon Active'
                        : 'Local Demonstration Fallback Active'}
                    </div>
                    <div className="text-slate-400 text-xs mt-0.5">
                      Target URL: <code className="text-cyan-300 font-mono">{backendHealth.backend_url}</code>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Check Ping</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px] font-sans">Qiskit Installed:</span>
                  <span className={backendHealth.has_qiskit ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {backendHealth.has_qiskit ? 'YES (qiskit 1.x)' : 'Container Sandbox Mode'}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[11px] font-sans">Qiskit Aer Simulator:</span>
                  <span className={backendHealth.has_aer ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                    {backendHealth.has_aer ? 'YES (qiskit-aer)' : 'Statevector Engine'}
                  </span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>How to Run the Real Qiskit Backend Locally</span>
                </div>
                <p className="text-slate-400 leading-relaxed">
                  The Python simulation backend is located in <code className="text-cyan-300">/backend</code>.
                  You can deploy it locally or on any server:
                </p>
                <pre className="p-3 bg-slate-900 rounded-lg font-mono text-cyan-300 text-xs overflow-x-auto">
{`# 1. Enter backend directory
cd backend

# 2. Install Qiskit & Aer dependencies
pip install -r requirements.txt

# 3. Start Python API server (runs on port 5050 or PYTHON_PORT)
python3 app.py`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'contract' && (
            <div className="space-y-4">
              <p className="text-slate-400">
                The frontend communicates with the quantum backend via standard JSON HTTP requests.
              </p>

              <div>
                <div className="font-bold text-white mb-1.5 flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-xs">
                    POST
                  </span>
                  <code className="text-sm font-mono text-cyan-300">/api/simulate</code>
                </div>
                <p className="text-slate-400 mb-2">Request Body Specification:</p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-slate-300 text-xs overflow-x-auto">
{`{
  "scenario": "ideal" | "intercept_resend" | "noisy",
  "num_bits": 32,
  "noise_rate": 0.08,
  "eve_intercept_rate": 1.0,
  "sample_ratio": 0.5
}`}
                </pre>
              </div>

              <div>
                <p className="text-slate-400 mb-2">Response Specification:</p>
                <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-emerald-300 text-xs overflow-x-auto max-h-60">
{`{
  "scenario": "intercept_resend",
  "transmitted_count": 32,
  "matching_basis_count": 17,
  "sifted_key_length": 8,
  "test_sample_size": 9,
  "test_sample_errors": 2,
  "estimated_qber": 0.2222,
  "threshold": 0.11,
  "security_verdict": "ABORT",
  "experiment_settings": { ... },
  "qiskit_ascii_circuit": "...",
  "transmissions": [ ... ]
}`}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-mono">backend/bb84_qiskit.py</span>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded border border-slate-700 transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Code'}</span>
                </button>
              </div>

              {isLoadingCode ? (
                <div className="p-8 text-center text-slate-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-cyan-400" />
                  <span>Loading source file...</span>
                </div>
              ) : (
                <pre className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-cyan-300 text-xs overflow-x-auto max-h-[400px] leading-relaxed">
                  {pythonCode}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            AU Qiskit Fall Fest Track 7 · Prototype Simulator
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
