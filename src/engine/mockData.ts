import {
  EcosystemNode,
  CourierTransit,
  CausalGraphNode,
  CausalGraphEdge,
  FutureTimelinePlan,
  EpisodicMemoryEntry,
  CVPlateAnalysis,
  AgentProfile
} from '../types/aegis';

export const INITIAL_ECOSYSTEM_NODES: EcosystemNode[] = [
  {
    id: 'node-depot',
    name: 'Regional Cold Hub Alpha',
    code: 'RCH-01',
    type: 'depot',
    position: [-4.5, 0.2, -2.5],
    inventoryMeals: 8420,
    maxCapacity: 12000,
    temperatureC: -18.2,
    tempThresholdMax: -12.0,
    status: 'nominal',
    shelfLifeRemainingMin: 2880, // 48h
    description: 'Central cold chain depot with 6 multi-stage ammonia chillers storing bulk dairy, poultry and vacuum-packed meal kits.'
  },
  {
    id: 'node-kitchen',
    name: 'Culinary Prep Factory',
    code: 'CPF-02',
    type: 'kitchen',
    position: [-1.2, 0.2, 2.2],
    inventoryMeals: 3450,
    maxCapacity: 6000,
    temperatureC: 3.5,
    tempThresholdMax: 5.0,
    status: 'nominal',
    shelfLifeRemainingMin: 480, // 8h
    description: 'Autonomous central production kitchen with blast-chillers preparing 12,000 batch meals daily.'
  },
  {
    id: 'node-campus-north',
    name: 'Tech Quad Dining Hall',
    code: 'TQD-03',
    type: 'cafeteria',
    position: [3.8, 0.2, 2.8],
    inventoryMeals: 1120,
    maxCapacity: 3500,
    temperatureC: 4.0,
    tempThresholdMax: 8.0,
    status: 'nominal',
    shelfLifeRemainingMin: 180,
    crowdDensityPct: 78,
    description: 'Major university dining center serving Engineering and CS faculty. High sensitivity to weather and festival schedules.'
  },
  {
    id: 'node-campus-south',
    name: 'South Hostel Canteen',
    code: 'SHC-04',
    type: 'cafeteria',
    position: [5.2, 0.2, -1.8],
    inventoryMeals: 680,
    maxCapacity: 2200,
    temperatureC: 4.1,
    tempThresholdMax: 8.0,
    status: 'nominal',
    shelfLifeRemainingMin: 210,
    crowdDensityPct: 54,
    description: 'Residential campus cafeteria with high late-night dinner spikes and student transit dependencies.'
  },
  {
    id: 'node-shelter',
    name: 'Annapoorna Rescue Shelter',
    code: 'ARS-05',
    type: 'ngo',
    position: [0.8, 0.2, -5.2],
    inventoryMeals: 340,
    maxCapacity: 2500,
    temperatureC: 2.8,
    tempThresholdMax: 6.0,
    status: 'nominal',
    shelfLifeRemainingMin: 360,
    description: 'City-certified community food rescue bank feeding 2,000 homeless and displaced citizens in south metropolitan sector.'
  },
  {
    id: 'node-compost',
    name: 'Bio-Enzyme Digester 7',
    code: 'BED-06',
    type: 'compost',
    position: [-5.8, 0.2, 3.5],
    inventoryMeals: 0,
    maxCapacity: 8000,
    status: 'nominal',
    shelfLifeRemainingMin: 0,
    description: 'Last-resort microbial anaerobic digester converting spoiled matter into high-nitrogen soil compost and bio-methane.'
  }
];

export const INITIAL_COURIERS: CourierTransit[] = [
  {
    id: 'courier-01',
    name: 'Cryo-Fleet #01',
    fromNodeId: 'node-depot',
    toNodeId: 'node-kitchen',
    progress: 0.65,
    speed: 0.003,
    cargoMeals: 650,
    cargoType: 'Chilled Raw Protein & Produce',
    status: 'in_transit',
    etaMinutes: 11
  },
  {
    id: 'courier-02',
    name: 'Express Van #04',
    fromNodeId: 'node-kitchen',
    toNodeId: 'node-campus-north',
    progress: 0.32,
    speed: 0.004,
    cargoMeals: 420,
    cargoType: 'Warm Insulated Batch Trays',
    status: 'in_transit',
    etaMinutes: 19
  },
  {
    id: 'courier-03',
    name: 'Rescue Courier #09',
    fromNodeId: 'node-kitchen',
    toNodeId: 'node-shelter',
    progress: 0.88,
    speed: 0.0035,
    cargoMeals: 200,
    cargoType: 'Flash-Chilled Surplus Meals',
    status: 'in_transit',
    etaMinutes: 4
  }
];

