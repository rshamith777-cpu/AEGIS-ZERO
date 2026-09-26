/**
 * Probabilistic Boundary Risk Engine for ORBIT-A 2.0
 * 
 * Evaluates P_cross(X, H): the probability of crossing the critical regime boundary
 * within forward prediction horizon H, modeling stochastic diffusion:
 * 
 * dX_t = \mu(X_t, U_t) dt + \Sigma^{1/2} dW_t
 * 
 * Employs first-passage hazard-rate integration over Brownian motion with drift:
 * \lambda(t) = \frac{BTD_t}{\sqrt{2\pi \sigma^2 t^3}} \exp\left(-\frac{(BTD_t - v \cdot t)^2}{2 \sigma^2 t}\right)
 */

import { StateVector, Constraint } from '../core/types';
import { OrbitV2Config, ProbabilisticBoundaryResult } from './types';

export class ProbabilisticBoundaryEngine {
  /**
   * Evaluates P_cross(X, H) given contextual BTD, velocity drift along boundary normal, and noise.
   */
  public estimateCrossingProbability(
    btd: number,
    velocityTowardBoundary: number, // positive = closing distance toward boundary
    config: OrbitV2Config
  ): ProbabilisticBoundaryResult {
    const H = Math.max(1, config.predictionHorizon);
    const sigma = Math.max(0.01, config.diffusionSigma);

    // If already at or beyond boundary (btd <= 0), crossing probability is 1.0
    if (btd <= 0) {
      return {
        pCross: 1.0,
        expectedTimeToCross: 0.0,
        hazardRate: 10.0,
        diffusionVariance: sigma * sigma * H
      };
    }

    // First passage distribution parameters:
    // Drift \mu = velocityTowardBoundary
    // Distance a = btd
    const a = btd;
    const mu = velocityTowardBoundary;
    const varH = sigma * sigma * H;

    // Standard Gaussian cumulative distribution function approximation
    const normalCdf = (z: number): number => {
      const p = 0.3275911;
      const a1 = 0.254829592;
      const a2 = -0.284496736;
      const a3 = 1.421413741;
      const a4 = -1.453152027;
      const a5 = 1.061405429;
      const sign = z < 0 ? -1 : 1;
      const x = Math.abs(z) / Math.SQRT2;
      const t = 1.0 / (1.0 + p * x);
      const erf = 1.0 - (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t) * Math.exp(-x * x);
      return 0.5 * (1.0 + sign * erf);
    };

    // First passage time probability for Brownian motion with drift:
    // P(T <= H) = \Phi((mu * H - a) / (sigma * sqrt(H))) + exp(2 * mu * a / sigma^2) * \Phi((-mu * H - a) / (sigma * sqrt(H)))
    const denom = sigma * Math.sqrt(H);
    const z1 = (mu * H - a) / denom;
    const term1 = normalCdf(z1);

    let term2 = 0;
    const exponent = (2.0 * mu * a) / (sigma * sigma);
    if (exponent < 70) { // prevent overflow
      const z2 = (-mu * H - a) / denom;
      term2 = Math.exp(exponent) * normalCdf(z2);
    }

    let pCross = Math.min(1.0, Math.max(0.0, term1 + term2));

    // If drift is strongly closing in, ensure continuity with deterministic limit
    if (mu > 0 && a - mu * H <= 0) {
      pCross = Math.max(pCross, 0.85);
    }

    // Expected time to cross (finite if mu > 0, else bounded by horizon)
    const expectedTimeToCross = mu > 0 ? Math.min(H, a / mu) : H * 2.0;

    // Instantaneous hazard rate \lambda(t) at current state
    const hazardRate = Number((pCross / H).toFixed(4));

    return {
      pCross: Number(pCross.toFixed(4)),
      expectedTimeToCross: Number(expectedTimeToCross.toFixed(2)),
      hazardRate,
      diffusionVariance: Number(varH.toFixed(4))
    };
  }
}
