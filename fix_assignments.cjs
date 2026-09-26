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

  // Fix: Add quotes for various JS contexts
  content = content.replace(/=\s*var\(--([a-zA-Z0-9-]+)\)/g, "= 'var(--$1)'");
  content = content.replace(/:\s*var\(--([a-zA-Z0-9-]+)\)/g, ": 'var(--$1)'");
  content = content.replace(/\?\s*var\(--([a-zA-Z0-9-]+)\)/g, "? 'var(--$1)'");
  content = content.replace(/\|\|\s*var\(--([a-zA-Z0-9-]+)\)/g, "|| 'var(--$1)'");
  content = content.replace(/===\s*var\(--([a-zA-Z0-9-]+)\)/g, "=== 'var(--$1)'");
  content = content.replace(/return\s*var\(--([a-zA-Z0-9-]+)\)/g, "return 'var(--$1)'");

  // Fix nested quotes that might have been created by mistake 
  // (if any got double single quotes because they already had them and then were caught by the first script)
  content = content.replace(/''var\(--([a-zA-Z0-9-]+)\)''/g, "'var(--$1)'");

  fs.writeFileSync(fullPath, content, 'utf8');
});
