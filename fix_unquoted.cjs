const fs = require('fs');
const path = require('path');

const files = [
  "src/components/OrbitLab/OrbitLab.tsx",
  "src/components/OrbitLab/OrbitCommandCenter.tsx",
  "src/components/OrbitLab/RealWorldDashboard.tsx",
  "src/components/Memory/EpisodicMemoryModal.tsx",
  "src/components/Landing/NothingLanding.tsx",
  "src/App.tsx"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix unquoted var(--xyz) which became invalid syntax.
  // We use negative lookbehind to ensure it's not already quoted.
  content = content.replace(/(?<!['"])var\(--([a-zA-Z0-9-]+)\)(?!['"])/g, "'var(--$1)'");
  
  fs.writeFileSync(fullPath, content, 'utf8');
});
