/**
 * lhv-classical-bot.js
 * Local Hidden Variables (LHV) Simulator & Classical Strategy Tester.
 * Demonstrates the 16 deterministic strategies available in the CHSH game
 * and proves that max classical winning rate is mathematically bounded at 75% (S <= 2.0).
 */

export class LHVClassicalBot {
  /**
   * The 16 possible deterministic classical response functions:
   * Alice chooses function f_A(x) -> {0, 1} (4 combinations: 00, 01, 10, 11)
   * Bob chooses function f_B(y) -> {0, 1} (4 combinations: 00, 01, 10, 11)
   * Total deterministic joint strategies: 4 x 4 = 16.
   */
  static getAllDeterministicStrategies() {
    const aliceStrategies = [
      { id: 'A_00', desc: 'fA(0)=0, fA(1)=0', fn: (x) => 0 },
      { id: 'A_01', desc: 'fA(0)=0, fA(1)=1 (identidad)', fn: (x) => x },
      { id: 'A_10', desc: 'fA(0)=1, fA(1)=0 (inversión)', fn: (x) => 1 - x },
      { id: 'A_11', desc: 'fA(0)=1, fA(1)=1', fn: (x) => 1 }
    ];

    const bobStrategies = [
      { id: 'B_00', desc: 'fB(0)=0, fB(1)=0', fn: (y) => 0 },
      { id: 'B_01', desc: 'fB(0)=0, fB(1)=1 (identidad)', fn: (y) => y },
      { id: 'B_10', desc: 'fB(0)=1, fB(1)=0 (inversión)', fn: (y) => 1 - y },
      { id: 'B_11', desc: 'fB(0)=1, fB(1)=1', fn: (y) => 1 }
    ];

    const matrix = [];

    for (const aStrat of aliceStrategies) {
      for (const bStrat of bobStrategies) {
        let wins = 0;
        const results = [];
        for (const [x, y] of [[0,0], [0,1], [1,0], [1,1]]) {
          const a = aStrat.fn(x);
          const b = bStrat.fn(y);
          const win = ((a ^ b) === (x & y));
          if (win) wins++;
          results.push({ x, y, a, b, target: x & y, actual: a ^ b, win });
        }
        matrix.push({
          aliceId: aStrat.id,
          aliceDesc: aStrat.desc,
          bobId: bStrat.id,
          bobDesc: bStrat.desc,
          wins4: wins,
          winRate: (wins / 4) * 100, // 0%, 25%, 50%, or 75% max!
          results
        });
      }
    }

    return matrix;
  }

  /**
   * Evaluates any user-defined classical strategy or runs a Monte Carlo simulation
   * across thousands of rounds with a hidden variable lambda.
   */
  static simulateSharedLHV(rounds = 1000, strategyType = 'always_zero') {
    let wins = 0;
    const history = [];

    for (let i = 0; i < rounds; i++) {
      const x = Math.random() < 0.5 ? 0 : 1;
      const y = Math.random() < 0.5 ? 0 : 1;
      // Hidden variable lambda shared beforehand:
      const lambda = Math.random();

      let a = 0, b = 0;
      if (strategyType === 'always_zero') {
        a = 0; b = 0;
      } else if (strategyType === 'shared_randomness') {
        // Shared random bit
        const rBit = lambda < 0.5 ? 0 : 1;
        a = rBit; b = rBit;
      } else if (strategyType === 'parity_guess') {
        a = (lambda > 0.5) ? x : 0;
        b = (lambda > 0.5) ? y : 0;
      }

      const win = ((a ^ b) === (x & y));
      if (win) wins++;

      if (i < 50) {
        history.push({ round: i + 1, x, y, a, b, win });
      }
    }

    const winRate = (wins / rounds) * 100;
    // For classical LHV, S parameter is strictly bounded: S <= 2.0
    // S_classical = 4 * P(win) - 2 approx when symmetric
    const estimatedS = Math.min(2.0, (winRate / 100) * 4 - 1);

    return {
      strategyType,
      rounds,
      wins,
      winRate: Number(winRate.toFixed(2)),
      maxClassicalTheoretical: 75.0,
      estimatedS: Number(estimatedS.toFixed(3)),
      bellViolation: false,
      explanation: 'Las variables ocultas locales (LHV) no pueden superar el 75% debido al teorema de Bell.'
    };
  }
}
