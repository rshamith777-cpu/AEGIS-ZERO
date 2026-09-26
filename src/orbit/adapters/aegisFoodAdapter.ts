import {
  SystemState,
  SystemNode,
  SystemEdge,
  Constraint,
  GenericIntervention,
  DependencyInfo
} from '../core/types';
import { EcosystemNode, CourierTransit } from '../../types/aegis';

/**
 * AEGIS Food Resilience Domain Adapter:
 * 
 * Maps domain-specific food infrastructure (Farms, Cold Depots, Central Kitchens,
 * Campus Dining Halls, Relief Shelters, Couriers, and Ambient Weather) into
 * domain-agnostic ORBIT SystemState (V, E, S, D).
 * 
 * ORBIT itself contains ZERO food-waste terms; all mapping is encapsulated here.
 */

export class AegisFoodAdapter {
  /**
   * Transforms AEGIS ecosystem entities into a generic ORBIT SystemState.
   */
  public static aegisToOrbitState(
    nodes: EcosystemNode[],
    couriers: CourierTransit[] = [],
    disruptionActive: boolean = false
  ): SystemState {
    const orbitNodes = new Map<string, SystemNode>();
    const orbitEdges = new Map<string, SystemEdge>();
    const constraints: Constraint[] = [];
    const dependencies: DependencyInfo[] = [];

    // 1. Map each physical facility into a generic SystemNode
    nodes.forEach((node) => {
      const isDepot = node.type === 'depot';
      const isCafeteria = node.type === 'cafeteria';
      const isKitchen = node.type === 'kitchen';

      orbitNodes.set(node.id, {
        id: node.id,
        label: node.name,
        category: node.type,
        capacity: node.maxCapacity,
        demand: isCafeteria ? (node.crowdDensityPct ?? 50) * 4 : 50,
        state: {
          inventory: {
            name: 'inventory',
            type: 'continuous',
            value: node.inventoryMeals,
            min: 0,
            max: node.maxCapacity * 1.5,
            nominal: node.maxCapacity * 0.7,
            weight: 1.0,
            unit: 'units'
          },
          temperature: {
            name: 'temperature',
            type: 'continuous',
            value: node.temperatureC ?? 4.0,
            min: -25.0,
            max: 35.0,
            nominal: isDepot ? -18.0 : 4.0,
            weight: isDepot ? 2.5 : 0.8,
            unit: '°C'
          },
          shelfLife: {
            name: 'shelfLife',
            type: 'continuous',
            value: node.shelfLifeRemainingMin,
            min: 0,
            max: 240,
            nominal: 180,
            weight: 1.8,
            unit: 'min'
          },
          demandVelocity: {
            name: 'demandVelocity',
            type: 'continuous',
            value: node.crowdDensityPct ?? 40,
            min: 0,
            max: 100,
            nominal: 45,
            weight: 1.2,
            unit: '%'
          }
        },
        metadata: {
          code: node.code,
          originalType: node.type,
          status: node.status
        }
      });

      // Food safety thermal boundary constraint
      if (node.tempThresholdMax !== undefined) {
        constraints.push({
          id: `const_temp_${node.id}`,
          description: `${node.name} Critical Temperature Threshold (+${node.tempThresholdMax}°C)`,
          nodeId: node.id,
          variableName: 'temperature',
          type: 'max',
          threshold: node.tempThresholdMax,
          isHardConstraint: true,
          penaltyWeight: 60
        });
      }

      // Spoilage shelf-life boundary constraint
      constraints.push({
        id: `const_shelflife_${node.id}`,
        description: `${node.name} Minimum Safe Shelf-Life Threshold (30 min)`,
        nodeId: node.id,
        variableName: 'shelfLife',
        type: 'min',
        threshold: 30, // below 30 min is critical hazard
        isHardConstraint: true,
        penaltyWeight: 45
      });
    });

    // 2. Map Logistics Fleet into Generic SystemEdges
    couriers.forEach((courier) => {
      orbitEdges.set(courier.id, {
        id: courier.id,
        source: courier.fromNodeId,
        target: courier.toNodeId,
        weight: courier.speed * 100,
        capacity: courier.cargoMeals,
        flow: courier.cargoMeals * courier.progress,
        latency: courier.etaMinutes,
        type: courier.cargoType,
        active: courier.status !== 'blocked'
      });
    });

    // 3. Static facility interconnect corridors if not covered by active couriers
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const edgeKey = `corridor_${nodes[i].id}_${nodes[j].id}`;
        if (!orbitEdges.has(edgeKey)) {
          orbitEdges.set(edgeKey, {
            id: edgeKey,
            source: nodes[i].id,
            target: nodes[j].id,
            weight: 0.8,
            active: true
          });
        }
      }
    }

    // 4. Critical Dependencies (e.g. Depot supplies Cafeteria and Shelter)
    dependencies.push({
      sourceNodeId: 'node-depot',
      targetNodeId: 'node-campus-north',
      dependencyType: 'critical',
      elasticity: 0.90,
      delayTicks: 2
    });
    dependencies.push({
      sourceNodeId: 'node-depot',
      targetNodeId: 'node-shelter',
      dependencyType: 'critical',
      elasticity: 0.85,
      delayTicks: 2
    });

    return {
      timestamp: Date.now(),
      nodes: orbitNodes,
      edges: orbitEdges,
      dependencies,
      constraints,
      globalVariables: {
        ambientTemperature: {
          name: 'ambientTemperature',
          type: 'continuous',
          value: disruptionActive ? 34.2 : 26.5,
          min: 15,
          max: 48,
          nominal: 25,
          unit: '°C'
        },
        monsoonPrecipitation: {
          name: 'monsoonPrecipitation',
          type: 'continuous',
          value: disruptionActive ? 68.0 : 12.0,
          min: 0,
          max: 120,
          nominal: 10,
          unit: 'mm/h'
        }
      }
    };
  }

  /**
   * Generates domain-grounded candidate interventions formatted as generic ORBIT interventions.
   */
  public static generateAegisInterventions(disruptionActive: boolean): GenericIntervention[] {
    if (!disruptionActive) {
      return [
        {
          id: 'intv_routine_balancing',
          name: 'Routine Logistics Flow Balancing',
          actions: [
            {
              id: 'act_flow_opt',
              targetNodeId: 'node-depot',
              targetVariable: 'inventory',
              actionType: 'increment',
              value: -20,
              cost: 1500,
              latencyTicks: 1,
              description: 'Routine staging transfer to Prep Kitchen'
            }
          ],
          totalCost: 1500,
          resourceRequirements: { transportFuel: 10 },
          maxExecutionTimeTicks: 2
        }
      ];
    }

    // Active Crisis Interventions:
    return [
      {
        id: 'plan_a_dual_split',
        name: 'Pareto Dual-Split Bypass Dispatch',
        actions: [
          {
            id: 'act_evacuate_depot',
            targetNodeId: 'node-depot',
            targetVariable: 'inventory',
            actionType: 'increment',
            value: -184,
            cost: 8200,
            latencyTicks: 1,
            description: 'Rapid evacuation of 184 compromised packs via High-Elevation Bypass'
          },
          {
            id: 'act_boost_quad',
            targetNodeId: 'node-campus-north',
            targetVariable: 'inventory',
            actionType: 'increment',
            value: 110,
            cost: 2000,
            latencyTicks: 2,
            description: 'Inject 110 dinner portions to absorb Tech Quad surge'
          },
          {
            id: 'act_boost_shelter',
            targetNodeId: 'node-shelter',
            targetVariable: 'inventory',
            actionType: 'increment',
            value: 74,
            cost: 2000,
            latencyTicks: 2,
            description: 'Redirect 74 flash-chilled meals to Annapoorna Shelter'
          }
        ],
        totalCost: 12200,
        resourceRequirements: { expressCouriers: 2, bypassTolls: 400 },
        maxExecutionTimeTicks: 2,
        tags: ['PARETO_OPTIMAL', 'HIGH_RECOVERY', 'RAPID']
      },
      {
        id: 'plan_b_aux_generator',
        name: 'Depot Backup Cryo Generator Kick-In',
        actions: [
          {
            id: 'act_cool_depot',
            targetNodeId: 'node-depot',
            targetVariable: 'temperature',
            actionType: 'set',
            value: -14.0,
            cost: 38000,
            latencyTicks: 3,
            description: 'Engage diesel aux generator #2 to repressurize chiller circuit'
          }
        ],
        totalCost: 38000,
        resourceRequirements: { dieselFuelLiters: 180 },
        maxExecutionTimeTicks: 4,
        tags: ['HIGH_COST', 'SLOW_RECOVERY', 'EQUIPMENT_REPAIR']
      },
      {
        id: 'do_nothing',
        name: 'Status Quo (Inaction / Mandatory Condemnation)',
        actions: [],
        totalCost: 48900, // Cost of 184 wasted meals + disposal fees
        resourceRequirements: {},
        maxExecutionTimeTicks: 10,
        tags: ['UNSAFE', 'HIGH_WASTE', 'REGIME_BREACH']
      }
    ];
  }
}
