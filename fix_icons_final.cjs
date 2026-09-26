const fs = require('fs');
const path = require('path');

const replacements = {
  'MessageCircle': 'Activity',
  'MessageSquare': 'Activity',
  
  'Share2': 'Globe',
  'Network': 'Globe',
  
  'CircleHelp': 'Zap',
  'HelpCircle': 'Zap',
  
  'Navigation': 'GitBranch',
  'Compass': 'GitBranch',
  
  'Grid': 'Database',
  'LayoutGrid': 'Database',
  
  'Expand': 'Activity',
  'Maximize': 'Activity'
};

const directory = path.join(__dirname, 'src');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(directory);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  for (const [oldIcon, newIcon] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${oldIcon}\\b`, 'g');
    if (regex.test(content)) {
      content = content.replace(regex, newIcon);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
