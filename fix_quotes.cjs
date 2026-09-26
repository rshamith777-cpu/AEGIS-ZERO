const fs = require('fs');
const path = require('path');

const files = [
  "src/components/OrbitLab/OrbitLab.tsx",
  "src/components/OrbitLab/OrbitCommandCenter.tsx",
  "src/components/OrbitLab/RealWorldDashboard.tsx",
  "src/components/Memory/EpisodicMemoryModal.tsx",
  "src/components/Landing/NothingLanding.tsx"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Fix issues where 'var(--xyz)' is placed inside an already quoted string like 'linear-gradient(..., 'var(--bg-surface)')'
  content = content.replace(/'var\(--bg-surface\)'/g, "var(--bg-surface)");
  content = content.replace(/'var\(--bg-elevated\)'/g, "var(--bg-elevated)");
  content = content.replace(/'var\(--bg-space\)'/g, "var(--bg-space)");
  content = content.replace(/'var\(--border-subtle\)'/g, "var(--border-subtle)");
  content = content.replace(/'var\(--border-strong\)'/g, "var(--border-strong)");
  
  // But wait! This will also break normal `background: 'var(--bg-surface)'` to `background: var(--bg-surface)` which is invalid in React.
  // Actually, we ONLY want to remove inner quotes if it's inside `linear-gradient` or similar, or just restore the quotes around the whole thing.
  // Let's do it smarter.
  // Restore all of them to double quotes or single quotes properly.
  // `background: var(--bg-surface)` -> `background: 'var(--bg-surface)'`
  content = content.replace(/:\s*var\(--([a-z-]+)\)/g, ": 'var(--$1)'");
  
  // What about linear-gradient?
  // `linear-gradient(..., var(--bg-surface))` is what we want!
  // Wait, if it is `background: 'linear-gradient(135deg, var(--bg-surface), ...)'`, then removing all `'var(...)` and then adding quotes to `: var(...)` works perfectly!
  
  fs.writeFileSync(fullPath, content, 'utf8');
});
