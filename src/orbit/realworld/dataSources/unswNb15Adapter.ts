/**
 * UNSW-NB15 Cybersecurity Temporal Communication Graph Adapter
 * 
 * Aggregates network flow packets into time-indexed communication graphs (1m, 5m).
 * Nodes represent host enclaves/IPs; edges represent active network corridors.
 * 
 * CRITICAL LEAKAGE AUDIT:
 * - Attack indicators (label, attack_cat) are strictly quarantined as evaluation targets.
 * - Algorithm input states (SystemNode, SystemEdge, StateVariable) NEVER contain ground-truth labels.
 */

import { SystemState, SystemNode, SystemEdge, Constraint } from '../../core/types';
import { RawUnswFlowRecord, DatasetDownloader } from './datasetDownloader';

export interface UnswOperationalEventLabel {
  timestampSec: number;
  timeStepIndex: number;
  isCyberAttackBurst: boolean;
  attackCategory: string;
  affectedHostIps: string[];
  totalAttackFlows: number;
  eventDescription: string;
}

export class UnswNb15Adapter {
  private records: RawUnswFlowRecord[];

  constructor() {
    this.records = DatasetDownloader.loadUnswNb15Records();
  }

  /**
   * Explicit Leakage Audit:
   * Verifies that no ground-truth label or attack category exists in the generated SystemState.
   */
  public verifyZeroLeakage(state: SystemState): { passed: boolean; auditLog: string[] } {
    const auditLog: string[] = [];
    let passed = true;

    // 1. Inspect nodes
    state.nodes.forEach((node, nodeId) => {
      Object.keys(node.state).forEach((varKey) => {
        const lowerKey = varKey.toLowerCase();
        if (
          lowerKey.includes('attack') ||
          lowerKey.includes('label') ||
          lowerKey.includes('malicious') ||
          lowerKey.includes('groundtruth')
        ) {
          passed = false;
          auditLog.push(`[LEAK DETECTED in Node ${nodeId}]: Forbidden feature '${varKey}' present`);
        }
      });
    });

    // 2. Inspect edges
    state.edges.forEach((edge, edgeId) => {
      if (edge.metadata) {
        Object.keys(edge.metadata).forEach((metaKey) => {
          const lowerKey = metaKey.toLowerCase();
          if (lowerKey.includes('attack') || lowerKey.includes('label')) {
            passed = false;
            auditLog.push(`[LEAK DETECTED in Edge ${edgeId}]: Forbidden metadata '${metaKey}' present`);
          }
        });
      }
    });

    // 3. Inspect global variables
    Object.keys(state.globalVariables).forEach((globKey) => {
      const lowerKey = globKey.toLowerCase();
      if (lowerKey.includes('attack') || lowerKey.includes('label')) {
        passed = false;
        auditLog.push(`[LEAK DETECTED in Global Variable]: Forbidden key '${globKey}' present`);
      }
    });

    if (passed) {
      auditLog.push('Leakage Audit PASSED: Zero ground-truth attack labels exist in operational state features.');
    }

    return { passed, auditLog };
  }

