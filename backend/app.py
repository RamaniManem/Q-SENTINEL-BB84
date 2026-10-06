#!/usr/bin/env python3
"""
Q-Sentinel Backend Server
BB84 QKD & Eavesdropping Detection API for AU Qiskit Fall Fest Track 7.

Can run with standard Python 3 standard library or with Flask.
Provides:
  - GET  /api/health
  - POST /api/simulate
  - GET  /api/circuit-info
"""

import sys
import json
import os
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse

# Import the BB84 simulation logic
try:
    from bb84_qiskit import simulate_bb84, HAS_QISKIT, HAS_AER
except ImportError:
    from backend.bb84_qiskit import simulate_bb84, HAS_QISKIT, HAS_AER


class QSentinelAPIHandler(BaseHTTPRequestHandler):
    def _send_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")

    def do_OPTIONS(self):
        self.send_response(204)
        self._send_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path in ["/api/health", "/health", "/"]:
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            payload = {
                "status": "healthy",
                "service": "Q-Sentinel Qiskit Aer Backend",
                "fest": "AU Qiskit Fall Fest Track 7",
                "has_qiskit": HAS_QISKIT,
                "has_aer": HAS_AER,
                "is_real_qiskit": HAS_QISKIT and HAS_AER,
                "python_version": sys.version
            }
            self.wfile.write(json.dumps(payload).encode("utf-8"))
            return

        elif path == "/api/code":
            self.send_response(200)
            self.send_header("Content-Type", "text/plain")
            self._send_cors_headers()
            self.end_headers()
            curr_dir = os.path.dirname(os.path.abspath(__file__))
            file_path = os.path.join(curr_dir, "bb84_qiskit.py")
            if os.path.exists(file_path):
                with open(file_path, "r", encoding="utf-8") as f:
                    self.wfile.write(f.read().encode("utf-8"))
            else:
                self.wfile.write(b"# File not found")
            return

        self.send_response(404)
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(b'{"error": "Not found"}')

    def do_POST(self):
        parsed = urlparse(self.path)
        path = parsed.path

        if path == "/api/simulate":
            content_length = int(self.headers.get("Content-Length", 0))
            body_bytes = self.rfile.read(content_length)
            
            try:
                data = json.loads(body_bytes.decode("utf-8")) if body_bytes else {}
            except Exception:
                data = {}

            scenario = data.get("scenario", "ideal")
            qubits = data.get("qubits", data.get("num_bits", 128))
            eve_rate = data.get("eveInterceptRate", data.get("eve_intercept_rate", 0.0 if scenario == "ideal" else 1.0))
            noise = data.get("noise", data.get("noise_rate", 0.08 if scenario == "noisy" else 0.0))
            sample_ratio = data.get("qberTestSampleRatio", data.get("sample_ratio", 0.5))

            result = simulate_bb84(
                scenario=scenario,
                qubits=qubits,
                eveInterceptRate=eve_rate,
                noise=noise,
                qberTestSampleRatio=sample_ratio
            )

            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self._send_cors_headers()
            self.end_headers()
            self.wfile.write(json.dumps(result, indent=2).encode("utf-8"))
            return

        self.send_response(404)
        self._send_cors_headers()
        self.end_headers()
        self.wfile.write(b'{"error": "Not found"}')

    def log_message(self, format, *args):
        # Quiet standard logging to avoid stderr stream noise
        pass


def run_server(port: int = 8000):
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, QSentinelAPIHandler)
    print(f"[*] Q-Sentinel BB84 Python Backend listening on http://0.0.0.0:{port}")
    print(f"[*] Qiskit Available: {HAS_QISKIT}, Aer Available: {HAS_AER}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\nShutting down server.")
        httpd.server_close()


if __name__ == "__main__":
    port = int(os.environ.get("PYTHON_PORT", 5050))
    run_server(port)
