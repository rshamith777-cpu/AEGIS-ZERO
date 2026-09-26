const fs = require('fs');
const path = require('path');

const filesToProcess = [
  "src/components/OrbitLab/OrbitLab.tsx",
  "src/components/OrbitLab/OrbitCommandCenter.tsx",
  "src/components/OrbitLab/RealWorldDashboard.tsx",
  "src/components/Memory/EpisodicMemoryModal.tsx",
  "src/components/Landing/NothingLanding.tsx",
  "src/components/Overview/SystemOverview.tsx"
];

filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${file}`);
    return;
  }
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Replace fonts
  content = content.replace(/fontFamily:\s*'(?:monospace|"JetBrains Mono",\s*monospace)'/g, "fontFamily: 'var(--font-data)'");
  content = content.replace(/fontFamily:\s*'(?:Inter|system-ui)[^']*'/g, "fontFamily: 'var(--font-body)'");

  // Replace backgrounds
  content = content.replace(/backgroundColor:\s*'#(?:0b1120|080B11|060911|0a0f1c)'/g, "backgroundColor: 'var(--bg-space)'");
  content = content.replace(/background:\s*'#(?:0b1120|080B11|060911|0a0f1c)'/g, "background: 'var(--bg-space)'");
  
  content = content.replace(/backgroundColor:\s*'#(?:131b2e|141A24|1B2432|1e293b|0f172a)'/g, "backgroundColor: 'var(--bg-elevated)'");
  content = content.replace(/background:\s*'#(?:131b2e|141A24|1B2432|1e293b|0f172a)'/g, "background: 'var(--bg-elevated)'");

  // Replace specific RGBA colors
  content = content.replace(/rgba\(\s*15,\s*23,\s*42,\s*0\.\d+\s*\)/g, "'var(--bg-surface)'");
  content = content.replace(/rgba\(\s*6,\s*12,\s*24,\s*0\.\d+\s*\)/g, "'var(--bg-surface)'");
  content = content.replace(/rgba\(\s*255,\s*255,\s*255,\s*0\.0[568]\s*\)/g, "'var(--border-subtle)'");
  content = content.replace(/rgba\(\s*255,\s*255,\s*255,\s*0\.[12]\s*\)/g, "'var(--border-strong)'");
  content = content.replace(/rgba\(\s*0,\s*240,\s*255,\s*0\.\d+\s*\)/g, "'var(--border-strong)'");
  content = content.replace(/rgba\(\s*0,\s*0,\s*0,\s*0\.\d+\s*\)/g, "'var(--bg-surface)'");

  // Replace hex colors
  content = content.replace(/'#(?:00f0ff|00e5ff|0ea5e9|38bdf8|f8fafc|ffffff|fff)'/g, "'var(--signal-white)'");
  content = content.replace(/'#(?:ff0055|ff2a4b|ef4444)'/g, "'var(--nothing-red)'");
  content = content.replace(/'#(?:10b981|34d399)'/g, "'var(--state-green)'");
  content = content.replace(/'#(?:f59e0b|fbbf24)'/g, "'var(--state-amber)'");
  
  content = content.replace(/'#(?:94a3b8|64748b)'/g, "'var(--signal-text-muted)'");
  content = content.replace(/'#(?:cbd5e1|e2e8f0)'/g, "'var(--text-main)'");

  // Scale up font sizes
  content = content.replace(/fontSize:\s*'8px'/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*'8\.5px'/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*'9px'/g, "fontSize: '11px'");
  content = content.replace(/fontSize:\s*'9\.5px'/g, "fontSize: '12px'");
  content = content.replace(/fontSize:\s*'10px'/g, "fontSize: '12px'");
  content = content.replace(/fontSize:\s*'10\.5px'/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*'11px'/g, "fontSize: '13px'");
  content = content.replace(/fontSize:\s*'12px'/g, "fontSize: '14px'");

  fs.writeFileSync(fullPath, content, 'utf8');
  console.log(`Processed ${file}`);
});
