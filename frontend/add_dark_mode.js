const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'app', 'dashboard', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add isDarkMode state
if (!content.includes('const [isDarkMode')) {
  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState\('overview'\);/,
    `const [activeTab, setActiveTab] = useState('overview');\n  const [isDarkMode, setIsDarkMode] = useState(true);\n\n  useEffect(() => {\n    if (isDarkMode) {\n      document.documentElement.classList.add('dark');\n    } else {\n      document.documentElement.classList.remove('dark');\n    }\n  }, [isDarkMode]);`
  );
}

// 2. Add Moon/Sun icons to lucide-react import
if (!content.includes('Moon')) {
  content = content.replace(/import {([^}]+)} from 'lucide-react';/, (match, p1) => {
    return `import {${p1}, Moon, Sun } from 'lucide-react';`;
  });
}

// 3. Add Glassmorphism Toggle Switch in Sidebar
// The sidebar has a flex column for nav items. Let's find the end of the nav items or the bottom of the sidebar.
// It has a <nav className="flex-1 px-4 space-y-2 mt-8 overflow-y-auto">
// Let's inject it right after the </nav> in the sidebar, before the bottom settings/user area.
if (!content.includes('onClick={() => setIsDarkMode(!isDarkMode)}')) {
  const toggleHtml = `
          {/* Dark Mode Glassmorphism Switch */}
          <div className="px-4 py-4 mt-auto border-t border-slate-200 dark:border-white/10">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 backdrop-blur-md border border-slate-200 dark:border-white/10 overflow-hidden transition-all duration-500 hover:shadow-[0_0_20px_rgba(59,130,246,0.15)] group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-cyan-500/0 group-hover:from-blue-500/5 group-hover:to-cyan-500/5 transition-all duration-500" />
              <div className="relative z-10 flex items-center gap-3">
                <div className={\`p-1.5 rounded-lg transition-colors duration-500 \${isDarkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-amber-100 text-amber-500'}\`}>
                  {isDarkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  {isDarkMode ? 'Dark Mode' : 'Light Mode'}
                </span>
              </div>
              <div className={\`relative w-10 h-5 rounded-full transition-colors duration-500 \${isDarkMode ? 'bg-blue-500/40' : 'bg-slate-300'}\`}>
                <div className={\`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-transform duration-500 \${isDarkMode ? 'translate-x-5' : 'translate-x-0'}\`} />
              </div>
            </button>
          </div>
  `;
  
  // Find </nav> inside the sidebar.
  // The sidebar structure:
  // <aside className={`fixed inset-y-0 left-0 z-50 w-64 premium-sidebar transform...
  // ...
  // </nav>
  // </div> (maybe)
  // Let's just append it to the nav if possible, or replace `</nav>` with `</nav>` + toggleHtml
  content = content.replace(/<\/nav>/, `</nav>${toggleHtml}`);
}

// 4. Global regex replacements for common Tailwind classes to add dark variants
const replacements = [
  { regex: /bg-white(?!\/| dark)/g, replace: 'bg-white dark:bg-[#0a1122]' },
  { regex: /text-slate-800(?! dark)/g, replace: 'text-slate-800 dark:text-white' },
  { regex: /text-slate-900(?! dark)/g, replace: 'text-slate-900 dark:text-white' },
  { regex: /text-slate-700(?! dark)/g, replace: 'text-slate-700 dark:text-slate-200' },
  { regex: /text-slate-600(?! dark)/g, replace: 'text-slate-600 dark:text-slate-300' },
  { regex: /text-slate-500(?! dark)/g, replace: 'text-slate-500 dark:text-slate-400' },
  { regex: /border-slate-200(?! dark)/g, replace: 'border-slate-200 dark:border-white/10' },
  { regex: /border-slate-100(?! dark)/g, replace: 'border-slate-100 dark:border-white/5' },
  { regex: /bg-slate-50(?!\/| dark)/g, replace: 'bg-slate-50 dark:bg-[#030712]' },
  { regex: /bg-slate-100(?!\/| dark)/g, replace: 'bg-slate-100 dark:bg-white/5' },
  { regex: /divide-slate-200(?! dark)/g, replace: 'divide-slate-200 dark:divide-white/10' },
  { regex: /divide-slate-100(?! dark)/g, replace: 'divide-slate-100 dark:divide-white/5' },
];

replacements.forEach(({ regex, replace }) => {
  content = content.replace(regex, replace);
});

// 5. Recharts text colors
// Replace `<XAxis dataKey="..." />` with `<XAxis dataKey="..." stroke={isDarkMode ? "#94a3b8" : "#64748b"} />`
// Just add stroke to XAxis and YAxis if not present
content = content.replace(/<(XAxis|YAxis)([^>]*)>/g, (match, tag, rest) => {
  if (rest.includes('stroke=')) return match;
  return `<${tag}${rest} stroke={isDarkMode ? "#94a3b8" : "#64748b"} />`;
});

// Recharts CartesianGrid
content = content.replace(/<CartesianGrid([^>]*)>/g, (match, rest) => {
  if (rest.includes('stroke=')) return match;
  return `<CartesianGrid${rest} strokeDasharray="3 3" stroke={isDarkMode ? "#1e293b" : "#e2e8f0"} />`;
});

// Recharts Tooltip
content = content.replace(/<Tooltip([^>]*)>/g, (match, rest) => {
  if (rest.includes('contentStyle=')) return match;
  return `<Tooltip${rest} contentStyle={{ backgroundColor: isDarkMode ? '#0a1122' : '#ffffff', borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#e2e8f0', color: isDarkMode ? '#fff' : '#000', borderRadius: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} itemStyle={{ color: isDarkMode ? '#cbd5e1' : '#475569' }} />`;
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Dashboard dark mode transformation complete.');
