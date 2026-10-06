# 🛡️ Q-Sentinel
## BB84 Quantum Key Distribution & Eavesdropping Detection Simulator

Q-Sentinel is a web-based Quantum Key Distribution (QKD) simulator based on the **BB84 protocol**. It uses a real **Qiskit + Qiskit Aer** Python backend to simulate quantum transmission, eavesdropping, channel noise, key sifting, and Quantum Bit Error Rate (QBER) analysis.

The project combines a modern interactive frontend with a Python Flask API and Qiskit Aer quantum simulation engine.

---

## 🎯 Problem Statement

Quantum computers may threaten traditional cryptographic systems. Quantum Key Distribution provides a way to detect eavesdropping using the principles of quantum mechanics.

Q-Sentinel demonstrates how the BB84 protocol behaves under:

- Ideal quantum communication
- Eavesdropping using intercept-resend
- Channel noise
- Combined eavesdropping and noise

The simulator helps visualize how QBER changes when the communication channel is attacked or disturbed.

---

## 💡 Proposed Solution

Q-Sentinel creates an end-to-end BB84 simulation:

**Alice → Quantum Channel → Eve → Bob**

The system:

1. Generates random bits and quantum bases for Alice.
2. Encodes information using BB84 basis states.
3. Allows Eve to intercept and resend qubits.
4. Allows configurable channel noise.
5. Generates Bob's measurement results.
6. Performs basis sifting.
7. Samples the sifted key to estimate QBER.
8. Reports errors, QBER, retained key bits and protocol verdict.

---

# ⚛️ BB84 Methodology

BB84 uses two measurement bases:

### Z / Rectilinear Basis
- `|0⟩`
- `|1⟩`

### X / Diagonal Basis
- `|+⟩`
- `|−⟩`

Alice randomly chooses a bit and basis for each qubit.

Bob independently chooses a random measurement basis.

After transmission, Alice and Bob publicly compare their bases and retain only positions where their bases match.

This produces the **sifted key**.

A subset of the sifted key is then compared to estimate:

**QBER = Number of mismatched test bits / Number of test bits**

---

# 🧑‍💻 System Architecture

