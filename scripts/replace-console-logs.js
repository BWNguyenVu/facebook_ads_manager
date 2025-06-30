const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
  'src/app/settings/page.tsx',
  'src/app/campaigns/page.tsx',
  'src/lib/csvParser.ts'
];

function replaceConsoleLogsInFile(filePath) {
  console.log(`Processing ${filePath}...`);
  
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add logger import if not exists
  if (!content.includes('import { createLogger }')) {
    const importMatch = content.match(/^(import.*?from.*?;)$/m);
    if (importMatch) {
      content = content.replace(importMatch[0], `${importMatch[0]}\nimport { createLogger } from '@/lib/logger';`);
      modified = true;
    }
  }

  // Add logger instance if not exists
  if (!content.includes('const logger = createLogger(')) {
    const componentMatch = content.match(/^export\s+(default\s+)?function\s+(\w+)/m);
    if (componentMatch) {
      const componentName = componentMatch[2];
      const loggerDeclaration = `\nconst logger = createLogger('${componentName}');\n`;
      content = content.replace(componentMatch[0], `${loggerDeclaration}${componentMatch[0]}`);
      modified = true;
    }
  }

  // Replace console.log with logger.debug
  content = content.replace(/console\.log\(/g, 'logger.debug(');
  
  // Replace console.error with logger.error
  content = content.replace(/console\.error\(/g, 'logger.error(');
  
  // Replace console.warn with logger.warn
  content = content.replace(/console\.warn\(/g, 'logger.warn(');
  
  // Replace console.info with logger.info
  content = content.replace(/console\.info\(/g, 'logger.info(');

  if (modified || content !== fs.readFileSync(filePath, 'utf8')) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  } else {
    console.log(`No changes needed for ${filePath}`);
  }
}

// Process all files
filesToProcess.forEach(file => {
  const fullPath = path.join(process.cwd(), file);
  replaceConsoleLogsInFile(fullPath);
});

console.log('Console.log replacement completed!');
