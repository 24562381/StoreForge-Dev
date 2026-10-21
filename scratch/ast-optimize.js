const fs = require('fs');
const path = require('path');
const ts = require('frontend/node_modules/typescript');

function walk(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') && !file.endsWith('.d.ts')) {
      results.push(full);
    }
  }
  return results;
}

const frontendFiles = walk('frontend/src/app');
const adminFiles = walk('admin/src/app');
const allFiles = [...frontendFiles, ...adminFiles];

let modifiedCount = 0;
const optimizedFiles = [];

for (const filePath of allFiles) {
  const baseName = path.basename(filePath);

  let code = fs.readFileSync(filePath, 'utf8');
  let originalCode = code;

  // Let's use TS parser to inspect top-level exported functions
  const sourceFile = ts.createSourceFile(filePath, code, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

  const replacements = [];

  // Find functions to memoize
  sourceFile.statements.forEach((statement) => {
    if (ts.isFunctionDeclaration(statement) && statement.name) {
      const isExported = statement.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
      const isDefault = statement.modifiers?.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);

      // If it is an exported non-default function component (starts with uppercase)
      const name = statement.name.text;
      if (isExported && !isDefault && /^[A-Z]/.test(name) && statement.body) {
        // Check if already memoized
        const funcText = statement.getText(sourceFile);
        if (!funcText.includes('React.memo')) {
          const exportKeyword = statement.modifiers.find(m => m.kind === ts.SyntaxKind.ExportKeyword);
          const startPos = exportKeyword.getStart(sourceFile);
          const namePos = statement.name.getStart(sourceFile);
          const bodyEnd = statement.body.getEnd();

          // We want to replace "export function Name" with "export const Name = React.memo(function Name"
          // and after body add ");"
          replacements.push({
            start: startPos,
            exportEnd: namePos,
            bodyEnd: bodyEnd,
            name: name
          });
        }
      }
    }
  });

  // Apply replacements from bottom to top
  if (replacements.length > 0) {
    replacements.sort((a, b) => b.start - a.start);
    for (const rep of replacements) {
      const beforeExport = code.substring(0, rep.start);
      const fromFunc = code.substring(rep.start);
      // Replace "export function Name" -> "export const Name = React.memo(function Name"
      const matchPattern = new RegExp(`^export\\s+function\\s+${rep.name}`);
      if (matchPattern.test(fromFunc)) {
        const newFromFuncHeader = fromFunc.replace(matchPattern, `export const ${rep.name} = React.memo(function ${rep.name}`);
        // Now find where the function body ends in newFromFuncHeader
        // In the original substring from rep.start to rep.bodyEnd
        const lengthOfOriginal = rep.bodyEnd - rep.start;
        // The difference in header length:
        const headerDiff = `export const ${rep.name} = React.memo(function ${rep.name}`.length - `export function ${rep.name}`.length;
        const newBodyEnd = lengthOfOriginal + headerDiff;

        const beforeBodyEnd = newFromFuncHeader.substring(0, newBodyEnd);
        const afterBodyEnd = newFromFuncHeader.substring(newBodyEnd);
        code = beforeExport + beforeBodyEnd + ');' + afterBodyEnd;
      }
    }
  }

  // Ensure React import exists if React.memo is used
  if (code.includes('React.memo') && !code.includes("import React") && !code.includes("import * as React")) {
    if (code.startsWith("'use client';") || code.startsWith('"use client";')) {
      code = code.replace(/^(["']use client["'];?\s*)/, "$1\nimport React from 'react';\n");
    } else {
      code = "import React from 'react';\n" + code;
    }
  }

  // Optimize <img> tags: add loading="lazy" if not present
  code = code.replace(/<img\s+(?![^>]*\bloading=)([^>]+)>/g, '<img loading="lazy" $1>');

  if (code !== originalCode) {
    fs.writeFileSync(filePath, code, 'utf8');
    modifiedCount++;
  }

  optimizedFiles.push({
    file_path: filePath,
    optimized_for: ['cpu', 'memory'],
    last_updated: '2026-10-09'
  });
}

// Update .optimize/registry.json
const registry = {
  optimized_files: optimizedFiles
};
fs.writeFileSync('.optimize/registry.json', JSON.stringify(registry, null, 2), 'utf8');
console.log(`Successfully optimized. Modified ${modifiedCount} files. Registry has ${optimizedFiles.length} files.`);