  /**
   * Builds the sequence of temporal communication graphs and sequestered event labels.
   */
  public buildTemporalGraphSequence(windowMinutes: number = 1): {
    states: SystemState[];
    eventLabels: UnswOperationalEventLabel[];
    timestamps: number[];
  } {
    const windowSec = windowMinutes * 60;
    const states: SystemState[] = [];
    const eventLabels: UnswOperationalEventLabel[] = [];
    const timestamps: number[] = [];

    const sortedRecords = [...this.records].sort((a, b) => a.timestampSec - b.timestampSec);
    if (sortedRecords.length === 0) {
      return { states: [], eventLabels: [], timestamps: [] };
    }

    const minTime = sortedRecords[0].timestampSec;
    const maxTime = sortedRecords[sortedRecords.length - 1].timestampSec;
    const totalSteps = Math.floor((maxTime - minTime) / windowSec);

    for (let step = 0; step < totalSteps; step++) {
      const windowStart = minTime + step * windowSec;
      const windowEnd = windowStart + windowSec;

      const flows = sortedRecords.filter((r) => r.timestampSec >= windowStart && r.timestampSec < windowEnd);

      // Node metric tracking
      const ipInboundBytes = new Map<string, number>();
      const ipOutboundBytes = new Map<string, number>();
      const ipInboundPkts = new Map<string, number>();
      const ipOutboundPkts = new Map<string, number>();
      const ipConnCount = new Map<string, number>();
      const ipPorts = new Map<string, Set<number>>();

      // Edge metric tracking: corridorKey -> flows
      const corridorFlows = new Map<string, RawUnswFlowRecord[]>();

      // Sequestered label tracking (NEVER goes into state)
      let totalAttacksInWindow = 0;
      const attackCats = new Set<string>();
      const attackedIps = new Set<string>();

      for (const flow of flows) {
        // Collect operational metrics
        ipOutboundBytes.set(flow.srcIp, (ipOutboundBytes.get(flow.srcIp) || 0) + flow.sourceBytes);
        ipInboundBytes.set(flow.dstIp, (ipInboundBytes.get(flow.dstIp) || 0) + flow.destBytes);

        ipOutboundPkts.set(flow.srcIp, (ipOutboundPkts.get(flow.srcIp) || 0) + flow.sourcePkts);
        ipInboundPkts.set(flow.dstIp, (ipInboundPkts.get(flow.dstIp) || 0) + flow.destPkts);

        ipConnCount.set(flow.srcIp, (ipConnCount.get(flow.srcIp) || 0) + 1);
        ipConnCount.set(flow.dstIp, (ipConnCount.get(flow.dstIp) || 0) + 1);

        if (!ipPorts.has(flow.srcIp)) ipPorts.set(flow.srcIp, new Set());
        ipPorts.get(flow.srcIp)!.add(flow.srcPort);

        if (!ipPorts.has(flow.dstIp)) ipPorts.set(flow.dstIp, new Set());
        ipPorts.get(flow.dstIp)!.add(flow.dstPort);

        const edgeKey = `${flow.srcIp}->${flow.dstIp}`;
        if (!corridorFlows.has(edgeKey)) corridorFlows.set(edgeKey, []);
        corridorFlows.get(edgeKey)!.push(flow);

        // Track sequestered ground truth
        if (flow.groundTruthIsAttack === 1) {
          totalAttacksInWindow++;
          attackedIps.add(flow.dstIp);
          attackedIps.add(flow.srcIp);
          if (flow.groundTruthAttackCat) attackCats.add(flow.groundTruthAttackCat);
        }
      }

      const activeIps = new Set<string>([
        ...Array.from(ipInboundBytes.keys()),
        ...Array.from(ipOutboundBytes.keys())
      ]);

      const nodes = new Map<string, SystemNode>();
      const edges = new Map<string, SystemEdge>();
      const constraints: Constraint[] = [];

      activeIps.forEach((ip) => {
        const inBytes = ipInboundBytes.get(ip) || 0;
        const outBytes = ipOutboundBytes.get(ip) || 0;
        const inPkts = ipInboundPkts.get(ip) || 0;
        const outPkts = ipOutboundPkts.get(ip) || 0;
        const connRate = (ipConnCount.get(ip) || 0) / windowMinutes;
        const uniquePorts = ipPorts.get(ip)?.size || 1;
        const byteAsymmetry = (outBytes + 1) / (inBytes + 1);

        nodes.set(ip, {
          id: ip,
          label: `Host ${ip}`,
          capacity: 10000,
          demand: connRate,
          state: {
            connectionRate: {
              name: 'connectionRate',
              type: 'continuous',
              value: Number(connRate.toFixed(1)),
              min: 0,
              max: 500,
              nominal: 20,
              weight: 1.4
            },
            inboundBytes: {
              name: 'inboundBytes',
              type: 'continuous',
              value: inBytes,
              min: 0,
              max: 10000000,
              nominal: 50000,
              weight: 1.1
            },
            outboundBytes: {
              name: 'outboundBytes',
              type: 'continuous',
              value: outBytes,
              min: 0,
              max: 10000000,
              nominal: 50000,
              weight: 1.3
            },
            packetRate: {
              name: 'packetRate',
              type: 'continuous',
              value: inPkts + outPkts,
              min: 0,
              max: 20000,
              nominal: 500,
              weight: 1.2
            },
            uniquePortsCount: {
              name: 'uniquePortsCount',
              type: 'continuous',
              value: uniquePorts,
              min: 1,
              max: 1024,
              nominal: 4,
              weight: 1.3
            },
            byteAsymmetryRatio: {
              name: 'byteAsymmetryRatio',
              type: 'continuous',
              value: Number(byteAsymmetry.toFixed(2)),
              min: 0.01,
              max: 100,
              nominal: 1.0,
              weight: 1.2
            }
          }
        });

        // Add operational security boundary constraints:
        // Host connection rate threshold <= 120 conn/min
        constraints.push({
          id: `sec_conn_rate_${ip}`,
          description: `Max connection rate <= 120 conn/min at ${ip}`,
          nodeId: ip,
          variableName: 'connectionRate',
          type: 'max',
          threshold: 120.0,
          isHardConstraint: ip === '149.171.126.2' || ip === '149.171.126.3', // Core web/database servers
          penaltyWeight: 60
        });

        // Unique ports scanned threshold <= 30 ports/min
        constraints.push({
          id: `sec_port_scan_${ip}`,
          description: `Max unique port touches <= 30 at ${ip}`,
          nodeId: ip,
          variableName: 'uniquePortsCount',
          type: 'max',
          threshold: 30.0,
          isHardConstraint: true,
          penaltyWeight: 50
        });
      });

      // Construct edge corridor features
      corridorFlows.forEach((edgeFlows, edgeKey) => {
        const [src, dst] = edgeKey.split('->');
        const count = edgeFlows.length;
        const totalBytes = edgeFlows.reduce((a, b) => a + b.sourceBytes + b.destBytes, 0);
        const meanDur = edgeFlows.reduce((a, b) => a + b.durationSec, 0) / count;

        edges.set(edgeKey, {
          id: edgeKey,
          source: src,
          target: dst,
          weight: 1.0,
          capacity: 1000,
          flow: count,
          latency: Number((meanDur * 1000).toFixed(1)), // ms
          active: true,
          metadata: {
            totalBytes
          }
        });
      });

      states.push({
        timestamp: windowStart * 1000,
        nodes,
        edges,
        dependencies: [
          {
            sourceNodeId: '149.171.126.2',
            targetNodeId: '149.171.126.3',
            dependencyType: 'critical',
            elasticity: 0.1,
            delayTicks: 1
          }
        ],
        constraints,
        globalVariables: {
          totalFlowVolume: {
            name: 'totalFlowVolume',
            type: 'continuous',
            value: flows.length,
            min: 0,
            max: 2000,
            nominal: 100
          }
        }
      });

      // Sequestered evaluation label
      const isAttack = totalAttacksInWindow >= 10;
      eventLabels.push({
        timestampSec: windowStart,
        timeStepIndex: step,
        isCyberAttackBurst: isAttack,
        attackCategory: Array.from(attackCats).join(', ') || 'Normal',
        affectedHostIps: Array.from(attackedIps),
        totalAttackFlows: totalAttacksInWindow,
        eventDescription: isAttack
          ? `Host Infiltration Event: ${totalAttacksInWindow} attack flows detected (${Array.from(attackCats).join(', ')})`
          : 'Normal Baseline Traffic'
      });

      timestamps.push(windowStart * 1000);
    }

    return { states, eventLabels, timestamps };
  }
}
