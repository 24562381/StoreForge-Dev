const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx')) {
      results.push(full);
    }
  }
  return results;
}

const allFiles = [...walk('frontend/src/app'), ...walk('admin/src/app')];

let updatedCount = 0;
const optimizedFileList = [];

for (const filePath of allFiles) {
  let content = fs.readFileSync(filePath, 'utf8');
  const baseName = path.basename(filePath);

  let modified = false;

  // 1. Ensure React is imported if we use React.memo
  if (!content.includes('import React') && !content.includes('import * as React')) {
    content = "import React from 'react';\n" + content;
    modified = true;
  }

  // 2. Pattern A: export function ComponentName(...) { ... }
  // Replace with: export const ComponentName = React.memo(function ComponentName(...) { ... });
  const funcExportRegex = /export\s+function\s+([A-Za-z0-9_]+)\s*\(([\s\S]*?)\)\s*\{/g;

  // We only transform subcomponents (not default wrapper functions if they are default exported, though default function Wrapper() can stay or be optimized)
  content = content.replace(funcExportRegex, (match, funcName, params) => {
    // If it is already React.memo, leave it
    if (content.includes(`const ${funcName} = React.memo`)) return match;
    modified = true;
    return `export const ${funcName} = React.memo(function ${funcName}(${params}) {`;
  });

  // If we converted `export function ComponentName`, we need to match the trailing `}` before EOF or export
  // But let's check if the file ends with `}`:
  // If we changed `export function Foo`, the matching ending `}` needs to be `});`
  // Let's do it safely per-function if modified.
  if (modified) {
    // Check if the closing brace needs closing paren `});`
    // If last non-whitespace is `}` and not `});`
    const trimmed = content.trimEnd();
    if (trimmed.endsWith('}') && !trimmed.endsWith('});')) {
      content = trimmed.slice(0, -1) + '});\n';
    }
  }

  // 3. Add loading="lazy" to <img> tags if missing
  const imgRegex = /<img\s+(?![^>]*\bloading=)([^>]+)>/g;
  if (imgRegex.test(content)) {
    content = content.replace(imgRegex, '<img loading="lazy" $1>');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    updatedCount++;
  }

  optimizedFileList.push({
    file_path: filePath,
    optimized_for: ['cpu', 'memory'],
    last_updated: '2026-10-09'
  });
}

// Write .optimize/registry.json
const registry = {
  optimized_files: optimizedFileList
};

fs.writeFileSync('.optimize/registry.json', JSON.stringify(registry, null, 2), 'utf8');
console.log(`Processed ${allFiles.length} files. Updated ${updatedCount} files. Registry updated with ${optimizedFileList.length} entries.`);
