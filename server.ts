import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_BACKEND_URL = process.env.PYTHON_BACKEND_URL || 'http://127.0.0.1:5050';

async function startServer() {
  const app = express();
  app.use(express.json());

  // 1. Health check endpoint: tests connection to Python backend
  app.get('/api/health', async (req, res) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      const resp = await fetch(`${PYTHON_BACKEND_URL}/api/health`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        return res.json({
          status: 'connected',
          backend_url: PYTHON_BACKEND_URL,
          python_data: data
        });
      }
    } catch (err: any) {
      // Backend not reachable
    }

    return res.json({
      status: 'disconnected',
      backend_url: PYTHON_BACKEND_URL,
      message: 'Python Qiskit backend is offline or unreachable on ' + PYTHON_BACKEND_URL
    });
  });

  // 2. Simulation endpoint: forwards request to Python backend
  app.post('/api/simulate', async (req, res) => {
    const payload = req.body || {};
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const resp = await fetch(`${PYTHON_BACKEND_URL}/api/simulate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        return res.json(data);
      }
    } catch (err) {
      // Python backend offline; return fallback demo mode with clear disclaimer
    }

    // Fallback: clearly labelled educational demo mode
    const numBits = Math.max(8, Math.min(Number(payload.num_bits) || 32, 256));
    const scenario = payload.scenario || 'ideal';
    const noiseRate = Number(payload.noise_rate) || 0.08;
    const eveRate = Number(payload.eve_intercept_rate) || 1.0;
    const sampleRatio = Number(payload.sample_ratio) || 0.5;

    // Simulated pedagogical dataset with strict label
    const transmissions: any[] = [];
    for (let i = 0; i < numBits; i++) {
      const aBit = Math.random() < 0.5 ? 0 : 1;
      const aBasis = Math.random() < 0.5 ? '+' : 'x';
      const bBasis = Math.random() < 0.5 ? '+' : 'x';
      
      let eveIntercepted = false;
      let eveBasis = null;
      let eveBit = null;
      let curBit = aBit;
      let curBasis = aBasis;

      if (scenario === 'intercept_resend' && Math.random() < eveRate) {
        eveIntercepted = true;
        eveBasis = Math.random() < 0.5 ? '+' : 'x';
        eveBit = eveBasis === aBasis ? aBit : (Math.random() < 0.5 ? 0 : 1);
        curBit = eveBit;
        curBasis = eveBasis;
      }

      let noiseOccurred = false;
      if (scenario === 'noisy' && Math.random() < noiseRate) {
        noiseOccurred = true;
        curBit = 1 - curBit;
      }

      let bBit = (bBasis === curBasis) ? curBit : (Math.random() < 0.5 ? 0 : 1);
      const basesMatch = aBasis === bBasis;
      const bitMatch = aBit === bBit;

      transmissions.push({
        index: i,
        alice_bit: aBit,
        alice_basis: aBasis,
        alice_state: aBasis === '+' ? (aBit === 0 ? '|0⟩' : '|1⟩') : (aBit === 0 ? '|+⟩' : '|-⟩'),
        eve_intercepted: eveIntercepted,
        eve_basis: eveBasis,
        eve_bit: eveBit,
        channel_noise: noiseOccurred,
        bob_basis: bBasis,
        bob_bit: bBit,
        bases_match: basesMatch,
        bit_match: bitMatch,
        is_sample: false,
        has_error: false
      });
    }

    const sifted = transmissions.filter(t => t.bases_match);
    const matchingCount = sifted.length;
    const sampleSize = Math.max(1, Math.min(matchingCount, Math.round(matchingCount * sampleRatio)));
    
    // Sample error count
    const shuffled = [...sifted].sort(() => 0.5 - Math.random());
    const sampled = new Set(shuffled.slice(0, sampleSize).map(t => t.index));
    let errors = 0;
    const rawAlice: string[] = [];
    const rawBob: string[] = [];

    transmissions.forEach(t => {
      if (sampled.has(t.index)) {
        t.is_sample = true;
        if (t.alice_bit !== t.bob_bit) {
          t.has_error = true;
          errors++;
        }
      } else if (t.bases_match) {
        rawAlice.push(String(t.alice_bit));
        rawBob.push(String(t.bob_bit));
      }
    });

    const qber = sampleSize > 0 ? errors / sampleSize : 0;
    const threshold = 0.11;
    const allAliceSifted = sifted.map(t => String(t.alice_bit)).join('');
    const allBobSifted = sifted.map(t => String(t.bob_bit)).join('');

    return res.json({
      transmittedQubits: numBits,
      matchingBases: matchingCount,
      siftedKeyLength: rawAlice.length,
      testSampleSize: sampleSize,
      errors: errors,
      qber: Number(qber.toFixed(4)),
      qberPercent: `${(qber * 100).toFixed(1)}%`,
      thresholdPercent: '11.0%',
      verdict: qber < threshold ? 'QBER below configured threshold -> Continue protocol checks' : 'ABORT PROTOCOL -> Threshold exceeded',
      aliceSiftedBits: allAliceSifted,
      bobSiftedBits: allBobSifted,
      retainedAliceBits: rawAlice.join(''),
      retainedBobBits: rawBob.join(''),
      eveInterceptRate: eveRate,
      noise: noiseRate,
      executionMode: 'Demo Mode (Backend Disconnected)',
      engine: 'Fallback Engine',
      note: 'DEMO MODE: Backend disconnected. QBER is an error-rate estimate, not a standalone proof of security.',
      scenario,
      transmitted_count: numBits,
      matching_basis_count: matchingCount,
      sifted_key_length: rawAlice.length,
      test_sample_size: sampleSize,
      test_sample_errors: errors,
      estimated_qber: Number(qber.toFixed(4)),
      threshold,
      security_verdict: qber < threshold ? 'SECURE' : 'ABORT',
      experiment_settings: {
        num_bits: numBits,
        scenario,
        noise_rate: noiseRate,
        eve_intercept_rate: eveRate,
        sample_ratio: sampleRatio
      },
      raw_secret_key_alice: rawAlice.join(''),
      raw_secret_key_bob: rawBob.join(''),
      transmissions,
      qiskit_ascii_circuit: 
        "Alice Prep            Eve Intercept         Bob Measure\n" +
        "q_0: ──[X]──[H]──░───[H]───[M_eve]───[H]──░───[H]───[M_bob]──\n" +
        "                 ░           ║             ░           ║     \n" +
        "c_eve: ══════════════════════╩═════════════════════════╬═════\n" +
        "c_bob: ════════════════════════════════════════════════╩═════\n",
      openqasm: 'OPENQASM 3.0;\ninclude "stdgates.inc";\nqubit q[1];\nbit c_bob[1];\nh q[0];\nh q[0];\nc_bob[0] = measure q[0];\n',
      backend_engine: {
        has_qiskit: false,
        has_aer: false,
        qiskit_version: null,
        is_real_qiskit: false,
      },
      backend_info: {
        server: 'Local Fallback Engine',
        connected: false,
        is_real_qiskit: false,
        engine: 'Simulated Pedagogical Preview (Backend Disconnected)',
        notice: 'DEMO MODE: The Python Qiskit Aer backend is currently disconnected. This is pedagogical demonstration data, NOT real Qiskit execution.'
      }
    });
  });

  // 3. Endpoint to fetch Python Qiskit backend source code
  app.get('/api/python-code', (req, res) => {
    try {
      const codePath = path.resolve(__dirname, 'backend', 'bb84_qiskit.py');
      if (fs.existsSync(codePath)) {
        const code = fs.readFileSync(codePath, 'utf-8');
        return res.type('text/plain').send(code);
      }
    } catch (e) {
      // ignore
    }
    res.type('text/plain').send('# Python Qiskit backend code available in /backend/bb84_qiskit.py');
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = Number(process.env.PORT) || 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`Q-Sentinel full-stack server listening on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
