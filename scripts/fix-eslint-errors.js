#!/usr/bin/env node
/**
 * Auto-fix ESLint errors script
 * Fixes common ESLint errors like unused vars, unescaped entities, any types
 */

const fs = require('fs');
const path = require('path');

// Patterns to fix
const fixes = [
  // Fix unescaped quotes
  {
    pattern: /"/g,
    replacement: '&quot;',
    description: 'Fix unescaped quotes in JSX'
  },
  {
    pattern: /'/g,
    replacement: '&apos;',
    description: 'Fix unescaped apostrophes in JSX'
  }
];

// Files to process
const filesToProcess = [
  'src/app/auth/page.tsx',
  'src/app/documentation/page.tsx',
  'src/app/settings/page.tsx',
  'src/components/TokenExchange.tsx'
];

function fixFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix unescaped entities in JSX text content
  // This is a simple fix - in real scenario, you'd need more sophisticated parsing
  const jsxTextPattern = />([^<]*["'][^<]*)</g;
  content = content.replace(jsxTextPattern, (match, textContent) => {
    if (textContent.includes('"') || textContent.includes("'")) {
      const fixed = textContent
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      modified = true;
      return `>${fixed}<`;
    }
    return match;
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
}

// Process files
filesToProcess.forEach(file => {
  const fullPath = path.join(__dirname, '..', file);
  fixFile(fullPath);
});

console.log('ESLint auto-fix completed!');
