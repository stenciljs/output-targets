#!/usr/bin/env node

/**
 * Filters a CHANGELOG.md file to only include commits with a specific scope
 * Usage: node filter-changelog.js <scope> <changelog-file>
 */

const fs = require('fs');
const path = require('path');

const scope = process.argv[2];
const changelogFile = process.argv[3];

if (!scope || !changelogFile) {
  console.error('Usage: node filter-changelog.js <scope> <changelog-file>');
  process.exit(1);
}

try {
  const changelogPath = path.resolve(changelogFile);

  if (!fs.existsSync(changelogPath)) {
    console.log(`Changelog file not found: ${changelogPath}`);
    process.exit(0);
  }

  let content = fs.readFileSync(changelogPath, 'utf8');

  // Split content into lines
  const lines = content.split('\n');
  const filteredLines = [];
  let inSection = false;
  let currentSection = null;
  let sectionHasContent = false;
  let sectionBuffer = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Keep version headers (lines starting with ##)
    if (line.startsWith('## ')) {
      // Flush previous section if it had content
      if (sectionBuffer.length > 0 && sectionHasContent) {
        filteredLines.push(...sectionBuffer);
      }

      filteredLines.push(line);
      sectionBuffer = [];
      sectionHasContent = false;
      inSection = false;
      continue;
    }

    // Keep section headers (### Enhancement, ### Bug Fix, etc.)
    if (line.startsWith('### ')) {
      // Flush previous section if it had content
      if (sectionBuffer.length > 0 && sectionHasContent) {
        filteredLines.push(...sectionBuffer);
      }

      currentSection = line;
      sectionBuffer = [line];
      sectionHasContent = false;
      inSection = true;
      continue;
    }

    // Check bullet points for scope
    if (inSection && line.trim().startsWith('*')) {
      // Extract scope from commit message
      // Format: * **scope:** message
      const scopeMatch = line.match(/\*\s+\*\*([^:]+):\*\*/);

      if (scopeMatch) {
        const commitScope = scopeMatch[1];

        // Only include if scope matches
        if (commitScope === scope) {
          sectionBuffer.push(line);
          sectionHasContent = true;
        }
      } else {
        // No scope in commit (might be a generic commit)
        // Include it to be safe
        sectionBuffer.push(line);
        sectionHasContent = true;
      }
    } else if (inSection) {
      // Keep other lines within sections (like commit body continuation)
      sectionBuffer.push(line);
    } else {
      // Keep lines outside of sections (blank lines, etc.)
      filteredLines.push(line);
    }
  }

  // Flush last section if it had content
  if (sectionBuffer.length > 0 && sectionHasContent) {
    filteredLines.push(...sectionBuffer);
  }

  // Write filtered content back
  const filteredContent = filteredLines.join('\n');
  fs.writeFileSync(changelogPath, filteredContent, 'utf8');

  console.log(`✅ Filtered changelog for scope: ${scope}`);
} catch (error) {
  console.error(`Error filtering changelog: ${error.message}`);
  process.exit(1);
}
