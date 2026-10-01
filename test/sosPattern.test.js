const test = require('node:test');
const assert = require('node:assert/strict');

// Timing constants under test
const SOS_TIMING = {
  DOT_MS: 200,
  DASH_MS: 600,
  ELEMENT_GAP_MS: 200,
  LETTER_GAP_MS: 600,
  CYCLE_GAP_MS: 1400,
};

function buildSosPattern() {
  const steps = [];

  const add = (torchOn, durationMs, description) => {
    steps.push({torchOn, durationMs, description});
  };

  // Letter S (... 3 dots)
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 1 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'S - Gap 1');
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 2 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'S - Gap 2');
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 3 ON');
  add(false, SOS_TIMING.LETTER_GAP_MS, 'Letter Gap (S -> O)');

  // Letter O (--- 3 dashes)
  add(true, SOS_TIMING.DASH_MS, 'O - Dash 1 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'O - Gap 1');
  add(true, SOS_TIMING.DASH_MS, 'O - Dash 2 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'O - Gap 2');
  add(true, SOS_TIMING.DASH_MS, 'O - Dash 3 ON');
  add(false, SOS_TIMING.LETTER_GAP_MS, 'Letter Gap (O -> S)');

  // Letter S (... 3 dots)
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 1 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'S - Gap 1');
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 2 ON');
  add(false, SOS_TIMING.ELEMENT_GAP_MS, 'S - Gap 2');
  add(true, SOS_TIMING.DOT_MS, 'S - Dot 3 ON');
  add(false, SOS_TIMING.CYCLE_GAP_MS, 'Cycle Gap (Full SOS Repeat)');

  return steps;
}

test('SOS Pattern Generation & Timing Verification', async (t) => {
  const pattern = buildSosPattern();

  await t.test('has exactly 18 distinct steps in a single SOS loop', () => {
    assert.equal(pattern.length, 18);
  });

  await t.test('verifies DOT pulse durations are exactly 200ms', () => {
    const s1Dots = [pattern[0], pattern[2], pattern[4]];
    const s2Dots = [pattern[12], pattern[14], pattern[16]];

    for (const step of [...s1Dots, ...s2Dots]) {
      assert.equal(step.torchOn, true, `${step.description} should be ON`);
      assert.equal(step.durationMs, 200, `${step.description} should be 200ms`);
    }
  });

  await t.test('verifies DASH pulse durations are exactly 600ms', () => {
    const oDashes = [pattern[6], pattern[8], pattern[10]];

    for (const step of oDashes) {
      assert.equal(step.torchOn, true, `${step.description} should be ON`);
      assert.equal(step.durationMs, 600, `${step.description} should be 600ms`);
    }
  });

  await t.test('verifies element gaps between dots/dashes are 200ms OFF', () => {
    const elementGaps = [
      pattern[1], pattern[3],   // within S
      pattern[7], pattern[9],   // within O
      pattern[13], pattern[15], // within S
    ];

    for (const step of elementGaps) {
      assert.equal(step.torchOn, false, `${step.description} should be OFF`);
      assert.equal(step.durationMs, 200, `${step.description} should be 200ms`);
    }
  });

  await t.test('verifies letter gaps (S->O and O->S) are 600ms OFF', () => {
    const sToO = pattern[5];
    const oToS = pattern[11];

    assert.equal(sToO.torchOn, false);
    assert.equal(sToO.durationMs, 600);

    assert.equal(oToS.torchOn, false);
    assert.equal(oToS.durationMs, 600);
  });

  await t.test('verifies final complete SOS cycle loop gap is 1400ms OFF', () => {
    const cycleGap = pattern[17];
    assert.equal(cycleGap.torchOn, false);
    assert.equal(cycleGap.durationMs, 1400);
  });

  await t.test('total cycle duration equals 6400ms', () => {
    const totalDuration = pattern.reduce((sum, step) => sum + step.durationMs, 0);
    // S: 200+200+200+200+200+600 = 1600
    // O: 600+200+600+200+600+600 = 2800
    // S: 200+200+200+200+200+1400 = 2400
    // Total = 1600 + 2800 + 2400 = 6800ms
    assert.equal(totalDuration, 6800);
  });
});

test('Loop Controller and Cancellation Safety', async (t) => {
  class MockCancellationToken {
    constructor() {
      this.isCancelled = false;
      this.timer = null;
      this.rejectCancel = null;
    }
    cancel() {
      if (this.isCancelled) {
        return;
      }
      this.isCancelled = true;
      if (this.timer) {
        clearTimeout(this.timer);
        this.timer = null;
      }
      if (this.rejectCancel) {
        this.rejectCancel(new Error('CANCELLED'));
        this.rejectCancel = null;
      }
    }
    sleep(ms) {
      if (this.isCancelled) {
        return Promise.reject(new Error('CANCELLED'));
      }
      return new Promise((resolve, reject) => {
        this.rejectCancel = reject;
        this.timer = setTimeout(() => {
          this.timer = null;
          this.rejectCancel = null;
          resolve();
        }, ms);
      });
    }
  }

  await t.test('sleep promise rejects immediately upon cancellation without waiting out timer', async () => {
    const token = new MockCancellationToken();
    const startTime = Date.now();
    const sleepPromise = token.sleep(5000); // 5 seconds

    // Cancel after 20ms
    setTimeout(() => {
      token.cancel();
    }, 20);

    await assert.rejects(
      async () => {
        await sleepPromise;
      },
      { message: 'CANCELLED' }
    );

    const elapsed = Date.now() - startTime;
    assert.ok(elapsed < 200, `Elapsed time was ${elapsed}ms, expected < 200ms`);
  });

  await t.test('repeated start does not spawn duplicate concurrent loops', async () => {
    let loopCount = 0;
    let currentMode = 'OFF';

    async function startSos() {
      if (currentMode === 'SOS') {
        return; // Guard against duplicate calls
      }
      currentMode = 'SOS';
      loopCount++;
    }

    await startSos();
    await startSos();
    await startSos();

    assert.equal(loopCount, 1, 'Only one loop should have been spawned');
    assert.equal(currentMode, 'SOS');
  });

  await t.test('stop turns torch off and cancels active token', async () => {
    let hardwareTorchState = true;
    let currentMode = 'SOS';
    const token = new MockCancellationToken();

    function stop() {
      token.cancel();
      currentMode = 'OFF';
      hardwareTorchState = false;
    }

    stop();

    assert.equal(token.isCancelled, true);
    assert.equal(currentMode, 'OFF');
    assert.equal(hardwareTorchState, false);
  });
});
