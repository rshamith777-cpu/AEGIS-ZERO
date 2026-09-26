import * as Lucide from 'lucide-react';

const icons = ['Cpu', 'Award', 'HelpCircle', 'Compass', 'CircleHelp', 'Shield', 'Zap', 'Activity', 'Globe', 'Flame', 'Database', 'GitBranch', 'Swords', 'ArrowRight', 'Play', 'Sparkles', 'X', 'ShieldAlert', 'CheckCircle2'];
const results = {};
for (const icon of icons) {
  results[icon] = typeof Lucide[icon];
}
console.log(JSON.stringify(results, null, 2));
