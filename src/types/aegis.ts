export type NodeType = 'farm' | 'depot' | 'kitchen' | 'cafeteria' | 'ngo' | 'compost';

export interface EcosystemNode {
  id: string;
  name: string;
  code: string;
  type: NodeType;
  position: [number, number, number]; // 3D coordinates
  inventoryMeals: number;
  maxCapacity: number;
  temperatureC?: number;
  tempThresholdMax?: number;
  status: 'nominal' | 'warning' | 'critical';
  shelfLifeRemainingMin: number;
  crowdDensityPct?: number;
  description: string;
}

export interface CourierTransit {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  progress: number; // 0 to 1
  speed: number;
  cargoMeals: number;
  cargoType: string;
  status: 'in_transit' | 'rerouted' | 'blocked' | 'delivered';
  etaMinutes: number;
}

export interface CausalGraphNode {
  id: string;
  label: string;
  category: 'trigger' | 'environmental' | 'operational' | 'consequence' | 'impact';
  severity: 'nominal' | 'moderate' | 'severe' | 'catastrophic';
  confidence: number; // e.g. 0.94
  evidence: string;
  timestamp: string;
  active: boolean;
}

export interface CausalGraphEdge {
  from: string;
  to: string;
  label?: string;
  riskWeight: number;
  active: boolean;
}

export interface DisruptionIncident {
  id: string;
  title: string;
  source: string;
  detail: string;
  timeLabel: string;
  severity: 'nominal' | 'warning' | 'critical' | 'chaos';
  affectedMeals: number;
  timeRemainingMin: number;
  type: 'cold_chain' | 'demand_surge' | 'weather' | 'transit_block' | 'staff_outage' | 'sovereign_offline';
}

export type AgentRole = 
  | 'scout'
  | 'coldchain'
  | 'forecast'
  | 'logistics'
  | 'redteam'
  | 'optimizer'
  | 'safety'
  | 'commander';

export interface AgentProfile {
  id: AgentRole;
  name: string;
  callsign: string;
  role: string;
  avatarColor: string;
  status: 'idle' | 'analyzing' | 'debating' | 'consensus';
}

export interface AgentDebateMessage {
  id: string;
  agentId: AgentRole;
  agentName: string;
  callsign: string;
  stance: 'observation' | 'proposal' | 'attack' | 'rebuttal' | 'consensus';
  content: string;
  timestamp: string;
  confidenceScore: number;
}

export interface FutureTimelinePlan {
  id: 'do_nothing' | 'plan_a' | 'plan_b' | 'plan_c';
  title: string;
  tagline: string;
  recommended?: boolean;
  wastePercent: number;
  costINR: number;
  rescuePercent: number;
  co2SavedKg: number;
  riskRating: 'CRITICAL' | 'LOW' | 'MODERATE' | 'OPTIMAL';
  dispatchSteps: string[];
  divertedTo: string;
  vehiclesAssigned: number;
  transitMinutes: number;
}

export interface EpisodicMemoryEntry {
  id: string;
  incidentCode: string;
  trigger: string;
  responseStrategy: string;
  predictedRecoveryTime: string;
  actualRecoveryTime: string;
  deltaAnalysis: string;
  rootCause: string;
  lessonLearned: string;
  recordedDate: string;
  preventedWasteKg: number;
}

export interface CVPlateAnalysis {
  activeCams: number;
  lastScanTime: string;
  detectedPlates: number;
  discardRatePct: number;
  acceleratingSurge: boolean;
  crowdCountTMinus10: number;
  crowdCountTMinus5: number;
  crowdCountNow: number;
  cameraStatus: 'ONLINE_STABLE' | 'DEGRADED' | 'EDGE_ENCRYPTED';
  sampleDetections: Array<{
    id: string;
    item: string;
    shelfRemaining: string;
    spoilageProb: number;
    bbox: [number, number, number, number]; // x%, y%, w%, h%
  }>;
}
