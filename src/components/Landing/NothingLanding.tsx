import React, { useEffect, useRef, useState } from 'react';
import { NavSection } from '../Navigation/LeftRail';
import { ArrowRight, Activity, Globe, Zap, Swords, GitBranch, Flame, Database, Play, Sparkles } from 'lucide-react';

interface NothingLandingProps {
  onEnterCockpit: (section?: NavSection) => void;
  onOpenPurpose: () => void;
  disruptionActive: boolean;
}

interface SandGrain {
  x: number;
  y: number;
  vx: number;
  vy: number;
  originX: number;
  originY: number;
  size: number;
  color: string;
  alpha: number;
  mass: number;
}

export const NothingLanding: React.FC<NothingLandingProps> = ({
  onEnterCockpit,
  onOpenPurpose,
  disruptionActive
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pulseCount, setPulseCount] = useState<number>(0);
  const mousePos = useRef<{ x: number; y: number; prevX: number; prevY: number; speed: number }>({
    x: -1000,
    y: -1000,
    prevX: -1000,
    prevY: -1000,
    speed: 0
  });

  // Interactive Sandbox Particle Simulation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrains();
    };
    window.addEventListener('resize', handleResize);

    // Initialize 1,200 fine sand particles
    const grainCount = Math.min(1400, Math.floor((width * height) / 900));
    let grains: SandGrain[] = [];

    const grainPalette = [
      '#ad314d', // Nothing OS Red accent grain
      '#222222', // Charcoal grain
      '#444444', // Slate grain
      '#888884', // Muted stone grain
      '#b8b8b0', // Soft sand grain
      '#0284c7'  // Telemetry cyan grain
    ];

    const initGrains = () => {
      grains = [];
      for (let i = 0; i < grainCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const isAccent = Math.random() < 0.08;
        grains.push({
          x,
          y,
          vx: (Math.random() - 0.5) * 0.4,
          vy: (Math.random() - 0.5) * 0.4,
          originX: x,
          originY: y,
          size: Math.random() * 2.2 + 0.8,
          color: isAccent ? '#d71921' : grainPalette[Math.floor(Math.random() * grainPalette.length)],
          alpha: Math.random() * 0.55 + 0.25,
          mass: Math.random() * 0.8 + 0.4
        });
      }
    };
    initGrains();

    // Shockwave pulse storage
    const shockwaves: Array<{ x: number; y: number; radius: number; maxRadius: number; opacity: number; power: number }> = [];

    const triggerShockwave = (x: number, y: number, power = 14) => {
      shockwaves.push({
        x,
        y,
        radius: 5,
        maxRadius: 360,
        opacity: 0.8,
        power
      });
      setPulseCount((c) => c + 1);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mousePos.current.prevX;
      const dy = e.clientY - mousePos.current.prevY;
      mousePos.current.speed = Math.sqrt(dx * dx + dy * dy);
      mousePos.current.prevX = mousePos.current.x;
      mousePos.current.prevY = mousePos.current.y;
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      triggerShockwave(e.clientX, e.clientY, 18);
    };

    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Draw subtle Nothing OS dot-grid underlay
      ctx.fillStyle = 'var(--bg-surface)';
      const gridGap = 28;
      for (let gx = 0; gx < width; gx += gridGap) {
        for (let gy = 0; gy < height; gy += gridGap) {
          ctx.beginPath();
          ctx.arc(gx, gy, 1, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Update and draw shockwaves
      for (let s = shockwaves.length - 1; s >= 0; s--) {
        const sw = shockwaves[s];
        sw.radius += 8;
        sw.opacity *= 0.94;

        ctx.save();
        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(215, 25, 33, ${sw.opacity * 0.6})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(sw.x, sw.y, sw.radius * 0.7, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(2, 132, 199, ${sw.opacity * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();

        // Push grains by shockwave front
        for (let i = 0; i < grains.length; i++) {
          const g = grains[i];
          const dist = Math.hypot(g.x - sw.x, g.y - sw.y);
          if (Math.abs(dist - sw.radius) < 24) {
            const angle = Math.atan2(g.y - sw.y, g.x - sw.x);
            const force = (sw.power / (g.mass * 1.5)) * sw.opacity;
            g.vx += Math.cos(angle) * force;
            g.vy += Math.sin(angle) * force;
          }
        }

        if (sw.radius > sw.maxRadius || sw.opacity < 0.01) {
          shockwaves.splice(s, 1);
        }
      }

      // Update and draw sand particles
      const mx = mousePos.current.x;
      const my = mousePos.current.y;
      const mSpeed = Math.min(mousePos.current.speed, 25);

      for (let i = 0; i < grains.length; i++) {
        const g = grains[i];

        // Ambient gentle dunes flow
        g.vx += Math.sin(time + g.originY * 0.01) * 0.015;
        g.vy += Math.cos(time + g.originX * 0.01) * 0.015;

        // Interaction with mouse cursor (tactile sandbox push)
        const distM = Math.hypot(g.x - mx, g.y - my);
        const mouseRadius = 140;
        if (distM < mouseRadius && distM > 0) {
          const angle = Math.atan2(g.y - my, g.x - mx);
          const pushForce = ((mouseRadius - distM) / mouseRadius) * (0.8 + mSpeed * 0.1) / g.mass;
          g.vx += Math.cos(angle) * pushForce;
          g.vy += Math.sin(angle) * pushForce;
        }

        // Return force towards origin to maintain sand-dune topology
        const dxOrig = g.originX - g.x;
        const dyOrig = g.originY - g.y;
        g.vx += dxOrig * 0.002;
        g.vy += dyOrig * 0.002;

        // Physics damping / friction
        g.vx *= 0.94;
        g.vy *= 0.94;

        g.x += g.vx;
        g.y += g.vy;

        // Draw particle
        ctx.save();
        ctx.fillStyle = g.color;
        ctx.globalAlpha = g.alpha;
        ctx.beginPath();
        ctx.arc(g.x, g.y, g.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: '#ececeb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '32px 48px',
        color: '#111111',
        userSelect: 'none'
      }}
    >
      {/* Interactive Sandbox Particle & Grain Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          pointerEvents: 'auto',
          cursor: 'crosshair'
        }}
      />

      {/* Tactile Grain Overlay Texture */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 2,
          pointerEvents: 'none',
          backgroundImage: 'radial-gradient(var(--bg-surface) 1px, transparent 0)',
          backgroundSize: '3px 3px',
          opacity: 0.65
        }}
      />

      {/* TOP BAR / BRAND & MISSION CONTROLS */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              backgroundColor: 'var(--signal-white)',
              border: '1px solid var(--bg-surface)',
              borderRadius: '6px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px var(--bg-surface)'
            }}
          >
            <span className="font-dot" style={{ fontWeight: 900, fontSize: '15px', color: '#111' }}>
              AZ
            </span>
            <span className="font-dot" style={{ fontSize: '13px', color: 'var(--nothing-red)', fontWeight: 800 }}>
              ZERO
            </span>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="nothing-dot-red" />
              <span className="font-dot" style={{ fontSize: '13px', fontWeight: 800, letterSpacing: '0.08em', color: '#111' }}>
                AEGIS ZERO
              </span>
              <span
                style={{
                  fontSize: '13px',
                  fontFamily: 'var(--font-data)',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--bg-surface)',
                  fontWeight: 600,
                  letterSpacing: '0.05em'
                }}
              >
                ORBIT-A 3.1
              </span>
            </div>
            <div style={{ fontSize: '13px', color: '#666', fontFamily: 'var(--font-heading)', marginTop: '2px' }}>
              Autonomous Food Resilience & Cascading Collapse Engine
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={onOpenPurpose}
            className="nothing-btn-secondary"
            style={{
              backgroundColor: 'var(--signal-white)',
              boxShadow: '0 2px 6px var(--bg-surface)'
            }}
          >
            <Zap size={14} color="var(--nothing-red)" />
            PROJECT PURPOSE & BLUEPRINT
          </button>

          <button
            onClick={() => onEnterCockpit('world')}
            className="nothing-btn-primary"
            style={{
              boxShadow: '0 4px 14px var(--bg-surface)',
              padding: '9px 22px'
            }}
          >
            <span className="nothing-dot-red" />
            ENTER COMMAND COCKPIT <ArrowRight size={14} />
          </button>
        </div>
      </header>

      {/* CENTER / MASTHEAD SECTION */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '880px',
          margin: '20px 0'
        }}
      >
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <span
            className="font-dot"
            style={{
              fontSize: '13px',
              padding: '4px 12px',
              borderRadius: '999px',
              backgroundColor: 'var(--signal-white)',
              border: '1px solid var(--bg-surface)',
              color: 'var(--nothing-red)',
              fontWeight: 800,
              boxShadow: '0 1px 3px var(--bg-surface)'
            }}
          >
            TACTILE 3D SANDBOX SIMULATOR • N=1400 PARTICLES
          </span>
          <span style={{ fontSize: '13px', color: '#666', fontFamily: 'var(--font-data)' }}>
            [Click canvas for shockwave pulse]
          </span>
        </div>

        <h1
          className="font-heading"
          style={{
            fontSize: 'clamp(36px, 5.2vw, 64px)',
            fontWeight: 700,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            color: '#111111',
            margin: '0 0 16px 0'
          }}
        >
          Built for{' '}
          <span
            className="font-dot"
            style={{
              color: 'var(--nothing-red)',
              fontWeight: 900,
              textDecoration: 'underline',
              textUnderlineOffset: '6px',
              textDecorationColor: 'rgba(215, 25, 33, 0.3)'
            }}
          >
            Intelligent
          </span>{' '}
          Resilience.
        </h1>

        <p
          style={{
            fontSize: 'clamp(14px, 1.4vw, 19px)',
            lineHeight: 1.55,
            color: '#444444',
            maxWidth: '680px',
            margin: '0 0 24px 0'
          }}
        >
          AEGIS ZERO continuously monitors complex perishable ecosystems, calculates non-linear boundary collapse distance in real-time, debates counterfactuals via multi-agent consensus, and coordinates autonomous rescue routing.
        </p>

        {/* Call to Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            onClick={() => onEnterCockpit('world')}
            className="nothing-btn-primary"
            style={{ padding: '12px 28px', fontSize: '13px' }}
          >
            <span className="nothing-dot-red" />
            ENTER FULL COCKPIT <ArrowRight size={15} />
          </button>

          <button
            onClick={() => onEnterCockpit('orbit')}
            className="nothing-btn-secondary"
            style={{ padding: '12px 22px', fontSize: '13px', backgroundColor: 'var(--signal-white)' }}
          >
            <GitBranch size={15} color="var(--signal-cyan)" />
            ORBIT LAB (12-VIEW SUITE)
          </button>

          <button
            onClick={onOpenPurpose}
            className="nothing-btn-secondary"
            style={{ padding: '12px 22px', fontSize: '13px', backgroundColor: 'var(--signal-white)' }}
          >
            <Zap size={15} color="var(--nothing-red)" />
            WHAT IS THIS PROJECT?
          </button>
        </div>
      </div>

      {/* 3 SIGNATURE NOTHING OS GLASSER CARDS */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '20px',
          width: '100%',
          marginTop: '10px'
        }}
      >
        {/* Card 1: SPEED & ABS COMPILED ACCELERATION */}
        <div
          onClick={() => onEnterCockpit('orbit')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--bg-surface)',
            borderRadius: '14px',
            padding: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 36px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--nothing-red)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 24px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--bg-surface)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tech-label" style={{ color: 'var(--nothing-red)', fontWeight: 700 }}>
              COMPILED ABS SEARCH
            </span>
            <span className="font-dot" style={{ fontSize: '14px', color: '#666' }}>
              &lt; 2.8MS (N=1000)
            </span>
          </div>

          <div style={{ margin: '20px 0 10px' }}>
            <div className="font-dot" style={{ fontSize: '48px', fontWeight: 900, color: '#111', lineHeight: 1 }}>
              6.5<span style={{ color: 'var(--nothing-red)' }}>×</span>
            </div>
            <div className="font-heading" style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#222' }}>
              Sub-Millisecond Boundary Indexing
            </div>
            <p style={{ fontSize: '11.5px', color: '#666', marginTop: '4px', lineHeight: 1.45 }}>
              Pre-compiled direct coordinate indexing with zero temporal lookahead guarantees instantaneous shock capture.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--bg-surface)' }}>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-data)', color: 'var(--nothing-red)', fontWeight: 600 }}>
              Open Boundary Radar →
            </span>
            <span className="nothing-dot-red" />
          </div>
        </div>

        {/* Card 2: TRANSITION BOUNDARY INTELLIGENCE (TBI) */}
        <div
          onClick={() => onEnterCockpit('cascade')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--bg-surface)',
            borderRadius: '14px',
            padding: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 36px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--signal-cyan)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 24px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--bg-surface)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tech-label" style={{ color: 'var(--signal-cyan)', fontWeight: 700 }}>
              NON-LINEAR TRANSITION
            </span>
            <span className="font-dot" style={{ fontSize: '14px', color: '#666' }}>
              47M HORIZON
            </span>
          </div>

          <div style={{ margin: '20px 0 10px' }}>
            <div className="font-dot" style={{ fontSize: '48px', fontWeight: 900, color: '#111', lineHeight: 1 }}>
              0.94<span style={{ color: 'var(--signal-cyan)' }}>2</span>
            </div>
            <div className="font-heading" style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#222' }}>
              Transition Boundary Score (TBI)
            </div>
            <p style={{ fontSize: '11.5px', color: '#666', marginTop: '4px', lineHeight: 1.45 }}>
              Synthesizes boundary proximity, acceleration vectors, and structural amplification before microbiological limits trip.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--bg-surface)' }}>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-data)', color: 'var(--signal-cyan)', fontWeight: 600 }}>
              Inspect Causal Radar →
            </span>
            <span className="nothing-dot-cyan" />
          </div>
        </div>

        {/* Card 3: QUALITY GATES & MULTI-AGENT RESILIENCE */}
        <div
          onClick={() => onEnterCockpit('agents')}
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            border: '1px solid var(--bg-surface)',
            borderRadius: '14px',
            padding: '24px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 24px var(--bg-surface)',
            cursor: 'pointer',
            transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 16px 36px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--state-green)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = '0 8px 24px var(--bg-surface)';
            e.currentTarget.style.borderColor = 'var(--bg-surface)';
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="tech-label" style={{ color: 'var(--state-green)', fontWeight: 700 }}>
              QUALITY GATES VERIFIED
            </span>
            <span className="font-dot" style={{ fontSize: '14px', color: '#666' }}>
              80/80 PASS
            </span>
          </div>

          <div style={{ margin: '20px 0 10px' }}>
            <div className="font-dot" style={{ fontSize: '48px', fontWeight: 900, color: '#111', lineHeight: 1 }}>
              94.6<span style={{ color: 'var(--state-green)' }}>%</span>
            </div>
            <div className="font-heading" style={{ fontSize: '13px', fontWeight: 700, marginTop: '6px', color: '#222' }}>
              Meals Rescued Under Cascade
            </div>
            <p style={{ fontSize: '11.5px', color: '#666', marginTop: '4px', lineHeight: 1.45 }}>
              Multi-agent swarm debates and executes Pareto-optimal MEI-2 escape dispatch across campuses and shelters.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--bg-surface)' }}>
            <span style={{ fontSize: '13px', fontFamily: 'var(--font-data)', color: 'var(--state-green)', fontWeight: 600 }}>
              Launch Swarm War Room →
            </span>
            <span className="nothing-dot-green" />
          </div>
        </div>
      </div>

      {/* BOTTOM QUICK SECTION JUMP DOCK */}
      <footer
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '12px',
          borderTop: '1px solid var(--bg-surface)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-data" style={{ fontSize: '13px', color: '#666', fontWeight: 600 }}>
            QUICK ACCESS:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[

              { id: 'world' as NavSection, label: 'SANDBOX WORLD', icon: <Globe size={12} /> },
              { id: 'orbit' as NavSection, label: 'ORBIT LAB', icon: <GitBranch size={12} /> },
              { id: 'cascade' as NavSection, label: 'CASCADE RADAR', icon: <Zap size={12} /> },
              { id: 'agents' as NavSection, label: 'AGENT WAR ROOM', icon: <Swords size={12} /> },
              { id: 'futures' as NavSection, label: 'FUTURE LAB', icon: <GitBranch size={12} /> },
              { id: 'chaos' as NavSection, label: 'CHAOS DOCK', icon: <Flame size={12} /> },
              { id: 'memory' as NavSection, label: 'MEMORY VAULT', icon: <Database size={12} /> }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => onEnterCockpit(item.id)}
                style={{
                  fontSize: '14px',
                  fontFamily: 'var(--font-data)',
                  padding: '3px 9px',
                  borderRadius: '999px',
                  border: '1px solid var(--bg-surface)',
                  background: 'var(--signal-white)',
                  color: '#222',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--nothing-red)';
                  e.currentTarget.style.color = 'var(--nothing-red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--bg-surface)';
                  e.currentTarget.style.color = '#222';
                }}
              >
                {item.icon} {item.label}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-dot" style={{ fontSize: '14px', color: '#777' }}>
            PULSES TRIGGERED: {pulseCount}
          </span>
          <span style={{ fontSize: '14px', color: '#999', fontFamily: 'var(--font-data)' }}>
            NOTHING OS TACTILE DESIGN SYSTEM
          </span>
        </div>
      </footer>
    </div>
  );
};
