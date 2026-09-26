import React from 'react';

// Scoped CSS for the dark digital twin theme
const styles = `
  .digital-twin-container {
    --dt-bg-space: #0b1120;
    --dt-bg-panel: rgba(19, 27, 46, 0.85);
    --dt-border: rgba(255, 255, 255, 0.1);
    --dt-text-main: #f8fafc;
    --dt-text-muted: #94a3b8;
    
    --dt-red: #ef4444;
    --dt-green: #22c55e;
    --dt-amber: #f59e0b;
    --dt-cyan: #38bdf8;
    
    background-color: var(--dt-bg-space);
    color: var(--dt-text-main);
    font-family: 'Inter', sans-serif;
  }

  .dt-panel {
    background: var(--dt-bg-panel);
    border: 1px solid var(--dt-border);
    border-radius: 8px;
    padding: 16px;
    backdrop-filter: blur(12px);
    margin-bottom: 16px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  }

  .dt-label {
    font-family: 'JetBrains Mono', monospace;
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--dt-text-muted);
    margin-bottom: 12px;
  }

  .dt-scroll::-webkit-scrollbar { display: none; }
  .dt-scroll { -ms-overflow-style: none; scrollbar-width: none; }
  
  .dt-pulse {
    animation: dtPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
  @keyframes dtPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
  }
`;

// Fancy SVG Charts to make it not boring
const RadarChart = () => (
  <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
    {/* Database circles */}
    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-border)" strokeWidth="1" />
    <circle cx="50" cy="50" r="25" fill="none" stroke="var(--dt-border)" strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="50" cy="50" r="10" fill="none" stroke="var(--dt-border)" strokeWidth="1" strokeDasharray="2 2" />
    
    {/* Database lines */}
    <line x1="50" y1="10" x2="50" y2="90" stroke="var(--dt-border)" strokeWidth="1" />
    <line x1="10" y1="50" x2="90" y2="50" stroke="var(--dt-border)" strokeWidth="1" />
    <line x1="21.7" y1="21.7" x2="78.3" y2="78.3" stroke="var(--dt-border)" strokeWidth="1" />
    <line x1="21.7" y1="78.3" x2="78.3" y2="21.7" stroke="var(--dt-border)" strokeWidth="1" />

    {/* Radar Polygon */}
    <polygon points="50,15 75,35 80,60 55,80 30,70 25,40" fill="rgba(56, 189, 248, 0.2)" stroke="var(--dt-cyan)" strokeWidth="1.5" />
    
    {/* Red Vector Arrow */}
    <line x1="50" y1="50" x2="65" y2="20" stroke="var(--dt-red)" strokeWidth="2" markerEnd="url(#arrow)" />
    
    {/* Markers */}
    <circle cx="75" cy="35" r="2.5" fill="var(--dt-cyan)" />
    <circle cx="80" cy="60" r="2.5" fill="var(--dt-cyan)" />
    <circle cx="55" cy="80" r="2.5" fill="var(--dt-cyan)" />
    <circle cx="30" cy="70" r="2.5" fill="var(--dt-cyan)" />
    <circle cx="25" cy="40" r="2.5" fill="var(--dt-cyan)" />
    <circle cx="50" cy="15" r="2.5" fill="var(--dt-cyan)" />

    <defs>
      <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--dt-red)" />
      </marker>
    </defs>
  </svg>
);

