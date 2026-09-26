const fs = require('fs');
const path = require('path');

const replacements = {
  'MessageSquare': 'MessageCircle',
  'Network': 'Share2',
  'HelpCircle': 'CircleHelp',
  'Compass': 'Navigation',
  'LayoutGrid': 'Grid',
  'Maximize': 'Expand'
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
    // Only replace if it's imported from lucide-react or if it's used as a JSX tag.
    // Wait, let's just do a global replace for these specific words, since they are icon names.
    // Except 'Network' in OrbitLab might be locally defined!
    // "import { Target, Network... } from './icons'" - we don't want to change that if it's working!
    // Wait, the errors were specifically from lucide-react:
    // Module '"lucide-react"' has no exported member 'Network'
    
    // We can specifically target imports from lucide-react:
    if (content.includes(`import {`) && content.includes(`} from 'lucide-react'`)) {
      const regex = new RegExp(`\\b${oldIcon}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, newIcon);
        changed = true;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
  }
});
