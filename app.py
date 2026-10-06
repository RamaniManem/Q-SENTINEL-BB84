from flask import Flask, request, jsonify
from flask_cors import CORS
from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
import random
import math

app = Flask(__name__)
CORS(app)

simulator = AerSimulator()

THRESHOLD = 0.11

def shannon_entropy(q):
    if q <= 0 or q >= 1:
        return 0.0
    return -q * math.log2(q) - (1-q) * math.log2(1-q)

def measure_circuit(qc):
    result = simulator.run(qc, shots=1).result()
    counts = result.get_counts()
    bit = next(iter(counts)).replace(" ", "")[-1]
    return int(bit)

def prepare_state(qc, bit, basis):
    # Z/rectilinear: |0>, |1>
    # X/diagonal: |+>, |->
    if bit == 1:
        qc.x(0)
    if basis == "X":
        qc.h(0)

def measure_in_basis(qc, basis):
    if basis == "X":
        qc.h(0)
    qc.measure(0, 0)

def simulate_qubit(alice_bit, alice_basis, bob_basis, eve=False, eve_rate=1.0, noise=0.0):
    # Ideal channel: Alice's state is sent to Bob.
    # Eve intercept-resend is modeled with real Qiskit circuits:
    # Eve measures in a random basis, then a second Qiskit circuit
    # prepares the state Eve resends.
    received_bit = alice_bit
    received_basis = alice_basis

    if eve and random.random() < eve_rate:
        eve_basis = random.choice(["Z", "X"])

        eve_qc = QuantumCircuit(1, 1)
        prepare_state(eve_qc, alice_bit, alice_basis)
        measure_in_basis(eve_qc, eve_basis)
        eve_bit = measure_circuit(eve_qc)

        received_bit = eve_bit
        received_basis = eve_basis

    # Re-create the state being sent onward.
    bob_qc = QuantumCircuit(1, 1)
    prepare_state(bob_qc, received_bit, received_basis)

    # Simple configurable channel noise.
    if noise > 0 and random.random() < noise:
        # Random X/Z disturbance. Either can produce an observed
        # measurement error depending on Bob's basis.
        random.choice([bob_qc.x, bob_qc.z])(0)

    measure_in_basis(bob_qc, bob_basis)
    bob_bit = measure_circuit(bob_qc)
    return bob_bit

@app.get("/")
def home():
    return jsonify({
        "service": "Q-Sentinel BB84 Backend",
        "status": "online",
        "engine": "Qiskit + Qiskit Aer",
        "endpoint": "POST /api/simulate"
    })

@app.get("/health")
def health():
    return jsonify({"status": "ok", "qiskit": True, "engine": "Qiskit Aer"})

@app.post("/api/simulate")
def simulate():
    data = request.get_json(silent=True) or {}

    scenario = str(data.get("scenario", "ideal")).lower()
    n = int(data.get("qubits", data.get("numBits", 32)))
    n = max(16, min(n, 512))

    eve = scenario in ("eve", "intercept", "intercept-resend", "intercept_resend")
    noisy = scenario in ("noise", "noisy", "noisy-channel", "noisy_channel", "combined")
    combined = scenario in ("combined", "eve-noise", "combined-disturbance")

    if combined:
        eve = True
        noisy = True

    eve_rate = float(data.get("eveInterceptRate", 1.0))
    eve_rate = max(0.0, min(1.0, eve_rate))
    noise = float(data.get("noise", 0.0))
    if noisy and noise <= 0:
        noise = 0.10
    noise = max(0.0, min(1.0, noise))

    test_ratio = float(data.get("qberTestSampleRatio", 0.50))
    test_ratio = max(0.10, min(0.90, test_ratio))

    alice_bits = [random.randint(0, 1) for _ in range(n)]
    alice_bases = [random.choice(["Z", "X"]) for _ in range(n)]
    bob_bases = [random.choice(["Z", "X"]) for _ in range(n)]

    bob_bits = []
    for i in range(n):
        bob_bits.append(
            simulate_qubit(
                alice_bits[i],
                alice_bases[i],
                bob_bases[i],
                eve=eve,
                eve_rate=eve_rate,
                noise=noise if noisy else 0.0,
            )
        )

    matching = [i for i in range(n) if alice_bases[i] == bob_bases[i]]
    sifted_alice = [alice_bits[i] for i in matching]
    sifted_bob = [bob_bits[i] for i in matching]

    sifted_len = len(matching)
    sample_size = max(1, int(round(sifted_len * test_ratio))) if sifted_len else 0

    sample_indices = set(random.sample(range(sifted_len), sample_size)) if sample_size else set()
    errors = sum(
        sifted_alice[i] != sifted_bob[i]
        for i in sample_indices
    )
    qber = errors / sample_size if sample_size else 0.0

    verdict = "ABORT" if qber >= THRESHOLD else "CONTINUE"

    retained_alice = [b for i, b in enumerate(sifted_alice) if i not in sample_indices]
    retained_bob = [b for i, b in enumerate(sifted_bob) if i not in sample_indices]

    return jsonify({
        "scenario": scenario,
        "executionMode": "Qiskit Aer",
        "engine": "Qiskit AerSimulator",
        "transmittedQubits": n,
        "matchingBases": sifted_len,
        "siftedKeyLength": sifted_len,
        "testSampleSize": sample_size,
        "errors": errors,
        "qber": qber,
        "qberPercent": round(qber * 100, 2),
        "thresholdPercent": 11.0,
        "verdict": verdict,
        "aliceSiftedBits": "".join(map(str, sifted_alice)),
        "bobSiftedBits": "".join(map(str, sifted_bob)),
        "retainedAliceBits": "".join(map(str, retained_alice)),
        "retainedBobBits": "".join(map(str, retained_bob)),
        "eveInterceptRate": eve_rate if eve else 0.0,
        "noise": noise if noisy else 0.0,
        "note": "QBER is an error-rate estimate, not a standalone proof of security."
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050, debug=False)