const LineChart = () => (
  <svg viewBox="0 0 200 80" style={{ width: '100%', height: '100%' }}>
    {/* Database */}
    <line x1="0" y1="20" x2="200" y2="20" stroke="var(--dt-border)" strokeWidth="0.5" />
    <line x1="0" y1="40" x2="200" y2="40" stroke="var(--dt-border)" strokeWidth="0.5" strokeDasharray="2 2" />
    <line x1="0" y1="60" x2="200" y2="60" stroke="var(--dt-border)" strokeWidth="0.5" />
    
    {/* Threshold line */}
    <line x1="100" y1="0" x2="100" y2="80" stroke="var(--dt-red)" strokeWidth="1" strokeDasharray="4 2" />
    
    {/* Data line */}
    <path d="M 0 70 Q 50 65, 100 40 T 200 10" fill="none" stroke="url(#gradient)" strokeWidth="2" />
    <path d="M 0 70 Q 50 65, 100 40 T 200 10 L 200 80 L 0 80 Z" fill="url(#fillGrad)" opacity="0.3" />
    
    {/* Current point */}
    <circle cx="100" cy="40" r="3" fill="var(--dt-red)" className="dt-pulse" />

    <defs>
      <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="var(--dt-cyan)" />
        <stop offset="50%" stopColor="var(--dt-amber)" />
        <stop offset="100%" stopColor="var(--dt-red)" />
      </linearGradient>
      <linearGradient id="fillGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--dt-red)" />
        <stop offset="100%" stopColor="transparent" />
      </linearGradient>
    </defs>
  </svg>
);

const NetworkGraph = () => (
  <svg viewBox="0 0 200 200" style={{ width: '100%', height: '100%' }}>
    {/* Edges */}
    <line x1="40" y1="100" x2="80" y2="60" stroke="var(--dt-green)" strokeWidth="1.5" />
    <line x1="80" y1="60" x2="140" y2="70" stroke="var(--dt-amber)" strokeWidth="1.5" />
    <line x1="140" y1="70" x2="160" y2="120" stroke="var(--dt-green)" strokeWidth="1.5" />
    <line x1="160" y1="120" x2="100" y2="150" stroke="var(--dt-red)" strokeWidth="2" strokeDasharray="3 3" />
    <line x1="100" y1="150" x2="40" y2="100" stroke="var(--dt-amber)" strokeWidth="1.5" />
    <line x1="80" y1="60" x2="100" y2="150" stroke="var(--dt-green)" strokeWidth="1.5" />
    <line x1="40" y1="100" x2="140" y2="70" stroke="var(--dt-amber)" strokeWidth="1.5" />

    {/* Nodes */}
    <g transform="translate(40,100)">
      <circle r="10" fill="var(--dt-bg-space)" stroke="var(--dt-cyan)" strokeWidth="2" />
      <text x="0" y="3" fontSize="8" fill="var(--dt-text-main)" textAnchor="middle">1</text>
    </g>
    <g transform="translate(80,60)">
      <circle r="10" fill="var(--dt-bg-space)" stroke="var(--dt-green)" strokeWidth="2" />
      <text x="0" y="3" fontSize="8" fill="var(--dt-text-main)" textAnchor="middle">2</text>
    </g>
    <g transform="translate(140,70)">
      <circle r="10" fill="var(--dt-bg-space)" stroke="var(--dt-amber)" strokeWidth="2" />
      <text x="0" y="3" fontSize="8" fill="var(--dt-text-main)" textAnchor="middle">3</text>
    </g>
    <g transform="translate(160,120)">
      <circle r="10" fill="var(--dt-bg-space)" stroke="var(--dt-green)" strokeWidth="2" />
      <text x="0" y="3" fontSize="8" fill="var(--dt-text-main)" textAnchor="middle">4</text>
    </g>
    <g transform="translate(100,150)">
      <circle r="10" fill="var(--dt-bg-space)" stroke="var(--dt-red)" strokeWidth="2" className="dt-pulse" />
      <text x="0" y="3" fontSize="8" fill="var(--dt-text-main)" textAnchor="middle">5</text>
    </g>
  </svg>
);

