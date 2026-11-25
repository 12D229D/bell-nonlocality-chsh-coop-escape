/**
 * app.js
 * Main Controller for Bell Nonlocality: CHSH & GHZ Coop Escape Room.
 * Connects Split-Screen Interface, Quantum Simulator, Sound Effects (Web Audio API),
 * Canvas Visualizers for Photons & Bell Correlator, and SQLite Ledger.
 */

import { BellGhzTensor } from './bell-ghz-tensor.js';
import { LHVClassicalBot } from './lhv-classical-bot.js';
import { QasmDynamicBridge } from './qasm-dynamic-bridge.js';
import { ESCAPE_ROOMS } from './chsh-mermin-rooms.js';
import { EscapeDatabase } from './db.js';

class BellEscapeApp {
  constructor() {
    this.db = new EscapeDatabase();
    this.currentRoomIndex = 0;
    this.currentMode = 'quantum'; // 'quantum' | 'classical'
    this.currentBellState = 'phi_plus';
    
    // Measurement bases (angles in radians)
    this.angles = {
      thetaA0: 0,
      thetaA1: Math.PI / 2,
      thetaB0: Math.PI / 4,
      thetaB1: -Math.PI / 4
    };

    // Current Round State
    this.activeRound = {
      x: 0,
      y: 0,
      z: 0,
      a: null,
      b: null,
      c: null,
      status: 'waiting_measure' // 'waiting_measure' | 'evaluated'
    };

    // Room Progress
    this.roomRound = 0;
    this.roomWins = 0;
    this.roomCorrelations = [];

    this.audioCtx = null;
    this.initDOM();
    this.setupEventListeners();
    this.loadRoom(0);
    this.updateStatsUI();
  }