```text
┌──────────────────────────┐
│     Q-Sentinel Frontend  │
│   React / Google AI      │
│   Studio Interface       │
└────────────┬─────────────┘
             │
             │ POST /api/simulate
             │ JSON
             ▼
┌──────────────────────────┐
│     Python Flask API     │
│      Q-Sentinel Backend  │
└────────────┬─────────────┘
             │
             ▼
┌──────────────────────────┐
│       Qiskit Aer         │
│    AerSimulator Engine   │
└────────────┬─────────────┘
             │
             ▼
       Simulation Results
             │
             ▼
┌──────────────────────────┐
│ QBER • Errors • Key      │
│ Verdict • Sifted Key     │
└──────────────────────────┘
🔬 Quantum Circuit Design

A BB84 transmission can be represented as:

Alice
  │
  ├── Random classical bit
  │
  ├── Basis selection
  │
  ▼
┌─────────────┐
│ H Gate       │  ← X-basis preparation
└──────┬──────┘
       │
       ▼
   Quantum Channel
       │
       ▼
┌────────────────────┐
│ Eve (optional)     │
│ Measure + Resend   │
└─────────┬──────────┘
          │
          ▼
┌────────────────────┐
│ Bob Measurement    │
│ Random Basis       │
└─────────┬──────────┘
          │
          ▼
    Basis Sifting
          │
          ▼
        QBER
Qiskit Circuit Concept

For an X-basis state, a Hadamard gate is applied before measurement:

from qiskit import QuantumCircuit

qc = QuantumCircuit(1, 1)

# Prepare |+> state
qc.h(0)

# Measure
qc.measure(0, 0)

For the Z basis, the qubit can remain in the computational basis.

The actual project backend dynamically constructs and executes Qiskit circuits for the BB84 simulation.

🕵️ Eve Intercept-Resend Attack

Q-Sentinel simulates an intercept-resend attack.

Eve:

Intercepts the transmitted qubit.
Chooses a measurement basis.
Measures the qubit.
Prepares a new qubit based on her measurement.
Sends the new qubit to Bob.

Because Eve does not always choose the same basis as Alice, her intervention introduces errors that can increase QBER.

📊 Simulation Scenarios

Q-Sentinel supports four scenarios:

Scenario	Description
ideal	No eavesdropping and no channel noise
eve	Intercept-resend eavesdropping
noisy	Quantum channel noise
combined	Eavesdropping + channel noise
📈 QBER Analysis

The simulator calculates:

Transmitted qubits
Matching bases
Sifted key length
Test sample size
Number of errors
QBER
Eve interception rate
Channel noise
Protocol verdict

Example API result:

{
  "transmittedQubits": 32,
  "matchingBases": 20,
  "siftedKeyLength": 20,
  "testSampleSize": 10,
  "errors": 5,
  "qber": 0.5,
  "qberPercent": 50.0,
  "eveInterceptRate": 1.0,
  "noise": 0.0,
  "executionMode": "Qiskit Aer",
  "engine": "Qiskit AerSimulator",
  "verdict": "ABORT"
}
⚙️ Technology Stack
Frontend
React
TypeScript
Google AI Studio
Vite
Backend
Python
Flask
Flask-CORS
Quantum Computing
Qiskit
Qiskit Aer
AerSimulator
Deployment
Vercel — Frontend
Cloud Run — Python backend
🚀 Installation
Backend

Clone the repository:

git clone https://github.com/YOUR-USERNAME/Q-Sentinel.git
cd Q-Sentinel

Create a virtual environment:

Windows
python -m venv .venv
.venv\Scripts\activate
Linux / macOS
python3 -m venv .venv
source .venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run the backend:

python app.py

The backend runs on:

http://127.0.0.1:5050

Health check:

GET /health

Simulation endpoint:

POST /api/simulate
🧪 API Example
Request
{
  "scenario": "eve",
  "qubits": 128,
  "eveInterceptRate": 1.0,
  "qberTestSampleRatio": 0.5
}
Endpoint
POST http://127.0.0.1:5050/api/simulate
🖥️ Frontend

Open the Q-Sentinel frontend in Google AI Studio.

Ensure the backend target is configured as:

http://127.0.0.1:5050

Run the application and select a simulation scenario.

The frontend sends the simulation parameters to the Python backend and displays the returned Qiskit results.

📁 Project Structure
Q-Sentinel/
│
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── Dockerfile
│   └── README.md
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── docs/
│   ├── circuit.png
│   └── screenshots/
│
└── README.md
🧪 Experimental Evaluation

The system can be evaluated by comparing QBER across different scenarios.

Ideal Channel

Expected behavior:

Very low QBER
No intentional eavesdropping
Key transmission proceeds normally
Eve Intercept-Resend

Expected behavior:

Increased QBER
Errors introduced by Eve's measurements
High QBER can cause protocol abortion
Noisy Channel

Expected behavior:

QBER increases depending on channel noise
Demonstrates the effect of imperfect communication
Combined Attack

Expected behavior:

Eavesdropping and noise both contribute to errors
QBER generally increases further

Because the simulation uses random quantum bits and bases, individual results can vary between runs.

⚠️ Limitations
QBER is an error-rate estimate and is not by itself a standalone proof of security.
Simulation results vary because BB84 uses random choices.
The project uses a simulated quantum backend rather than claiming execution on a fault-tolerant quantum computer.
The project does not claim quantum advantage without experimental evidence.
The current implementation is designed primarily for demonstration, education and research prototyping.
🌟 Innovation

Q-Sentinel combines:

BB84 quantum key distribution
Interactive eavesdropping simulation
QBER-based anomaly detection
Real Qiskit Aer simulation
Visual Alice → Eve → Bob communication
Multiple channel conditions
Interactive frontend
Python quantum backend

The goal is to make quantum cybersecurity concepts understandable through an executable simulation rather than only theoretical explanation.

📌 Future Enhancements
Execution on real IBM Quantum hardware
Qiskit Runtime integration
More advanced noise models
Statistical confidence intervals for QBER
Larger-scale experiments
Real-time QBER monitoring
Post-quantum cryptography comparison
Multi-user QKD simulation
