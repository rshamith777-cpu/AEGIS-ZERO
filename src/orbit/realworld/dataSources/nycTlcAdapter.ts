/**
 * NYC TLC Transportation Globe Operational Graph Adapter
 * 
 * Aggregates raw trip records into time-indexed operational graphs (15m, 30m, 60m).
 * Constructs node and edge features, directional corridor profiles, and physical constraints.
 */

import { SystemState, SystemNode, SystemEdge, Constraint } from '../../core/types';
import { RawTlcTripRecord, DatasetDownloader } from './datasetDownloader';

export interface NycTlcGraphOptions {
  windowIntervalMinutes: 15 | 30 | 60;
  minFlowThreshold: number;
}

export interface NycOperationalEventLabel {
  timestamp: number;
  timeStepIndex: number;
  isGridlockShock: boolean;
  affectedZoneIds: number[];
  congestionDurationMultiplier: number;
  outflowDropPct: number;
  eventDescription: string;
}

export class NycTlcAdapter {
  private records: RawTlcTripRecord[];
  private options: NycTlcGraphOptions;

  constructor(options: Partial<NycTlcGraphOptions> = {}) {
    this.options = {
      windowIntervalMinutes: options.windowIntervalMinutes ?? 15,
      minFlowThreshold: options.minFlowThreshold ?? 2
    };
    this.records = DatasetDownloader.loadNycTlcRecords();
  }

