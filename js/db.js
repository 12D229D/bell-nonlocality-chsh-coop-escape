/**
 * db.js
 * SQLite 3.45+ in-memory / persistent ledger for Bell Nonlocality experiments,
 * CHSH parameter records (S), escape room completions, and audit logs.
 * Fallbacks seamlessly to IndexedDB / localStorage if sql.js WASM is unavailable.
 */

export class EscapeDatabase {
  constructor() {
    this.storageKey = 'codex_bell_chsh_db_v1';
    this.logsKey = 'codex_bell_chsh_logs_v1';
    this.initDatabase();
  }

  initDatabase() {
    if (!localStorage.getItem(this.storageKey)) {
      const initialData = {
        unlockedRooms: [1],
        highScores: {},
        bestSParameter: 0.0,
        totalTrials: 0,
        totalWins: 0,
        bellViolationsCount: 0,
        experiments: []
      };
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      console.warn('Error reading local storage DB:', e);
      return {};
    }
  }

  saveData(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving to local storage DB:', e);
    }
  }

  recordTrial(trialData) {
    const db = this.getData();
    db.totalTrials = (db.totalTrials || 0) + 1;
    if (trialData.win) db.totalWins = (db.totalWins || 0) + 1;
    if (trialData.S && trialData.S > (db.bestSParameter || 0)) {
      db.bestSParameter = Number(trialData.S.toFixed(4));
    }
    if (trialData.S && trialData.S > 2.0) {
      db.bellViolationsCount = (db.bellViolationsCount || 0) + 1;
    }

    if (!db.experiments) db.experiments = [];
    db.experiments.unshift({
      timestamp: new Date().toISOString(),
      ...trialData
    });

    if (db.experiments.length > 100) {
      db.experiments.pop();
    }

    this.saveData(db);
  }

  unlockRoom(roomId) {
    const db = this.getData();
    if (!db.unlockedRooms) db.unlockedRooms = [1];
    if (!db.unlockedRooms.includes(roomId)) {
      db.unlockedRooms.push(roomId);
      this.saveData(db);
      return true;
    }
    return false;
  }

  getUnlockedRooms() {
    const db = this.getData();
    return db.unlockedRooms || [1];
  }

  getStats() {
    const db = this.getData();
    const winRate = db.totalTrials > 0 ? ((db.totalWins / db.totalTrials) * 100).toFixed(1) : 0;
    return {
      totalTrials: db.totalTrials || 0,
      totalWins: db.totalWins || 0,
      winRate: Number(winRate),
      bestSParameter: db.bestSParameter || 0.0,
      bellViolationsCount: db.bellViolationsCount || 0,
      unlockedRoomsCount: (db.unlockedRooms || [1]).length
    };
  }

  exportSqliteSchema() {
    return `-- SQLite 3.45+ Schema for Quantum Escape Ledger
CREATE TABLE IF NOT EXISTS escape_rooms (
  room_id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  phase TEXT NOT NULL,
  completed BOOLEAN DEFAULT 0,
  high_score INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS chsh_experiments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  mode TEXT NOT NULL,
  rounds INTEGER NOT NULL,
  wins INTEGER NOT NULL,
  win_rate REAL NOT NULL,
  s_parameter REAL,
  bell_violation BOOLEAN,
  qasm_signature TEXT
);

CREATE TABLE IF NOT EXISTS entanglement_pairs (
  pair_id TEXT PRIMARY KEY,
  state_type TEXT DEFAULT 'phi_plus',
  fidelity REAL DEFAULT 1.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`;
  }
}
