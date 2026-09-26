const fs = require('fs');
const path = require('path');

const files = [
  "src/components/OrbitLab/OrbitLab.tsx",
  "src/components/OrbitLab/OrbitCommandCenter.tsx",
  "src/components/OrbitLab/RealWorldDashboard.tsx",
  "src/components/Landing/NothingLanding.tsx"
];

files.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (!fs.existsSync(fullPath)) return;
  
  let content = fs.readFileSync(fullPath, 'utf8');

  // Any 'var(--xyz)' that is inside a string like 'linear-gradient(..., 'var(--xyz)', ...)'
  // We can just find 'var(--xyz)' and if it's already inside a string, we strip its quotes.
  // We can just globally replace `'var(--` with `var(--` EVERYWHERE, 
  // and then selectively add quotes back where they are needed!
  
  // 1. Remove all quotes around var(--...)
  content = content.replace(/'var\(--([a-zA-Z0-9-]+)\)'/g, "var(--$1)");
  content = content.replace(/''var\(--([a-zA-Z0-9-]+)\)''/g, "var(--$1)");
  
  // Now ALL var(--...) are unquoted.
  // 2. Add quotes back to var(--...) where it's the ENTIRE value for a style property, or in a ternary.
  // E.g., `background: var(--bg-surface)` -> `background: 'var(--bg-surface)'`
  content = content.replace(/:\s*var\(--([a-zA-Z0-9-]+)\)/g, ": 'var(--$1)'");
  
  // E.g., `? var(--bg-elevated)` -> `? 'var(--bg-elevated)'`
  content = content.replace(/\?\s*var\(--([a-zA-Z0-9-]+)\)/g, "? 'var(--$1)'");
  
  // What about `|| var(--bg-surface)`?
  content = content.replace(/\|\|\s*var\(--([a-zA-Z0-9-]+)\)/g, "|| 'var(--$1)'");

  // This will NOT match `linear-gradient(135deg, var(--bg-surface), ...)` because it's not preceded by `: ` or `? ` or `|| `!
  // And `linear-gradient` is a string itself, so it's `background: 'linear-gradient(135deg, var(--bg-surface), ...)'`, which is perfectly valid JSX!
  
  fs.writeFileSync(fullPath, content, 'utf8');
});
