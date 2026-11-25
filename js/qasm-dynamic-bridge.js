/**
 * qasm-dynamic-bridge.js
 * OpenQASM 3.0 Dynamic Circuit Exporter for Bell States, CHSH verification,
 * GHZ Mermin paradox, and Quantum Teleportation with classical feed-forward.
 */

export class QasmDynamicBridge {
  /**
   * Generates OpenQASM 3.0 code for CHSH trial with given basis angles
   */
  static exportCHSH(thetaA, thetaB, x = 0, y = 0) {
    const degA = ((thetaA * 180) / Math.PI).toFixed(1);
    const degB = ((thetaB * 180) / Math.PI).toFixed(1);

    return `// OpenQASM 3.0 - CHSH Quantum Non-Locality Verification
// Input queries: x = ${x}, y = ${y}
// Measurement angles: thetaA = ${degA} deg, thetaB = ${degB} deg
OPENQASM 3.0;
include "stdgates.inc";

qubit[2] q;
bit[2] c;

// 1. Prepare entangled Bell pair |Phi+> = (|00> + |11>)/sqrt(2)
h q[0];
cx q[0], q[1];

// 2. Alice rotated measurement in Chamber A
ry(${thetaA.toFixed(4)}) q[0];
c[0] = measure q[0];

// 3. Bob rotated measurement in Chamber B
ry(${thetaB.toFixed(4)}) q[1];
c[1] = measure q[1];

// Verification condition: (c[0] ^ c[1]) == (${x} & ${y})
`;
  }

  /**
   * Generates OpenQASM 3.0 code for GHZ Mermin Game
   */
  static exportGHZ(x = 0, y = 0, z = 0) {
    return `// OpenQASM 3.0 - GHZ Mermin Quantum Non-Locality Paradox
// Queries: x = ${x}, y = ${y}, z = ${z} (Condition: x + y + z in {0, 2})
OPENQASM 3.0;
include "stdgates.inc";

qubit[3] q;
bit[3] c;

// 1. Prepare 3-qubit GHZ state (|000> + |111>)/sqrt(2)
h q[0];
cx q[0], q[1];
cx q[1], q[2];

// 2. Basis changes depending on input queries (X or Y bases)
${x === 1 ? 'sdg q[0];\nh q[0]; // Measure Y basis' : 'h q[0]; // Measure X basis'}
${y === 1 ? 'sdg q[1];\nh q[1]; // Measure Y basis' : 'h q[1]; // Measure X basis'}
${z === 1 ? 'sdg q[2];\nh q[2]; // Measure Y basis' : 'h q[2]; // Measure X basis'}

// 3. Simultaneous measurement
c[0] = measure q[0];
c[1] = measure q[1];
c[2] = measure q[2];

// Winning rule: (c[0] ^ c[1] ^ c[2]) == (${x} | ${y} | ${z}) -> 100% quantum win
`;
  }

  /**
   * Generates OpenQASM 3.0 code for Quantum Teleportation with dynamic classical feed-forward
   */
  static exportTeleportation(alpha = 0.6, beta = 0.8) {
    const theta = (2 * Math.acos(alpha)).toFixed(4);
    return `// OpenQASM 3.0 - Quantum Teleportation with Feed-Forward Corrections
// Target state to teleport: |psi> = ${alpha}|0> + ${beta}|1>
OPENQASM 3.0;
include "stdgates.inc";

qubit msg;
qubit[2] epr;
bit m1;
bit m2;
bit recovered;

// 1. Initialize Alice's secret quantum message state |psi>
ry(${theta}) msg;

// 2. Share entangled Bell Pair |Phi+> between Alice (epr[0]) and Bob (epr[1])
h epr[0];
cx epr[0], epr[1];

// 3. Alice performs Bell State Measurement on (msg, epr[0])
cx msg, epr[0];
h msg;
m1 = measure msg;
m2 = measure epr[0];

// 4. Bob applies dynamic feed-forward corrections based on classical bits
if (m2 == 1) {
    x epr[1]; // Bit-flip correction
}
if (m1 == 1) {
    z epr[1]; // Phase-flip correction
}

// 5. epr[1] now holds the exact state |psi> with 100% theoretical fidelity!
recovered = measure epr[1];
`;
  }
}
