const fs = require('fs');
const path = require('path');

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  // Fix path issues
  if (content.includes('GitBranch/MinimalHeader')) {
    content = content.replace(/GitBranch\/MinimalHeader/g, 'Navigation/MinimalHeader');
    changed = true;
  }
  if (content.includes('GitBranch/LeftRail')) {
    content = content.replace(/GitBranch\/LeftRail/g, 'Navigation/LeftRail');
    changed = true;
  }
  
  // Fix 'sec' param in App.tsx specifically
  if (filePath.endsWith('App.tsx') && content.includes('setActiveSection((sec) =>')) {
    content = content.replace(/setActiveSection\(\(sec\) =>/g, 'setActiveSection((sec: any) =>');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

const dir = path.join(__dirname, 'src');
function walk(d) {
  const list = fs.readdirSync(d);
  list.forEach(file => {
    file = path.join(d, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      walk(file);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fixFile(file);
    }
  });
}

walk(dir);