export const AGENT_PROFILES: AgentProfile[] = [
  { id: 'scout', name: 'Scout Agent', callsign: 'CYPHER-1', role: 'Multi-Modal Anomaly Ingestion', avatarColor: '#00f0ff', status: 'idle' },
  { id: 'coldchain', name: 'Cold-Chain Sentinel', callsign: 'KRYOS-4', role: 'Thermal & Microbial Physics', avatarColor: '#38bdf8', status: 'idle' },
  { id: 'forecast', name: 'Forecast Agent', callsign: 'PROPHET-2', role: 'Weather & Crowd Trajectory', avatarColor: '#a855f7', status: 'idle' },
  { id: 'logistics', name: 'Routing & Fleet', callsign: 'VECTOR-7', role: 'Dynamic Graph Transit Solver', avatarColor: '#eab308', status: 'idle' },
  { id: 'redteam', name: 'Red-Team Adversary', callsign: 'NEMESIS-X', role: 'Plan Invalidation & Edge Cases', avatarColor: '#ef4444', status: 'idle' },
  { id: 'optimizer', name: 'Pareto Optimizer', callsign: 'NEXUS-9', role: 'Multi-Objective Waste Minimizer', avatarColor: '#10b981', status: 'idle' },
  { id: 'safety', name: 'Safety & Compliance', callsign: 'AEGIS-SAFE', role: 'FSSAI / Hazard Constraint Lock', avatarColor: '#06b6d4', status: 'idle' },
  { id: 'commander', name: 'Commander Executive', callsign: 'OVERWATCH', role: 'Consensus Synthesis & Human Order', avatarColor: '#f59e0b', status: 'idle' }
];

export const INITIAL_CAUSAL_NODES: CausalGraphNode[] = [
  { id: 'c1', label: 'IoT Sensor Heartbeat', category: 'trigger', severity: 'nominal', confidence: 0.99, evidence: 'MQTT stream normal on 14 channels', timestamp: '19:42:01', active: false },
  { id: 'c2', label: 'Compressor #3 Circuit', category: 'operational', severity: 'nominal', confidence: 0.98, evidence: 'Current draw 14.2A nominal', timestamp: '19:42:05', active: false },
  { id: 'c3', label: 'Cold Storage Ambient Temp', category: 'operational', severity: 'nominal', confidence: 0.97, evidence: 'Temp: -18.2°C steady', timestamp: '19:42:10', active: false },
  { id: 'c4', label: 'Bacterial Growth Zone', category: 'consequence', severity: 'nominal', confidence: 0.95, evidence: 'Sub-zero containment active', timestamp: '19:42:15', active: false },
  { id: 'c5', label: 'Arterial Corridor Transit', category: 'environmental', severity: 'nominal', confidence: 0.91, evidence: 'Average speed 38 km/h', timestamp: '19:42:20', active: false },
  { id: 'c6', label: 'Campus Dining Surge', category: 'environmental', severity: 'nominal', confidence: 0.89, evidence: 'Crowd density 78%', timestamp: '19:42:25', active: false },
  { id: 'c7', label: 'Spoilage & Landfill Dump', category: 'impact', severity: 'nominal', confidence: 0.94, evidence: 'Ecosystem waste: 3.2%', timestamp: '19:42:30', active: false }
];

export const INITIAL_CAUSAL_EDGES: CausalGraphEdge[] = [
  { from: 'c1', to: 'c2', label: 'Telemetry Link', riskWeight: 0.1, active: false },
  { from: 'c2', to: 'c3', label: 'Cooling Power', riskWeight: 0.2, active: false },
  { from: 'c3', to: 'c4', label: 'Thermal Degradation', riskWeight: 0.15, active: false },
  { from: 'c4', to: 'c7', label: 'Perishability Cascade', riskWeight: 0.1, active: false },
  { from: 'c5', to: 'c7', label: 'Transit Bottleneck', riskWeight: 0.2, active: false },
  { from: 'c6', to: 'c7', label: 'Demand Mismatch', riskWeight: 0.18, active: false }
];

