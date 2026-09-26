import { SystemState, StateVector, GenericIntervention } from './types';
import { systemStateToVector, vectorToSystemState, clampVectorToBounds } from './stateVector';

/**
 * System Transition Model:
 * Implements X_{t+1} = \hat{F}(X_t, U_t, \epsilon_t)
 * 
 * Supports:
 * 1. Intrinsic continuous variable dynamics (decay, influx, thermal equilibration, coupling)
 * 2. Globe diffusion across active edges
 * 3. Generic intervention execution U_t
 * 4. Stochastic disturbance/noise \epsilon_t
 */

export interface TransitionModelConfig {
  decayRates?: Float64Array; // default intrinsic decay rate per variable
  couplingMatrix?: Float64Array[]; // inter-variable coupling
  noiseSigma: number;
  timeStep: number;
}

export class TransitionModel {
  private config: TransitionModelConfig;

  constructor(config?: Partial<TransitionModelConfig>) {
    this.config = {
      noiseSigma: config?.noiseSigma ?? 0.01,
      timeStep: config?.timeStep ?? 1.0,
      ...config
    };
  }

  /**
   * Applies an intervention U_t to the current state vector.
   */
  public applyInterventionToVector(
    vector: StateVector,
    intervention?: GenericIntervention | null
  ): StateVector {
    if (!intervention || !intervention.actions || intervention.actions.length === 0) {
      return vector;
    }

    const nextValues = new Float64Array(vector.values);

    for (const action of intervention.actions) {
      // Find matching index in StateVector
      const idx = vector.nodeMapping.findIndex(
        (m) => m.nodeId === action.targetNodeId && m.variableName === action.targetVariable
      );

      if (idx !== -1) {
        switch (action.actionType) {
          case 'set':
            nextValues[idx] = action.value;
            break;
          case 'increment':
            nextValues[idx] += action.value;
            break;
          case 'scale':
            nextValues[idx] *= action.value;
            break;
          case 'clamp':
            nextValues[idx] = Math.max(action.value, nextValues[idx]);
            break;
        }
      }
    }

    return clampVectorToBounds({
      ...vector,
      values: nextValues
    });
  }

  /**
   * Simulates a single transition step:
   * X_{t+1} = \hat{F}(X_t, U_t, \epsilon_t)
   */
  public step(
    currentState: StateVector,
    systemContext?: SystemState,
    intervention?: GenericIntervention | null,
    disturbance?: Float64Array
  ): StateVector {
    // 1. First inject intervention U_t if active
    let state = this.applyInterventionToVector(currentState, intervention);
    const n = state.values.length;
    const nextVals = new Float64Array(n);

    // 2. Dynamics integration:
    // x_{i, t+1} = x_{i, t} + dt * ( -alpha_i * (x_i - nominal) + coupling + networkFlow ) + epsilon_i
    for (let i = 0; i < n; i++) {
      const val = state.values[i];
      const bound = state.bounds[i];
      const nominal = (bound.min + bound.max) * 0.5;

      // Slight natural drift towards nominal unless perturbed
      const drift = -0.02 * (val - nominal) * this.config.timeStep;

      // Noise disturbance \epsilon_i
      const noise = disturbance 
        ? disturbance[i] 
        : (Math.random() - 0.5) * 2 * this.config.noiseSigma * (bound.max - bound.min);

      nextVals[i] = val + drift + noise;
    }

    // 3. Globe flow coupling if SystemState is provided
    if (systemContext) {
      systemContext.edges.forEach((edge) => {
        if (!edge.active) return;
        // Check for continuous variable flow along active edge
        const sourceIdx = state.nodeMapping.findIndex(
          (m) => m.nodeId === edge.source && (m.variableName === 'flow' || m.variableName === 'inventory' || m.variableName === 'resources')
        );
        const targetIdx = state.nodeMapping.findIndex(
          (m) => m.nodeId === edge.target && (m.variableName === 'flow' || m.variableName === 'inventory' || m.variableName === 'resources')
        );

        if (sourceIdx !== -1 && targetIdx !== -1) {
          const flowRate = 0.05 * edge.weight * this.config.timeStep;
          const transfer = Math.min(nextVals[sourceIdx] * flowRate, (edge.capacity ?? 100));
          nextVals[sourceIdx] -= transfer;
          nextVals[targetIdx] += transfer;
        }
      });
    }

    return clampVectorToBounds({
      ...state,
      values: nextVals
    });
  }

  /**
   * Multi-step forward projection over horizon H.
   */
  public projectHorizon(
    initialState: StateVector,
    horizon: number,
    systemContext?: SystemState,
    intervention?: GenericIntervention | null
  ): StateVector[] {
    const trajectory: StateVector[] = [initialState];
    let current = initialState;

    for (let step = 0; step < horizon; step++) {
      // Apply intervention on step 0
      const intv = step === 0 ? intervention : null;
      current = this.step(current, systemContext, intv);
      trajectory.push(current);
    }

    return trajectory;
  }
}
