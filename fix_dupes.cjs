const fs = require('fs');
let content = fs.readFileSync('src/components/Landing/NothingLanding.tsx', 'utf8');
content = content.replace(/import \{.*?\} from 'lucide-react';/, "import { ArrowRight, Activity, Globe, Zap, Swords, GitBranch, Flame, Database, Play, Sparkles } from 'lucide-react';");
fs.writeFileSync('src/components/Landing/NothingLanding.tsx', content);

let lr = fs.readFileSync('src/components/Navigation/LeftRail.tsx', 'utf8');
lr = lr.replace(/import \{.*?\} from 'lucide-react';/, "import { Activity, Globe, Zap, Swords, GitBranch, Flame, Database } from 'lucide-react';");
fs.writeFileSync('src/components/Navigation/LeftRail.tsx', lr);

let app = fs.readFileSync('src/App.tsx', 'utf8');
app = app.replace(/setActiveSection\(\(sec\) =>/, 'setActiveSection((sec: any) =>');
fs.writeFileSync('src/App.tsx', app);