export const MOCK_FUTURE_PLANS: Record<string, FutureTimelinePlan[]> = {
  default: [
    {
      id: 'do_nothing',
      title: 'Status Quo (Do Nothing)',
      tagline: 'Standard scheduled distribution without adaptive dynamic reroute',
      wastePercent: 3.2,
      costINR: 14200,
      rescuePercent: 88.0,
      co2SavedKg: 340,
      riskRating: 'LOW',
      dispatchSteps: ['Maintain standard delivery routes', 'Cook scheduled batch B-4'],
      divertedTo: 'Normal Cafeterias',
      vehiclesAssigned: 3,
      transitMinutes: 24
    }
  ],
  compressor_failure: [
    {
      id: 'do_nothing',
      title: 'DO NOTHING (UNMITIGATED)',
      tagline: 'Leave 184 meals in warming Chiller #3 without emergency reroute',
      wastePercent: 18.6,
      costINR: 48900,
      rescuePercent: 34.0,
      co2SavedKg: 42,
      riskRating: 'CRITICAL',
      dispatchSteps: [
        'Chiller #3 internal temp climbs past +8°C in 28 minutes',
        'FSSAI biological safety threshold violated at T+47m',
        '184 vacuum-sealed meals condemned to bio-waste'
      ],
      divertedTo: 'Bio-Compost Landfill',
      vehiclesAssigned: 0,
      transitMinutes: 0
    },
    {
      id: 'plan_a',
      title: 'PLAN A: DUAL-SPLIT RESCUE DISPATCH',
      tagline: 'Express dynamic split: 110 meals to Campus Quad + 74 meals to Annapoorna Shelter',
      recommended: true,
      wastePercent: 1.8,
      costINR: 18200,
      rescuePercent: 94.6,
      co2SavedKg: 430,
      riskRating: 'OPTIMAL',
      dispatchSteps: [
        'Deploy Cryo-Fleet #01 via High-Elevation Bypass (avoid Route B flood)',
        'Offload 110 hot-ready meals to Tech Quad Dining Hall (ETA 22 min)',
        'Reroute Express Van #04 with 74 meals to Annapoorna Shelter (ETA 16 min)',
        'All food consumed 19 minutes ahead of critical microbial limit'
      ],
      divertedTo: 'Tech Quad + Annapoorna Shelter',
      vehiclesAssigned: 2,
      transitMinutes: 22
    },
    {
      id: 'plan_b',
      title: 'PLAN B: RAPID CRYO-BLAST CONVERSION',
      tagline: 'Move all 184 meals to Auxiliary Chiller #1 and convert to frozen reserve',
      wastePercent: 4.8,
      costINR: 23500,
      rescuePercent: 82.0,
      co2SavedKg: 310,
      riskRating: 'MODERATE',
      dispatchSteps: [
        'Transfer inventory to Chiller #1 (internal warehouse hand-trucks)',
        'Requires 45 kW burst energy pull',
        'Campus Quad still faces 15% dinner stockout later tonight'
      ],
      divertedTo: 'Internal Deep Freeze',
      vehiclesAssigned: 0,
      transitMinutes: 8
    }
  ]
};

export const INITIAL_EPISODIC_MEMORIES: EpisodicMemoryEntry[] = [
  {
    id: 'mem-001',
    incidentCode: 'INC-2026-0814',
    trigger: 'Monsoon flash-flood severed arterial Highway 4 at 18:40.',
    responseStrategy: 'Rerouted 340 meals to Suburban Shelter via elevated ring road.',
    predictedRecoveryTime: '24 min',
    actualRecoveryTime: '31 min',
    deltaAnalysis: 'Predicted transit erred by +7m due to localized bus lane congestion.',
    rootCause: 'Dynamic traffic weight did not account for surface bus staging.',
    lessonLearned: 'Penalty factor for Highway 4 during rain elevated from 1.3 to 1.8 in routing heuristics.',
    recordedDate: '14 Aug 2026',
    preventedWasteKg: 280
  },
  {
    id: 'mem-002',
    incidentCode: 'INC-2026-0902',
    trigger: 'Unannounced campus hackathon hack-pack added 450 unexpected students.',
    responseStrategy: 'Inter-cafeteria stock rebalancing between South Canteen and Quad.',
    predictedRecoveryTime: '18 min',
    actualRecoveryTime: '17 min',
    deltaAnalysis: 'Prediction matched actual within 5.5% precision.',
    rootCause: 'Hackathon schedule ingestion delay from Student Affairs RSS feed.',
    lessonLearned: 'Integrated campus calendar webhook with 30-second polling.',
    recordedDate: '02 Sep 2026',
    preventedWasteKg: 410
  }
];

export const INITIAL_CV_DATA: CVPlateAnalysis = {
  activeCams: 4,
  lastScanTime: '19:42:38 IST',
  detectedPlates: 127,
  discardRatePct: 4.2,
  acceleratingSurge: true,
  crowdCountTMinus10: 42,
  crowdCountTMinus5: 79,
  crowdCountNow: 127,
  cameraStatus: 'ONLINE_STABLE',
  sampleDetections: [
    { id: 'det-1', item: 'Steam Table Pan #2 (Rice & Lentil)', shelfRemaining: '2h 15m', spoilageProb: 0.02, bbox: [12, 18, 38, 34] },
    { id: 'det-2', item: 'Salad Bar Container #4 (Cut Greens)', shelfRemaining: '45m', spoilageProb: 0.08, bbox: [58, 22, 32, 28] },
    { id: 'det-3', item: 'Hot Hold #1 (Vegetable Curry)', shelfRemaining: '1h 50m', spoilageProb: 0.03, bbox: [24, 60, 46, 30] }
  ]
};
