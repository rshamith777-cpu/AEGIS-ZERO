/**
 * Confidence Calibration
 * Calibrates prediction confidence based on observation coverage and noise variance.
 */

export function computeCalibratedConfidence(
  sampleVariance: number,
  missingDataRate: number,
  noiseSigma: number
): number {
  // Base confidence starts at 1.0 and degrades predictably
  const penaltyVariance = Math.min(0.4, Math.sqrt(sampleVariance) * 0.25);
  const penaltyMissing = Math.min(0.4, missingDataRate * 0.8);
  const penaltyNoise = Math.min(0.3, noiseSigma * 1.5);

  const confidence = 1.0 - penaltyVariance - penaltyMissing - penaltyNoise;
  return Math.max(0.1, Math.min(0.99, confidence));
}