  /**
   * Builds the sequence of temporal operational graphs over the dataset duration.
   */
  public buildTemporalGraphSequence(): {
    states: SystemState[];
    eventLabels: NycOperationalEventLabel[];
    timestamps: number[];
  } {
    const windowMs = this.options.windowIntervalMinutes * 60 * 1000;
    const states: SystemState[] = [];
    const eventLabels: NycOperationalEventLabel[] = [];
    const timestamps: number[] = [];

    // Parse all pickup timestamps to find total time extent
    const parsedTrips = this.records.map((r) => ({
      ...r,
      pickupMs: new Date(r.pickupDatetime).getTime(),
      dropoffMs: new Date(r.dropoffDatetime).getTime(),
      durationMinutes: Math.max(1, (new Date(r.dropoffDatetime).getTime() - new Date(r.pickupDatetime).getTime()) / 60000)
    })).sort((a, b) => a.pickupMs - b.pickupMs);

    if (parsedTrips.length === 0) {
      return { states: [], eventLabels: [], timestamps: [] };
    }

    const minTime = parsedTrips[0].pickupMs;
    const maxTime = parsedTrips[parsedTrips.length - 1].pickupMs;
    const totalSteps = Math.floor((maxTime - minTime) / windowMs);

    // Track zone historical demand to compute rolling volatility and growth
    const zoneHistoricalPickups = new Map<number, number[]>();
    const corridorHistoricalFlows = new Map<string, number[]>();

    for (let step = 0; step < totalSteps; step++) {
      const windowStart = minTime + step * windowMs;
      const windowEnd = windowStart + windowMs;

      // Extract trips inside this temporal window
      const windowTrips = parsedTrips.filter((t) => t.pickupMs >= windowStart && t.pickupMs < windowEnd);

      // Node feature aggregators
      const nodePickups = new Map<number, number>();
      const nodeDropoffs = new Map<number, number>();
      const nodeDurations = new Map<number, number[]>();

      // Edge flow aggregators: corridorKey -> trips
      const corridorTrips = new Map<string, typeof windowTrips>();

      for (const trip of windowTrips) {
        nodePickups.set(trip.puLocationId, (nodePickups.get(trip.puLocationId) || 0) + 1);
        nodeDropoffs.set(trip.doLocationId, (nodeDropoffs.get(trip.doLocationId) || 0) + 1);

        if (!nodeDurations.has(trip.puLocationId)) nodeDurations.set(trip.puLocationId, []);
        nodeDurations.get(trip.puLocationId)!.push(trip.durationMinutes);

        const edgeKey = `${trip.puLocationId}->${trip.doLocationId}`;
        if (!corridorTrips.has(edgeKey)) corridorTrips.set(edgeKey, []);
        corridorTrips.get(edgeKey)!.push(trip);
      }

      // Collect all active zones
      const activeZoneIds = new Set<number>([
        ...Array.from(nodePickups.keys()),
        ...Array.from(nodeDropoffs.keys())
      ]);

      const nodes = new Map<string, SystemNode>();
      const edges = new Map<string, SystemEdge>();
      const constraints: Constraint[] = [];

      let totalNetworkOutflow = 0;
      let totalNetworkDurationSum = 0;
      let totalNetworkTrips = 0;

      activeZoneIds.forEach((zoneId) => {
        const puCount = nodePickups.get(zoneId) || 0;
        const doCount = nodeDropoffs.get(zoneId) || 0;
        const inflowPerMin = doCount / this.options.windowIntervalMinutes;
        const outflowPerMin = puCount / this.options.windowIntervalMinutes;
        const durations = nodeDurations.get(zoneId) || [15];
        const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;

        totalNetworkOutflow += outflowPerMin;
        totalNetworkDurationSum += avgDuration * puCount;
        totalNetworkTrips += puCount;

        // Historical tracking for growth and rolling volatility
        if (!zoneHistoricalPickups.has(zoneId)) zoneHistoricalPickups.set(zoneId, []);
        const hist = zoneHistoricalPickups.get(zoneId)!;
        hist.push(puCount);
        if (hist.length > 8) hist.shift();

        const prevPu = hist.length > 1 ? hist[hist.length - 2] : puCount;
        const demandGrowth = prevPu > 0 ? (puCount - prevPu) / prevPu : 0;

        // Rolling volatility
        const meanHist = hist.reduce((a, b) => a + b, 0) / hist.length;
        const varianceHist = hist.reduce((a, b) => a + Math.pow(b - meanHist, 2), 0) / hist.length;
        const rollingVolatility = Math.sqrt(varianceHist);

        // Availability proxy: Net accumulation rate (positive = surplus arrival, negative = deficit outflow)
        const availabilityProxy = inflowPerMin - outflowPerMin;

        nodes.set(`zone_${zoneId}`, {
          id: `zone_${zoneId}`,
          label: `TLC Zone ${zoneId}`,
          capacity: 1000,
          demand: puCount,
          state: {
            pickupDemand: {
              name: 'pickupDemand',
              type: 'continuous',
              value: puCount,
              min: 0,
              max: 2000,
              nominal: 150,
              weight: 1.2
            },
            dropoffDemand: {
              name: 'dropoffDemand',
              type: 'continuous',
              value: doCount,
              min: 0,
              max: 2000,
              nominal: 150,
              weight: 1.0
            },
            inflow: {
              name: 'inflow',
              type: 'continuous',
              value: Number(inflowPerMin.toFixed(2)),
              min: 0,
              max: 100,
              nominal: 10,
              weight: 1.0
            },
            outflow: {
              name: 'outflow',
              type: 'continuous',
              value: Number(outflowPerMin.toFixed(2)),
              min: 0,
              max: 100,
              nominal: 10,
              weight: 1.2
            },
            tripDuration: {
              name: 'tripDuration',
              type: 'continuous',
              value: Number(avgDuration.toFixed(1)),
              min: 1,
              max: 180,
              nominal: 18,
              weight: 1.5
            },
            demandGrowth: {
              name: 'demandGrowth',
              type: 'continuous',
              value: Number(demandGrowth.toFixed(3)),
              min: -1.0,
              max: 5.0,
              nominal: 0.0,
              weight: 1.1
            },
            availabilityProxy: {
              name: 'availabilityProxy',
              type: 'continuous',
              value: Number(availabilityProxy.toFixed(2)),
              min: -50,
              max: 50,
              nominal: 0,
              weight: 1.0
            },
            rollingVolatility: {
              name: 'rollingVolatility',
              type: 'continuous',
              value: Number(rollingVolatility.toFixed(2)),
              min: 0,
              max: 200,
              nominal: 15,
              weight: 1.0
            }
          }
        });

        // Add operational constraint: Trip duration upper boundary (Congestion limit <= 45 mins)
        constraints.push({
          id: `const_trip_duration_${zoneId}`,
          description: `Average departure trip duration <= 45.0 mins at Zone ${zoneId}`,
          nodeId: `zone_${zoneId}`,
          variableName: 'tripDuration',
          type: 'max',
          threshold: 45.0,
          isHardConstraint: zoneId === 161 || zoneId === 230, // Midtown / Times Sq are critical corridors
          penaltyWeight: 50
        });
      });

      // Construct edge corridor features
      corridorTrips.forEach((trips, edgeKey) => {
        const [puStr, doStr] = edgeKey.split('->');
        const pu = Number(puStr);
        const doId = Number(doStr);
        const volume = trips.length;

        if (volume < this.options.minFlowThreshold) return;

        const durations = trips.map((t) => t.durationMinutes);
        const meanTravelTime = durations.reduce((a, b) => a + b, 0) / durations.length;

        if (!corridorHistoricalFlows.has(edgeKey)) corridorHistoricalFlows.set(edgeKey, []);
        const histFlow = corridorHistoricalFlows.get(edgeKey)!;
        histFlow.push(volume);
        if (histFlow.length > 8) histFlow.shift();

        const prevFlow = histFlow.length > 1 ? histFlow[histFlow.length - 2] : volume;
        const flowGrowth = prevFlow > 0 ? (volume - prevFlow) / prevFlow : 0;
        const temporalChange = volume - prevFlow;

        edges.set(edgeKey, {
          id: edgeKey,
          source: `zone_${pu}`,
          target: `zone_${doId}`,
          weight: 1.0,
          capacity: 1000,
          flow: volume,
          latency: Number(meanTravelTime.toFixed(1)),
          active: true,
          metadata: {
            flowGrowth: Number(flowGrowth.toFixed(3)),
            temporalChange
          }
        });
      });

      const avgNetworkDuration = totalNetworkTrips > 0 ? totalNetworkDurationSum / totalNetworkTrips : 18;

      const zone161Durations = nodeDurations.get(161) || [];
      const avg161Duration = zone161Durations.length > 0
        ? zone161Durations.reduce((a, b) => a + b, 0) / zone161Durations.length
        : avgNetworkDuration;

      // Define real-world operational event strictly from operational telemetry at time t:
      // Operational Gridlock Shock = Midtown arterial corridor duration >= 32 mins OR network average >= 26 mins
      const isGridlockShock = avg161Duration >= 32.0 || avgNetworkDuration >= 26.0;

      states.push({
        timestamp: windowStart,
        nodes,
        edges,
        dependencies: [
          {
            sourceNodeId: 'zone_161',
            targetNodeId: 'zone_230',
            dependencyType: 'critical',
            elasticity: 0.9,
            delayTicks: 1
          }
        ],
        constraints,
        globalVariables: {
          networkDurationMean: {
            name: 'networkDurationMean',
            type: 'continuous',
            value: Number(avgNetworkDuration.toFixed(1)),
            min: 5,
            max: 120,
            nominal: 18
          },
          networkOutflowTotal: {
            name: 'networkOutflowTotal',
            type: 'continuous',
            value: Number(totalNetworkOutflow.toFixed(1)),
            min: 0,
            max: 500,
            nominal: 120
          }
        }
      });

      eventLabels.push({
        timestamp: windowStart,
        timeStepIndex: step,
        isGridlockShock,
        affectedZoneIds: isGridlockShock ? [161, 230, 186] : [],
        congestionDurationMultiplier: Number((avgNetworkDuration / 18.0).toFixed(2)),
        outflowDropPct: isGridlockShock ? 45.0 : 0.0,
        eventDescription: isGridlockShock
          ? `Severe Corridor Gridlock: Avg trip duration spiked to ${avgNetworkDuration.toFixed(1)}m (2.3x normal)`
          : 'Normal Diurnal Traffic'
      });

      timestamps.push(windowStart);
    }

    return { states, eventLabels, timestamps };
  }
}
