# Q-Sentinel: Python Qiskit BB84 Backend
**AU Qiskit Fall Fest Track 7**

## Overview
This backend implements the Bennett-Brassard 1984 (BB84) Quantum Key Distribution protocol utilizing IBM Qiskit and Qiskit Aer. It exposes a clean REST API interface consumed by the Q-Sentinel frontend simulator.

## Architecture
- **State Preparation**: Alice prepares quantum states $|\psi\rangle \in \{|0\rangle, |1\rangle, |+\rangle, |-\rangle\}$ using Pauli-$X$ and Hadamard ($H$) gates.
- **Quantum Channel**:
  - `ideal`: Lossless, noiseless fiber transmission.
  - `intercept_resend`: Eve performs intercept-resend attack in random conjugate bases ($\boxplus$ or $\boxtimes$), triggering state vector collapse.
  - `noisy`: Fiber depolarization and phase flips simulated via parameterized quantum channels.
- **Bob Measurement**: Bob applies basis rotations ($H$ for $\boxtimes$) and measures in the computational basis using Qiskit Aer Simulator.
- **Sifting & QBER Verification**: Public basis exchange, sifting, random sample disclosure, and Quantum Bit Error Rate calculation checked against the theoretical $\sim 11\%$ Shor-Preskill security bound.

## Running Locally

1. Create a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Launch the API server:
   ```bash
   python3 app.py
   # Server runs on http://localhost:8000
   ```

## API Contract

### Health Check
`GET /api/health`
```json
{
  "status": "healthy",
  "service": "Q-Sentinel Qiskit Aer Backend",
  "fest": "AU Qiskit Fall Fest Track 7",
  "has_qiskit": true,
  "has_aer": true,
  "is_real_qiskit": true
}
```

### Run Simulation
`POST /api/simulate`
Payload:
```json
{
  "scenario": "intercept_resend",
  "num_bits": 32,
  "noise_rate": 0.08,
  "eve_intercept_rate": 1.0,
  "sample_ratio": 0.5
}
```
Response:
```json
{
  "scenario": "intercept_resend",
  "transmitted_count": 32,
  "matching_basis_count": 16,
  "sifted_key_length": 8,
  "test_sample_size": 8,
  "test_sample_errors": 2,
  "estimated_qber": 0.25,
  "threshold": 0.11,
  "security_verdict": "ABORT",
  "experiment_settings": { ... },
  "qiskit_ascii_circuit": "...",
  "transmissions": [ ... ]
}
```