  initAudio() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
  }

  playTone(freq = 440, type = 'sine', duration = 0.15) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch (e) {
      // Audio autoplay policy
    }
  }

  initDOM() {
    this.dom = {
      roomSelect: document.getElementById('room-select'),
      roomTitle: document.getElementById('room-title'),
      roomPhase: document.getElementById('room-phase'),
      roomDesc: document.getElementById('room-desc'),
      roomHint: document.getElementById('room-hint'),
      modeToggle: document.getElementById('mode-toggle'),
      bellStateSelect: document.getElementById('bell-state-select'),
      
      // Alice Chamber
      aliceQuery: document.getElementById('alice-query'),
      aliceAngle0: document.getElementById('alice-angle0'),
      aliceAngle1: document.getElementById('alice-angle1'),
      aliceAngleVal0: document.getElementById('alice-angle-val0'),
      aliceAngleVal1: document.getElementById('alice-angle-val1'),
      aliceResult: document.getElementById('alice-result'),
      btnAliceMeasure: document.getElementById('btn-alice-measure'),

      // Bob Chamber
      bobQuery: document.getElementById('bob-query'),
      bobAngle0: document.getElementById('bob-angle0'),
      bobAngle1: document.getElementById('bob-angle1'),
      bobAngleVal0: document.getElementById('bob-angle-val0'),
      bobAngleVal1: document.getElementById('bob-angle-val1'),
      bobResult: document.getElementById('bob-result'),
      btnBobMeasure: document.getElementById('btn-bob-measure'),

      // Charlie Chamber (GHZ)
      charlieCard: document.getElementById('charlie-card'),
      charlieQuery: document.getElementById('charlie-query'),
      charlieResult: document.getElementById('charlie-result'),

      // Central Verifier & Correlator
      roundBadge: document.getElementById('round-badge'),
      conditionFormula: document.getElementById('condition-formula'),
      conditionEvaluation: document.getElementById('condition-evaluation'),
      btnEvaluateRound: document.getElementById('btn-evaluate-round'),
      btnNextRound: document.getElementById('btn-next-round'),
      btnBatchRun: document.getElementById('btn-batch-run'),
      batchCountSelect: document.getElementById('batch-count-select'),

      // Meters & S Parameter
      sMeterValue: document.getElementById('s-meter-value'),
      sMeterFill: document.getElementById('s-meter-fill'),
      winRateBadge: document.getElementById('win-rate-badge'),
      bellViolationAlert: document.getElementById('bell-violation-alert'),

      // Canvas
      canvasPhotons: document.getElementById('canvas-photons'),

      // QASM & Modal
      btnShowQasm: document.getElementById('btn-show-qasm'),
      qasmModal: document.getElementById('qasm-modal'),
      qasmContent: document.getElementById('qasm-content'),
      btnCloseQasm: document.getElementById('btn-close-qasm'),
      btnCopyQasm: document.getElementById('btn-copy-qasm'),

      // Stats
      statWins: document.getElementById('stat-wins'),
      statTrials: document.getElementById('stat-trials'),
      statBestS: document.getElementById('stat-best-s'),
      statRooms: document.getElementById('stat-rooms')
    };

    // Populate Room Select
    this.dom.roomSelect.innerHTML = '';
    const unlocked = this.db.getUnlockedRooms();
    ESCAPE_ROOMS.forEach((rm, idx) => {
      const opt = document.createElement('option');
      opt.value = idx;
      const isLocked = !unlocked.includes(rm.id);
      opt.textContent = `${isLocked ? '🔒 ' : '🚪 '}${rm.name}`;
      opt.disabled = isLocked;
      this.dom.roomSelect.appendChild(opt);
    });

    this.initCanvasAnimation();
  }

  setupEventListeners() {
    this.dom.roomSelect.addEventListener('change', (e) => {
      this.loadRoom(parseInt(e.target.value, 10));
    });

    this.dom.modeToggle.addEventListener('change', (e) => {
      this.currentMode = e.target.value;
      this.resetRound();
    });

    this.dom.bellStateSelect.addEventListener('change', (e) => {
      this.currentBellState = e.target.value;
      this.playTone(520, 'triangle', 0.1);
    });

    // Angle slider updates
    const updateAngles = () => {
      this.angles.thetaA0 = (parseFloat(this.dom.aliceAngle0.value) * Math.PI) / 180;
      this.angles.thetaA1 = (parseFloat(this.dom.aliceAngle1.value) * Math.PI) / 180;
      this.angles.thetaB0 = (parseFloat(this.dom.bobAngle0.value) * Math.PI) / 180;
      this.angles.thetaB1 = (parseFloat(this.dom.bobAngle1.value) * Math.PI) / 180;

      this.dom.aliceAngleVal0.textContent = `${this.dom.aliceAngle0.value}°`;
      this.dom.aliceAngleVal1.textContent = `${this.dom.aliceAngle1.value}°`;
      this.dom.bobAngleVal0.textContent = `${this.dom.bobAngle0.value}°`;
      this.dom.bobAngleVal1.textContent = `${this.dom.bobAngle1.value}°`;
    };

    [this.dom.aliceAngle0, this.dom.aliceAngle1, this.dom.bobAngle0, this.dom.bobAngle1].forEach(input => {
      input.addEventListener('input', updateAngles);
    });

    // Measure buttons
    this.dom.btnAliceMeasure.addEventListener('click', () => {
      this.initAudio();
      this.measureAlice();
    });

    this.dom.btnBobMeasure.addEventListener('click', () => {
      this.initAudio();
      this.measureBob();
    });

    this.dom.btnEvaluateRound.addEventListener('click', () => {
      this.evaluateCurrentRound();
    });

    this.dom.btnNextRound.addEventListener('click', () => {
      this.nextRound();
    });

    this.dom.btnBatchRun.addEventListener('click', () => {
      this.initAudio();
      this.runBatch();
    });

    // QASM modal
    this.dom.btnShowQasm.addEventListener('click', () => {
      this.showQasm();
    });
    this.dom.btnCloseQasm.addEventListener('click', () => {
      this.dom.qasmModal.classList.add('hidden');
    });
    this.dom.btnCopyQasm.addEventListener('click', () => {
      navigator.clipboard.writeText(this.dom.qasmContent.textContent);
      this.playTone(880, 'sine', 0.1);
      alert('Código OpenQASM 3.0 copiado al portapapeles.');
    });
  }

  loadRoom(index) {
    this.currentRoomIndex = index;
    const room = ESCAPE_ROOMS[index];
    this.dom.roomTitle.textContent = room.name;
    this.dom.roomPhase.textContent = room.phase;
    this.dom.roomDesc.textContent = room.description;
    this.dom.roomHint.textContent = `💡 Pista Cuántica: ${room.hint}`;
    this.dom.roomSelect.value = index;

    // Adjust angles if preset exists
    if (room.angles) {
      this.dom.aliceAngle0.value = Math.round((room.angles.thetaA0 * 180) / Math.PI);
      this.dom.aliceAngle1.value = Math.round((room.angles.thetaA1 * 180) / Math.PI);
      this.dom.bobAngle0.value = Math.round((room.angles.thetaB0 * 180) / Math.PI);
      this.dom.bobAngle1.value = Math.round((room.angles.thetaB1 * 180) / Math.PI);
      this.dom.aliceAngle0.dispatchEvent(new Event('input'));
    }

    // Show/hide Charlie chamber based on mode
    if (room.mode === 'ghz') {
      this.dom.charlieCard.classList.remove('hidden');
    } else {
      this.dom.charlieCard.classList.add('hidden');
    }

    this.roomRound = 0;
    this.roomWins = 0;
    this.roomCorrelations = [];
    this.resetRound();
  }

  resetRound() {
    this.roomRound++;
    const room = ESCAPE_ROOMS[this.currentRoomIndex];

    if (room.mode === 'ghz') {
      // Promise: x + y + z in {0, 2}
      const triples = [[0,0,0], [1,1,0], [1,0,1], [0,1,1]];
      const chosen = triples[Math.floor(Math.random() * triples.length)];
      this.activeRound.x = chosen[0];
      this.activeRound.y = chosen[1];
      this.activeRound.z = chosen[2];
      this.dom.conditionFormula.textContent = `Condición GHZ: a ⊕ b ⊕ c = ${this.activeRound.x | this.activeRound.y | this.activeRound.z} (x=${this.activeRound.x}, y=${this.activeRound.y}, z=${this.activeRound.z})`;
    } else {
      // Standard CHSH: x in {0,1}, y in {0,1}
      this.activeRound.x = Math.random() < 0.5 ? 0 : 1;
      this.activeRound.y = Math.random() < 0.5 ? 0 : 1;
      this.dom.conditionFormula.textContent = `Regla CHSH: a ⊕ b == (${this.activeRound.x} · ${this.activeRound.y}) = ${this.activeRound.x & this.activeRound.y}`;
    }

    this.activeRound.a = null;
    this.activeRound.b = null;
    this.activeRound.c = null;
    this.activeRound.status = 'waiting_measure';

    // Update UI
    this.dom.aliceQuery.textContent = this.activeRound.x;
    this.dom.bobQuery.textContent = this.activeRound.y;
    if (this.dom.charlieQuery) this.dom.charlieQuery.textContent = this.activeRound.z;

    this.dom.aliceResult.textContent = '-';
    this.dom.bobResult.textContent = '-';
    if (this.dom.charlieResult) this.dom.charlieResult.textContent = '-';

    this.dom.roundBadge.textContent = `Ronda ${this.roomRound} / ${room.roundsCount}`;
    this.dom.conditionEvaluation.textContent = 'En espera de mediciones locales...';
    this.dom.conditionEvaluation.className = 'evaluation-badge neutral';

    this.dom.btnEvaluateRound.disabled = true;
    this.dom.btnNextRound.disabled = true;
    this.dom.btnAliceMeasure.disabled = false;
    this.dom.btnBobMeasure.disabled = false;
  }

  measureAlice() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    if (this.activeRound.a !== null) return;

    if (this.currentMode === 'classical') {
      // Deterministic bot
      this.activeRound.a = 0;
    } else {
      // Quantum simulated
      const theta = (this.activeRound.x === 0) ? this.angles.thetaA0 : this.angles.thetaA1;
      // Prob(a=1) = sin^2(theta/2)
      const p1 = Math.sin(theta / 2) * Math.sin(theta / 2);
      this.activeRound.a = Math.random() < p1 ? 1 : 0;
    }

    this.dom.aliceResult.textContent = this.activeRound.a;
    this.dom.btnAliceMeasure.disabled = true;
    this.playTone(330, 'sine', 0.12);
    this.checkBothMeasured();
  }

  measureBob() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    if (this.activeRound.b !== null) return;

    if (this.currentMode === 'classical') {
      this.activeRound.b = 0;
    } else {
      if (room.mode === 'ghz') {
        const ghzRes = BellGhzTensor.measureGHZMermin(this.activeRound.x, this.activeRound.y, this.activeRound.z, 'quantum');
        this.activeRound.a = ghzRes.a;
        this.activeRound.b = ghzRes.b;
        this.activeRound.c = ghzRes.c;
        this.dom.aliceResult.textContent = this.activeRound.a;
        this.dom.bobResult.textContent = this.activeRound.b;
        if (this.dom.charlieResult) this.dom.charlieResult.textContent = this.activeRound.c;
        this.dom.btnAliceMeasure.disabled = true;
        this.dom.btnBobMeasure.disabled = true;
      } else {
        const thetaA = (this.activeRound.x === 0) ? this.angles.thetaA0 : this.angles.thetaA1;
        const thetaB = (this.activeRound.y === 0) ? this.angles.thetaB0 : this.angles.thetaB1;
        const chsh = BellGhzTensor.measureCHSH(thetaA, thetaB, this.activeRound.x, this.activeRound.y, this.currentBellState);
        this.activeRound.a = chsh.a;
        this.activeRound.b = chsh.b;
        this.dom.aliceResult.textContent = this.activeRound.a;
        this.dom.bobResult.textContent = this.activeRound.b;
        this.dom.btnAliceMeasure.disabled = true;
      }
    }

    this.dom.btnBobMeasure.disabled = true;
    this.playTone(493, 'sine', 0.12);
    this.checkBothMeasured();
  }

  checkBothMeasured() {
    if (this.activeRound.a !== null && this.activeRound.b !== null) {
      this.dom.btnEvaluateRound.disabled = false;
      this.evaluateCurrentRound();
    }
  }

  evaluateCurrentRound() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    let win = false;
    let evalText = '';

    if (room.mode === 'ghz') {
      const cVal = (this.activeRound.c !== null) ? this.activeRound.c : 0;
      const actual = (this.activeRound.a ^ this.activeRound.b ^ cVal);
      const target = (this.activeRound.x | this.activeRound.y | this.activeRound.z);
      win = (actual === target);
      evalText = `GHZ: ${this.activeRound.a} ⊕ ${this.activeRound.b} ⊕ ${cVal} = ${actual} vs Target ${target} -> ${win ? '¡CORRECTO (VICTORIA)!' : '¡FALLO!'}`;
    } else {
      const actual = (this.activeRound.a ^ this.activeRound.b);
      const target = (this.activeRound.x & this.activeRound.y);
      win = (actual === target);
      evalText = `CHSH: ${this.activeRound.a} ⊕ ${this.activeRound.b} = ${actual} vs Target ${target} -> ${win ? '¡ESCLUSA ABIERTA!' : '¡BLOQUEO!'}`;
    }

    if (win) {
      this.roomWins++;
      this.dom.conditionEvaluation.className = 'evaluation-badge win';
      this.playTone(659, 'triangle', 0.25);
    } else {
      this.dom.conditionEvaluation.className = 'evaluation-badge lose';
      this.playTone(196, 'sawtooth', 0.3);
    }

    this.dom.conditionEvaluation.textContent = evalText;
    this.roomCorrelations.push(this.activeRound.a === this.activeRound.b ? 1 : -1);

    this.dom.btnEvaluateRound.disabled = true;
    this.dom.btnNextRound.disabled = false;

    this.updateLiveStats();
  }

  nextRound() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    if (this.roomRound >= room.roundsCount) {
      this.finishRoom();
    } else {
      this.resetRound();
    }
  }

  finishRoom() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    const winRate = ((this.roomWins / room.roundsCount) * 100).toFixed(1);
    const passed = winRate >= room.minWinRate;

    let msg = `🏁 Cámara ${room.id} finalizada:\nVictorias: ${this.roomWins}/${room.roundsCount} (${winRate}%)\n`;
    if (passed) {
      msg += `🎉 ¡Prueba superada! Las esclusas de aislamiento han sido desbloqueadas.`;
      this.playTone(784, 'sine', 0.4);
      // Unlock next room
      const nextId = room.id + 1;
      if (nextId <= ESCAPE_ROOMS.length) {
        this.db.unlockRoom(nextId);
        this.initDOM();
      }
    } else {
      msg += `⚠️ No se alcanzó la tasa mínima (${room.minWinRate}%). Ajusta las bases o activa el modo cuántico para reintentar.`;
    }

    alert(msg);
    this.db.recordTrial({
      roomId: room.id,
      roomName: room.name,
      mode: this.currentMode,
      rounds: room.roundsCount,
      wins: this.roomWins,
      winRate: parseFloat(winRate),
      win: passed
    });
    this.updateStatsUI();
  }

  runBatch() {
    const count = parseInt(this.dom.batchCountSelect.value, 10);
    const room = ESCAPE_ROOMS[this.currentRoomIndex];

    const batch = BellGhzTensor.computeBatchCHSH(count, this.currentMode, this.angles);

    this.dom.sMeterValue.textContent = batch.S.toFixed(4);
    const pct = Math.min(100, (batch.S / batch.tsirelsonBound) * 100);
    this.dom.sMeterFill.style.width = `${pct}%`;

    this.dom.winRateBadge.textContent = `${batch.winRate.toFixed(1)}% Éxito`;

    if (batch.isBellViolated) {
      this.dom.bellViolationAlert.classList.remove('hidden');
      this.dom.bellViolationAlert.textContent = `🚨 ¡VIOLACIÓN DE BELL DETECTADA! S = ${batch.S.toFixed(4)} > 2.0 (Cota de Tsirelson: ${batch.tsirelsonBound.toFixed(4)})`;
      this.playTone(880, 'sine', 0.3);
    } else {
      this.dom.bellViolationAlert.classList.add('hidden');
    }

    this.db.recordTrial({
      roomId: room.id,
      roomName: room.name,
      mode: this.currentMode,
      rounds: count,
      wins: batch.wins,
      winRate: batch.winRate,
      S: batch.S,
      win: batch.isBellViolated || batch.winRate >= 75
    });

    this.updateStatsUI();
    alert(`📊 Experimento Batch (${count} rondas):\nÉxito: ${batch.winRate.toFixed(2)}%\nParámetro S de Bell: ${batch.S.toFixed(4)}\nViolación Clásica: ${batch.isBellViolated ? 'SÍ (Fenómeno No-Local)' : 'NO'}`);
  }

  updateLiveStats() {
    const total = this.roomCorrelations.length;
    if (total === 0) return;
    const rate = ((this.roomWins / total) * 100).toFixed(1);
    this.dom.winRateBadge.textContent = `${rate}% Éxito`;
  }

  updateStatsUI() {
    const stats = this.db.getStats();
    this.dom.statWins.textContent = stats.totalWins;
    this.dom.statTrials.textContent = stats.totalTrials;
    this.dom.statBestS.textContent = stats.bestSParameter ? stats.bestSParameter.toFixed(3) : '0.000';
    this.dom.statRooms.textContent = `${stats.unlockedRoomsCount}/15`;
  }

  showQasm() {
    const room = ESCAPE_ROOMS[this.currentRoomIndex];
    let code = '';
    if (room.mode === 'ghz') {
      code = QasmDynamicBridge.exportGHZ(this.activeRound.x, this.activeRound.y, this.activeRound.z);
    } else if (room.mode === 'teleportation') {
      code = QasmDynamicBridge.exportTeleportation(0.7071, 0.7071);
    } else {
      code = QasmDynamicBridge.exportCHSH(this.angles.thetaA0, this.angles.thetaB0, this.activeRound.x, this.activeRound.y);
    }
    this.dom.qasmContent.textContent = code;
    this.dom.qasmModal.classList.remove('hidden');
  }

  initCanvasAnimation() {
    const canvas = this.dom.canvasPhotons;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let t = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Draw entangled source center
      ctx.beginPath();
      ctx.arc(cx, cy, 14, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(280, 80%, 65%)';
      ctx.shadowColor = 'hsl(280, 100%, 75%)';
      ctx.shadowBlur = 15;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw pulses to Alice (left) and Bob (right)
      const dist = (t % 100) / 100;
      const xA = cx - dist * (cx - 40);
      const xB = cx + dist * (cx - 40);

      // Alice photon
      ctx.beginPath();
      ctx.arc(xA, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(200, 95%, 65%)';
      ctx.fill();

      // Bob photon
      ctx.beginPath();
      ctx.arc(xB, cy, 6, 0, Math.PI * 2);
      ctx.fillStyle = 'hsl(145, 95%, 60%)';
      ctx.fill();

      // Connecting wave line
      ctx.beginPath();
      ctx.moveTo(40, cy);
      for (let x = 40; x <= canvas.width - 40; x += 10) {
        const y = cy + Math.sin((x + t * 4) * 0.05) * 8;
        ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'hsla(280, 60%, 50%, 0.3)';
      ctx.lineWidth = 2;
      ctx.stroke();

      t++;
      requestAnimationFrame(animate);
    };

    animate();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new BellEscapeApp();
});