const SurfaceMap = () => (
  <div style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', perspective: '800px' }}>
    <div style={{
      position: 'absolute', inset: '-20%',
      transform: 'rotateX(60deg) rotateZ(-45deg)',
      background: 'linear-gradient(rgba(56,189,248,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(56,189,248,0.2) 1px, transparent 1px)',
      backgroundSize: '20px 20px',
      transformStyle: 'preserve-3d'
    }}>
      {/* 3D Peaks */}
      <div style={{ position: 'absolute', top: '30%', left: '40%', width: '40px', height: '40px', background: 'radial-gradient(circle, var(--dt-amber) 0%, transparent 70%)', transform: 'translateZ(20px)', opacity: 0.8 }}></div>
      <div style={{ position: 'absolute', top: '60%', left: '70%', width: '60px', height: '60px', background: 'radial-gradient(circle, var(--dt-red) 0%, transparent 70%)', transform: 'translateZ(40px)', opacity: 0.9 }}></div>
      <div style={{ position: 'absolute', top: '20%', left: '80%', width: '30px', height: '30px', background: 'radial-gradient(circle, var(--dt-green) 0%, transparent 70%)', transform: 'translateZ(10px)', opacity: 0.8 }}></div>
    </div>
  </div>
);


export const PhysicalDigitalTwin = ({ children }: { children?: React.ReactNode }) => {
  return (
    <>
      <style>{styles}</style>
      <div className="digital-twin-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative', overflow: 'hidden' }}>
        
        {/* Top Header / Title bar */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '64px', background: 'linear-gradient(180deg, rgba(11,17,32,0.9) 0%, transparent 100%)', zIndex: 20, display: 'flex', alignItems: 'center', padding: '0 24px', pointerEvents: 'none' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'radial-gradient(circle, var(--dt-cyan) 0%, transparent 70%)', border: '1px solid var(--dt-cyan)' }}></div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>ORBIT-A 3.1 <span style={{ color: 'var(--dt-text-muted)', fontWeight: 'normal', fontSize: '14px' }}>AEGIS ZERO</span></div>
              <div style={{ fontSize: '11px', color: 'var(--dt-text-muted)' }}>Physical Digital Twin · Real-Time System Intelligence & Transition Boundary Analysis</div>
            </div>
          </div>
        </div>

        {/* Absolute positioned Left Column */}
        <div style={{ position: 'absolute', top: '80px', left: '16px', width: '340px', bottom: '236px', overflowY: 'auto', zIndex: 10, paddingRight: '8px' }} className="dt-scroll">
          
          <div className="dt-panel">
            <div className="dt-label">System State</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--dt-red)' }} className="dt-pulse"></span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--dt-red)', letterSpacing: '2px' }}>CRITICAL</span>
              <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                <div style={{ color: 'var(--dt-red)', fontSize: '24px', fontWeight: 'bold' }}>0.78</div>
                <div className="dt-label" style={{ marginBottom: 0 }}>TBI</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '4px', height: '12px', borderRadius: '6px', overflow: 'hidden', marginTop: '16px' }}>
              <div style={{ flex: 1, backgroundColor: 'var(--dt-green)', opacity: 0.3 }}></div>
              <div style={{ flex: 1, backgroundColor: 'var(--dt-amber)', opacity: 0.3 }}></div>
              <div style={{ flex: 1, backgroundColor: 'var(--dt-red)' }}></div>
              <div style={{ flex: 1, backgroundColor: 'var(--dt-cyan)', opacity: 0.3 }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '9px', color: 'var(--dt-text-muted)', textTransform: 'uppercase' }}>
              <span>Normal</span>
              <span>Watch</span>
              <span style={{ color: 'var(--dt-red)' }}>Critical</span>
              <span>Shock</span>
            </div>
          </div>

          <div className="dt-panel">
            <div className="dt-label">Key Metrics</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {[
                { label: 'Boundary Proximity', val: '0.81', col: 'var(--dt-green)' },
                { label: 'Transition Momentum', val: '0.72', col: 'var(--dt-amber)' },
                { label: 'Structural Amplification', val: '0.68', col: 'var(--dt-amber)' },
                { label: 'Intervention Leverage', val: '0.62', col: 'var(--dt-text-muted)' }
              ].map((metric, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '22%' }}>
                  <svg width="48" height="48" viewBox="0 0 48 48" style={{ marginBottom: '8px' }}>
                    <circle cx="24" cy="24" r="22" fill="none" stroke="var(--dt-border)" strokeWidth="2" />
                    <circle cx="24" cy="24" r="22" fill="none" stroke={metric.col} strokeWidth="3" strokeDasharray={`${Number(metric.val)*138} 138`} transform="rotate(-90 24 24)" />
                    <text x="24" y="28" fontSize="12" fontWeight="bold" fill="var(--dt-text-main)" textAnchor="middle">{metric.val}</text>
                  </svg>
                  <div style={{ fontSize: '9px', textAlign: 'center', color: 'var(--dt-text-muted)', lineHeight: '1.2' }}>{metric.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="dt-panel">
            <div className="dt-label">Boundary Analysis</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '12px', color: 'var(--dt-text-muted)' }}>BTD</span>
              <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--dt-red)' }}>0.098</span>
              <span style={{ fontSize: '11px', color: 'var(--dt-text-muted)' }}>14% from boundary</span>
            </div>
            <div style={{ margin: '16px 0', position: 'relative' }}>
              <div style={{ height: '6px', background: 'linear-gradient(90deg, var(--dt-red) 0%, rgba(239,68,68,0.1) 100%)', borderRadius: '3px' }}></div>
              <div style={{ position: 'absolute', top: '-5px', left: '14%', width: '4px', height: '16px', backgroundColor: '#fff', borderRadius: '2px', boxShadow: '0 0 6px white' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginTop: '16px' }}>
              <span style={{ color: 'var(--dt-text-muted)' }}>Threat Direction</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--dt-red)', transform: 'rotate(-45deg)', fontSize: '16px' }}>➔</span> North-East Corridor
              </span>
            </div>
          </div>

          <div className="dt-panel">
            <div className="dt-label">Top Risk Interactions (O3)</div>
            {[
              { i: 1, text: 'Voltage Drop + Transformer Overload', val: '0.87' },
              { i: 2, text: 'Load Surge + Frequency Deviation', val: '0.81' },
              { i: 3, text: 'Line Congestion + Reactive Power', val: '0.76' }
            ].map(item => (
              <div key={item.i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', fontSize: '11px' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{item.i}</div>
                <div style={{ flex: 1, color: 'var(--dt-text-main)' }}>{item.text}</div>
                <div style={{ fontWeight: 'bold', color: 'var(--dt-text-muted)' }}>{item.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Absolute positioned Right Column */}
        <div style={{ position: 'absolute', top: '80px', right: '16px', width: '340px', bottom: '236px', overflowY: 'auto', zIndex: 10, paddingLeft: '8px' }} className="dt-scroll">
          <div className="dt-panel">
            <div className="dt-label">Physical ➔ Digital Twin</div>
            {[
              'Real-time Telemetry (Simulated)',
              'Topology (IEEE 14-Bus)',
              'State Estimation',
              'Boundary Projection'
            ].map(label => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12px', marginBottom: '8px', color: 'var(--dt-text-main)' }}>
                <input type="checkbox" defaultChecked style={{ accentColor: 'var(--dt-cyan)', width: '16px', height: '16px' }} />
                {label}
              </div>
            ))}
          </div>

          <div className="dt-panel" style={{ height: '240px', display: 'flex', flexDirection: 'column' }}>
            <div className="dt-label">Live Telemetry</div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <div style={{ padding: '4px 12px', fontSize: '11px', border: '1px solid var(--dt-cyan)', color: 'var(--dt-cyan)', borderRadius: '4px', background: 'rgba(56,189,248,0.1)' }}>Voltage</div>
              <div style={{ padding: '4px 12px', fontSize: '11px', border: '1px solid var(--dt-border)', color: 'var(--dt-text-muted)', borderRadius: '4px' }}>Load</div>
              <div style={{ padding: '4px 12px', fontSize: '11px', border: '1px solid var(--dt-border)', color: 'var(--dt-text-muted)', borderRadius: '4px' }}>Freq</div>
            </div>
            <div style={{ flex: 1, border: '1px solid var(--dt-border)', borderRadius: '6px', overflow: 'hidden' }}>
              <SurfaceMap />
            </div>
          </div>

          <div className="dt-panel" style={{ height: '240px', display: 'flex', flexDirection: 'column' }}>
            <div className="dt-label">Globe Topology</div>
            <div style={{ display: 'flex', flex: 1 }}>
              <div style={{ flex: 1, border: '1px solid var(--dt-border)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <NetworkGraph />
              </div>
              <div style={{ width: '90px', paddingLeft: '16px', fontSize: '11px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'var(--dt-green)' }}></div> Normal</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'var(--dt-amber)' }}></div> Warning</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'var(--dt-red)' }}></div> Critical</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><div style={{ width:'8px',height:'8px',borderRadius:'50%',backgroundColor:'var(--dt-text-muted)' }}></div> Offline</div>
              </div>
            </div>
          </div>
        </div>

        {/* Center 3D Workspace */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
          {children || (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundImage: 'radial-gradient(circle at center, rgba(30,41,59,0.8) 0%, rgba(15,23,42,1) 100%)' }}>
              <div style={{ color: 'var(--dt-text-muted)', fontSize: '24px', letterSpacing: '2px' }}>[ 3D WORLD RENDERER ]</div>
            </div>
          )}
        </div>

        {/* Absolute positioned Bottom Row */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, display: 'flex', gap: '16px', padding: '16px', height: '220px' }}>
          
          <div className="dt-panel" style={{ flex: 1, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="dt-label">Boundary Radar</div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RadarChart />
            </div>
          </div>
          
          <div className="dt-panel" style={{ flex: 1.5, marginBottom: 0 }}>
            <div className="dt-label">TBI Decomposition</div>
            <div style={{ display: 'flex', height: '130px', alignItems: 'center', gap: '24px', padding: '0 16px' }}>
              <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-border)" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-cyan)" strokeWidth="12" strokeDasharray="60 250" strokeDashoffset="0" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-green)" strokeWidth="12" strokeDasharray="50 250" strokeDashoffset="-60" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-amber)" strokeWidth="12" strokeDasharray="40 250" strokeDashoffset="-110" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="var(--dt-red)" strokeWidth="12" strokeDasharray="30 250" strokeDashoffset="-150" />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', fontWeight: 'bold' }}>0.78</div>
              </div>
              <div style={{ flex: 1, fontSize: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dt-cyan)' }}>● Boundary Proximity</span><span>0.28</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dt-green)' }}>● Transition Momentum</span><span>0.24</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dt-amber)' }}>● Structural Amplification</span><span>0.18</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: 'var(--dt-red)' }}>● Intervention Leverage</span><span>0.08</span></div>
              </div>
            </div>
          </div>
          
          <div className="dt-panel" style={{ flex: 1.5, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="dt-label">Transition Forecast</div>
            <div style={{ flex: 1 }}>
              <LineChart />
            </div>
          </div>
          
          <div className="dt-panel" style={{ flex: 1, marginBottom: 0, display: 'flex', flexDirection: 'column' }}>
            <div className="dt-label">Intervention Impact Preview</div>
            <div style={{ display: 'flex', flex: 1, gap: '16px' }}>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--dt-text-muted)', marginBottom: '4px' }}>Before (0.098)</div>
                <div style={{ flex: 1, width: '100%' }}><RadarChart /></div>
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ fontSize: '10px', color: 'var(--dt-cyan)', marginBottom: '4px' }}>After (0.214)</div>
                <div style={{ flex: 1, width: '100%', filter: 'hue-rotate(120deg)' }}><RadarChart /></div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
