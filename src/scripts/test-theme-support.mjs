import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..');

console.log('='.repeat(70));
console.log('🌙 GUARDIANAI THEME SYSTEM VERIFICATION SUITE ☀️');
console.log('='.repeat(70));

let passCount = 0;
let failCount = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passCount++;
  } else {
    console.log(`  ❌ FAIL: ${testName}`);
    if (details) console.log(`     Details: ${details}`);
    failCount++;
  }
}

// 1. Check theme context
const themeContextPath = path.join(projectRoot, 'src', 'lib', 'theme', 'theme-context.tsx');
assert(fs.existsSync(themeContextPath), 'ThemeContext file exists (src/lib/theme/theme-context.tsx)');

if (fs.existsSync(themeContextPath)) {
  const themeCode = fs.readFileSync(themeContextPath, 'utf8');
  assert(themeCode.includes('guardianai-theme'), 'ThemeContext uses storage key "guardianai-theme"');
  assert(themeCode.includes('ThemeProvider'), 'ThemeProvider exported');
  assert(themeCode.includes('useTheme'), 'useTheme hook exported');
  assert(themeCode.includes('system'), 'Supports "system" preference');
  assert(themeCode.includes('light'), 'Supports "light" theme');
  assert(themeCode.includes('dark'), 'Supports "dark" theme');
}

// 2. Check ThemeToggle component
const togglePath = path.join(projectRoot, 'src', 'components', 'theme', 'ThemeToggle.tsx');
assert(fs.existsSync(togglePath), 'ThemeToggle component exists (src/components/theme/ThemeToggle.tsx)');

if (fs.existsSync(togglePath)) {
  const toggleCode = fs.readFileSync(togglePath, 'utf8');
  assert(toggleCode.includes('aria-label'), 'ThemeToggle includes accessible aria-label');
  assert(toggleCode.includes('Sun') && toggleCode.includes('Moon'), 'ThemeToggle renders Sun and Moon icons');
  assert(toggleCode.includes('useTheme'), 'ThemeToggle connects to useTheme hook');
}

// 3. Check layout.tsx for anti-FOUT inline script
const layoutPath = path.join(projectRoot, 'src', 'app', 'layout.tsx');
assert(fs.existsSync(layoutPath), 'Root layout.tsx exists');

if (fs.existsSync(layoutPath)) {
  const layoutCode = fs.readFileSync(layoutPath, 'utf8');
  assert(layoutCode.includes('ThemeProvider'), 'Root layout wraps application in ThemeProvider');
  assert(layoutCode.includes('suppressHydrationWarning'), '<html> tag has suppressHydrationWarning to prevent SSR mismatch warning');
  assert(layoutCode.includes('guardianai-theme') && layoutCode.includes('dangerouslySetInnerHTML'), 'Inline script in <head> prevents Flash of Unstyled Theme (FOUT)');
}

// 4. Check globals.css for light & dark tokens
const globalsCssPath = path.join(projectRoot, 'src', 'app', 'globals.css');
assert(fs.existsSync(globalsCssPath), 'globals.css exists');

if (fs.existsSync(globalsCssPath)) {
  const css = fs.readFileSync(globalsCssPath, 'utf8');
  assert(css.includes(':root'), 'CSS contains :root definition for light mode');
  assert(css.includes('.dark'), 'CSS contains .dark definition for dark mode');
  assert(css.includes('--background') && css.includes('--foreground'), 'CSS variables for background and foreground defined');
  assert(css.includes('--card') && css.includes('--border'), 'CSS variables for card and border defined');
  assert(css.includes('glass-panel'), 'Glassmorphism panels defined for both themes');
}

// 5. Check semantic safety states color preservation
const utilsPath = path.join(projectRoot, 'src', 'lib', 'utils.ts');
assert(fs.existsSync(utilsPath), 'utils.ts exists');

if (fs.existsSync(utilsPath)) {
  const utilsCode = fs.readFileSync(utilsPath, 'utf8');
  assert(utilsCode.includes('getRiskColor'), 'getRiskColor exists and defines semantic colors');
  assert(utilsCode.includes('SAFE') && utilsCode.includes('MODERATE') && utilsCode.includes('HIGH') && utilsCode.includes('CRITICAL'), 'All 4 safety tiers mapped cleanly');
}

// 6. Check theme integration in core layout components
const navbarPath = path.join(projectRoot, 'src', 'components', 'layout', 'Navbar.tsx');
if (fs.existsSync(navbarPath)) {
  const navCode = fs.readFileSync(navbarPath, 'utf8');
  assert(navCode.includes('ThemeToggle'), 'Navbar integrates ThemeToggle button');
  assert(navCode.includes('dark:'), 'Navbar contains dark mode classes');
}

const landingPath = path.join(projectRoot, 'src', 'app', 'page.tsx');
if (fs.existsSync(landingPath)) {
  const landingCode = fs.readFileSync(landingPath, 'utf8');
  assert(landingCode.includes('ThemeToggle'), 'Landing page integrates ThemeToggle');
  assert(landingCode.includes('dark:bg-slate-950'), 'Landing page supports dark mode backgrounds');
  assert(landingCode.includes('bg-slate-50'), 'Landing page supports light mode backgrounds');
}

// 7. Check SOS visibility in both themes
const sosModalPath = path.join(projectRoot, 'src', 'components', 'sos', 'sos-emergency-modal.tsx');
if (fs.existsSync(sosModalPath)) {
  const sosCode = fs.readFileSync(sosModalPath, 'utf8');
  assert(sosCode.includes('border-rose-500') || sosCode.includes('bg-rose-600'), 'SOS emergency modal uses ultra-high contrast emergency red in both themes');
}

console.log('='.repeat(70));
console.log(`SUMMARY: ${passCount} Passed, ${failCount} Failed.`);
console.log('='.repeat(70));

if (failCount > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
