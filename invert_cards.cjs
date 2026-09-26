const fs = require('fs');
const path = require('path');

const files = [
  "src/components/AgentSwarm/AgentWarRoom.tsx",
  "src/components/FutureLab/FutureLab.tsx",
  "src/components/Intelligence/ContextIntelligencePanel.tsx",
  "src/components/Memory/EpisodicMemoryModal.tsx",
  "src/components/CausalGraph/CausalRadar.tsx",
  "src/components/Vision/VisionScanner.tsx"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // In CausalRadar, make lines and nodes much darker/visible
  if (file.includes('CausalRadar')) {
    content = content.replace(/stroke=\{isSelected \? '#111' : color\}/g, "stroke={isSelected ? 'var(--signal-white)' : 'var(--signal-white)'}");
    content = content.replace(/fill=\{isSelected \? '#111' : '#fff'\}/g, "fill={isSelected ? 'var(--signal-white)' : 'var(--bg-surface)'}");
    content = content.replace(/stroke=\{isEdgeActive \? 'var\(--nothing-red\)' : '#cccccc'\}/g, "stroke={isEdgeActive ? 'var(--nothing-red)' : 'var(--border-strong)'}");
    // Make text black
    content = content.replace(/fill=\{isActive \? 'var\(--signal-white\)' : 'var\(--signal-text-muted\)'\}/g, "fill='var(--signal-white)'");
  }

  // In VisionScanner, fix scanline pointer events and make bounding boxes more visible
  if (file.includes('VisionScanner')) {
    content = content.replace(/animation: 'scanline 4s linear infinite'/g, "animation: 'scanline 4s linear infinite', pointerEvents: 'none'");
  }

  // General Card Inversions (making them black)
  // AgentWarRoom Live Debate messages
  if (file.includes('AgentWarRoom')) {
    content = content.replace(/background: 'var\(--bg-elevated\)'/g, "background: 'var(--signal-white)'");
    content = content.replace(/color: 'var\(--signal-white\)'/g, "color: 'var(--bg-space)'");
    content = content.replace(/color: 'var\(--text-main\)'/g, "color: 'var(--bg-surface)'");
    content = content.replace(/color: 'var\(--signal-text-muted\)'/g, "color: 'var(--signal-text-dim)'");
  }

  // FutureLab cards
  if (file.includes('FutureLab')) {
    // For selected items
    content = content.replace(/background: isSelected \? 'var\(--signal-white\)' : 'var\(--bg-elevated\)'/g, "background: isSelected ? 'var(--signal-white)' : 'var(--signal-white)'");
    content = content.replace(/color: isSelected \? 'var\(--bg-elevated\)' : 'var\(--signal-white\)'/g, "color: isSelected ? 'var(--bg-space)' : 'var(--bg-space)'");
    content = content.replace(/color: 'var\(--signal-white\)'/g, "color: 'var(--bg-space)'");
    content = content.replace(/color: 'var\(--text-main\)'/g, "color: 'var(--bg-surface)'");
    content = content.replace(/color: 'var\(--bg-elevated\)'/g, "color: 'var(--bg-space)'");
    // specific to blueprint section
    content = content.replace(/background: 'var\(--bg-elevated\)'/g, "background: 'var(--signal-white)'");
  }

  // ContextIntelligencePanel cards
  if (file.includes('ContextIntelligencePanel')) {
    content = content.replace(/background: 'var\(--bg-elevated\)'/g, "background: 'var(--signal-white)'");
    content = content.replace(/color: 'var\(--signal-white\)'/g, "color: 'var(--bg-space)'");
  }

  fs.writeFileSync(fullPath, content, 'utf8');
});
