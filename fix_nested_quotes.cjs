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

  // Fix nested single quotes inside linear-gradient
  content = content.replace(/'linear-gradient\([^)]*'var\(--([^)]+)\)'[^)]*\)'/g, (match) => {
    // If we matched the whole linear gradient, remove the inner quotes around var
    return match.replace(/'var\(--([a-zA-Z0-9-]+)\)'/g, "var(--$1)");
  });

  // Also catch 'rgba(...) 'var(...)'
  content = content.replace(/'var\(--bg-surface\)'/g, "var(--bg-surface)");
  content = content.replace(/'var\(--bg-elevated\)'/g, "var(--bg-elevated)");
  content = content.replace(/'var\(--bg-space\)'/g, "var(--bg-space)");
  content = content.replace(/'var\(--border-subtle\)'/g, "var(--border-subtle)");
  content = content.replace(/'var\(--border-strong\)'/g, "var(--border-strong)");
  
  // Then globally restore valid quotes for React inline styles
  content = content.replace(/:\s*var\(--([a-zA-Z0-9-]+)\)/g, ": 'var(--$1)'");
  content = content.replace(/background:\s*isCurrent\s*\?\s*var\(--([a-zA-Z0-9-]+)\)/g, "background: isCurrent ? 'var(--$1)'");
  content = content.replace(/:\s*isSelected\s*\?\s*var\(--([a-zA-Z0-9-]+)\)/g, ": isSelected ? 'var(--$1)'");

  fs.writeFileSync(fullPath, content, 'utf8');
});
