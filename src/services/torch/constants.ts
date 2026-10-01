import {SosStep} from './types';

/**
 * Standard Morse Code SOS Distressed Optical Pulse Timing Specifications
 * S = ... (3 dots)
 * O = --- (3 dashes)
 * S = ... (3 dots)
 */
export const SOS_TIMING = {
  /** Dot pulse duration: 200 ms ON */
  DOT_MS: 200,
  /** Dash pulse duration: 600 ms ON */
  DASH_MS: 600,
  /** Element spacing within same letter: 200 ms OFF */
  ELEMENT_GAP_MS: 200,
  /** Letter spacing between S and O: 600 ms OFF */
  LETTER_GAP_MS: 600,
  /** Full SOS cycle pause before repeating: 1400 ms OFF */
  CYCLE_GAP_MS: 1400,
} as const;

/**
 * Manual Strobe Pulse Timing Specifications
 */
export const STROBE_TIMING = {
  /** Pulse ON duration: 200 ms */
  ON_MS: 200,
  /** Pulse OFF duration: 200 ms */
  OFF_MS: 200,
} as const;

/**
 * Builds the deterministic Morse SOS sequence.
 *
 * Logical Sequence:
 * S: DOT ON (200) -> OFF (200) -> DOT ON (200) -> OFF (200) -> DOT ON (200) -> LETTER GAP (600 OFF)
 * O: DASH ON (600) -> OFF (200) -> DASH ON (600) -> OFF (200) -> DASH ON (600) -> LETTER GAP (600 OFF)
 * S: DOT ON (200) -> OFF (200) -> DOT ON (200) -> OFF (200) -> DOT ON (200) -> CYCLE GAP (1400 OFF)
 */
export function buildSosPattern(): SosStep[] {
  const steps: SosStep[] = [];

  const add = (torchOn: boolean, durationMs: number, description: string) => {
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
