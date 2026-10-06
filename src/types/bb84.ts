export type ScenarioType = 'ideal' | 'eve' | 'noisy' | 'combined' | 'intercept_resend';

export interface TransmissionItem {
  index: number;
  alice_bit: number;
  alice_basis: '+' | 'x';
  alice_state: string;
  eve_intercepted: boolean;
  eve_basis: '+' | 'x' | null;
  eve_bit: number | null;
  channel_noise: boolean;
  bob_basis: '+' | 'x';
  bob_bit: number;
  bases_match: boolean;
  bit_match: boolean;
  is_sample: boolean;
  has_error: boolean;
}

export interface SimulationResult {
  // Required Qiskit API Contract fields
  transmittedQubits: number;
  matchingBases: number;
  siftedKeyLength: number;
  testSampleSize: number;
  errors: number;
  qber: number;
  qberPercent: string;
  thresholdPercent: string;
  verdict: string;
  aliceSiftedBits: string;
  bobSiftedBits: string;
  retainedAliceBits: string;
  retainedBobBits: string;
  eveInterceptRate: number;
  noise: number;
  executionMode: string;
  engine: string;
  note: string;

  // Visualizer & Telemetry fields
  scenario: ScenarioType;
  transmitted_count: number;
  matching_basis_count: number;
  sifted_key_length: number;
  test_sample_size: number;
  test_sample_errors: number;
  estimated_qber: number;
  threshold: number;
  security_verdict: 'SECURE' | 'ABORT' | string;
  experiment_settings?: {
    num_bits: number;
    scenario: ScenarioType;
    noise_rate: number;
    eve_intercept_rate: number;
    sample_ratio: number;
  };
  raw_secret_key_alice?: string;
  raw_secret_key_bob?: string;
  transmissions: TransmissionItem[];
  qiskit_ascii_circuit: string;
  openqasm?: string;
  backend_engine?: {
    has_qiskit: boolean;
    has_aer: boolean;
    qiskit_version: string | null;
    is_real_qiskit: boolean;
  };
  backend_info?: {
    server: string;
    connected: boolean;
    is_real_qiskit: boolean;
    engine: string;
    notice?: string;
  };
}

export interface BackendHealth {
  status: 'connected' | 'disconnected' | 'checking';
  backend_url: string;
  has_qiskit?: boolean;
  has_aer?: boolean;
  is_real_qiskit?: boolean;
  message?: string;
}

export interface ExperimentHistoryItem {
  id: string;
  timestamp: string;
  scenario: ScenarioType;
  num_bits: number;
  qber: number;
  qberPercent?: string;
  verdict: string;
  sifted_length: number;
  matching_basis_count: number;
  is_real_qiskit: boolean;
  executionMode?: string;
}
