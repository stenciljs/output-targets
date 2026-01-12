#!/usr/bin/env node
/* eslint-disable */
/* tslint:disable */
/**
 * Selector Patcher for transformTag support
 *
 * AUTO-GENERATED - DO NOT EDIT
 *
 * This script patches @Component selectors in the installed Angular component library
 * to match your runtime tag transformer. Run this as a postinstall script in your app.
 *
 * Usage Option 1 - Config file (recommended for complex transformers):
 * Create tag-transformer.config.mjs in your app root:
 *    export default (tag) => {
 *      if (tag.startsWith('my-transform-')) return `v1-${tag}`;
 *      // ... complex logic
 *      return tag;
 *    };
 *
 * Then in package.json:
 *    "scripts": {
 *      "postinstall": "patch-transform-selectors"
 *    }
 *
 * Usage Option 2 - CLI argument (for simple transformers):
 *    "scripts": {
 *      "postinstall": "patch-transform-selectors \"(tag) => tag.startsWith('my-transform-') ? \\`v1-\${tag}\\` : tag\""
 *    }
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Try to load transformer from config file or CLI argument
let TAG_TRANSFORMER;
let transformerArg;

// Option 1: Look for tag-transformer.config.mjs in the consuming app
const configPath = join(process.cwd(), 'tag-transformer.config.mjs');
if (existsSync(configPath)) {
  console.log('[TransformTag] Loading transformer from tag-transformer.config.mjs');
  try {
    const configUrl = pathToFileURL(configPath).href;
    const config = await import(configUrl);
    TAG_TRANSFORMER = config.default;

    if (typeof TAG_TRANSFORMER !== 'function') {
      throw new Error('Config file must export a default function');
    }

    // Store as string for injection later
    transformerArg = TAG_TRANSFORMER.toString();
    console.log('[TransformTag] Loaded transformer from config file');
  } catch (error) {
    console.error('[TransformTag] Error loading tag-transformer.config.mjs:', error.message);
    console.error('Make sure the file exports a default function.');
    process.exit(1);
  }
} else {
  // Option 2: Fall back to CLI argument
  transformerArg = process.argv[2];

  if (!transformerArg) {
    console.error('[TransformTag] Error: No transformer provided.');
    console.error('');
    console.error('Option 1 - Create tag-transformer.config.mjs in your app root:');
    console.error('  export default (tag) => tag.startsWith(\'my-\') ? `v1-${tag}` : tag;');
    console.error('');
    console.error('Option 2 - Pass transformer as CLI argument:');
    console.error('  patch-transform-selectors "(tag) => tag.startsWith(\'my-\') ? `v1-${tag}` : tag"');
    process.exit(1);
  }

  // Evaluate the transformer string to get the function
  try {
    TAG_TRANSFORMER = eval(transformerArg);
    if (typeof TAG_TRANSFORMER !== 'function') {
      throw new Error('Transformer must be a function');
    }
    console.log('[TransformTag] Using transformer from CLI argument');
  } catch (error) {
    console.error('[TransformTag] Error: Invalid transformer function:', error.message);
    console.error('The transformer must be a valid JavaScript function expression.');
    console.error('Example: "(tag) => tag.startsWith(\'my-\') ? `v1-${tag}` : tag"');
    process.exit(1);
  }
}

const TAG_MAPPINGS = {
  'my-button': 'MyButton',
  'my-button-scoped': 'MyButtonScoped',
  'my-checkbox': 'MyCheckbox',
  'my-complex-props': 'MyComplexProps',
  'my-complex-props-scoped': 'MyComplexPropsScoped',
  'my-component': 'MyComponent',
  'my-component-scoped': 'MyComponentScoped',
  'my-counter': 'MyCounter',
  'my-input': 'MyInput',
  'my-input-scoped': 'MyInputScoped',
  'my-list': 'MyList',
  'my-list-item': 'MyListItem',
  'my-list-item-scoped': 'MyListItemScoped',
  'my-list-scoped': 'MyListScoped',
  'my-popover': 'MyPopover',
  'my-radio': 'MyRadio',
  'my-radio-group': 'MyRadioGroup',
  'my-range': 'MyRange',
  'my-toggle': 'MyToggle',
  'my-toggle-content': 'MyToggleContent',
  'my-transform-test': 'MyTransformTest'
};

console.log('[TransformTag] Patching component selectors...');

try {
  // Find the bundled JavaScript file (could be fesm2022, fesm2015, fesm5, etc.)
  const parentDir = join(__dirname, '..');

  // Find all .js/.mjs files in fesm* directories AND fesm*.js/mjs files at root
  let bundlePaths = [];

  try {
    const entries = readdirSync(parentDir);
    for (const entry of entries) {
      const entryPath = join(parentDir, entry);
      let stat;
      try {
        stat = statSync(entryPath);
      } catch (e) {
        continue;
      }

      // Check for fesm* directories
      if (stat.isDirectory() && /^fesm/.test(entry)) {
        try {
          const fesmFiles = readdirSync(entryPath);
          for (const file of fesmFiles) {
            if (/\.m?js$/.test(file)) {
              bundlePaths.push(join(entryPath, file));
            }
          }
        } catch (e) {
          // Skip if can't read fesm directory
        }
      }
      // Check for fesm*.js or fesm*.mjs files at root
      else if (stat.isFile() && /^fesm.*\.m?js$/.test(entry)) {
        bundlePaths.push(entryPath);
      }
    }
  } catch (e) {
    console.error('[TransformTag] Could not read parent directory:', parentDir);
    process.exit(1);
  }

  if (bundlePaths.length === 0) {
    console.error('[TransformTag] Could not find any fesm* directories or files to patch.');
    process.exit(1);
  }

  console.log('[TransformTag] Found bundles:', bundlePaths);

  // Patch all bundled JavaScript files
  let totalPatchedCount = 0;

  for (const bundlePath of bundlePaths) {
    let bundleContent;
    try {
      bundleContent = readFileSync(bundlePath, 'utf8');
    } catch (e) {
      console.error('[TransformTag] Could not read bundle:', bundlePath);
      continue;
    }

    let patchedCount = 0;

    for (const [originalTag, pascalName] of Object.entries(TAG_MAPPINGS)) {
      const transformedTag = TAG_TRANSFORMER(originalTag);

      // Only patch if the tag is actually transformed
      if (transformedTag !== originalTag) {
        // Update selector from original tag name to transformed tag name
        // e.g., selector: 'my-transform-test' becomes selector: 'v1-my-transform-test'
        const selectorRegex = new RegExp(
          `(selector:\\s*)(['"\`])${originalTag}\\2`,
          'g'
        );

        const newContent = bundleContent.replace(
          selectorRegex,
          `$1'${transformedTag}'`
        );

        if (newContent !== bundleContent) {
          bundleContent = newContent;
          patchedCount++;
          console.log(`[TransformTag] Patched selector for ${originalTag} -> ${transformedTag}`);
        }
      }
    }

    // Inject setTagTransformer call with the user's transformer
    // Find the export statement and add the call before it
    const exportMatch = bundleContent.match(/export \{ setTagTransformer/);
    if (exportMatch && patchedCount > 0) {
      const transformerCode = `
// Auto-injected by patch-transform-selectors
// Call setTagTransformer with the user-provided transformer
import { setTagTransformer as stencilSetTagTransformer } from 'component-library/components/index.js';
stencilSetTagTransformer(${transformerArg});
`;
      bundleContent = transformerCode + bundleContent;
      console.log('[TransformTag] Injected setTagTransformer call into bundle');
    }

    // Write the patched bundle
    if (patchedCount > 0) {
      writeFileSync(bundlePath, bundleContent);
      totalPatchedCount += patchedCount;
      console.log(`[TransformTag] Successfully patched ${patchedCount} component selectors in ${bundlePath}`);
    }
  }

  // Find and patch all .d.ts files
  let totalTypePatchedCount = 0;

  function patchTypeDefsInDir(dir) {
    let files;
    try {
      files = readdirSync(dir);
    } catch (e) {
      return;
    }

    for (const file of files) {
      const filePath = join(dir, file);
      let stat;
      try {
        stat = statSync(filePath);
      } catch (e) {
        continue;
      }

      if (stat.isDirectory()) {
        patchTypeDefsInDir(filePath);
      } else if (file.endsWith('.d.ts')) {
        let typeDefsContent;
        try {
          typeDefsContent = readFileSync(filePath, 'utf8');
        } catch (e) {
          continue;
        }

        let modified = false;

        for (const [originalTag, pascalName] of Object.entries(TAG_MAPPINGS)) {
          const transformedTag = TAG_TRANSFORMER(originalTag);

          if (transformedTag !== originalTag) {
            // Update selector in type definitions - format: ɵɵComponentDeclaration<ClassName, "tag-name", ...>
            const typeDefRegex = new RegExp(
              `(ɵɵComponentDeclaration<${pascalName},\\s*)"(${originalTag})"`,
              'g'
            );

            const newTypeContent = typeDefsContent.replace(
              typeDefRegex,
              `$1"${transformedTag}"`
            );

            if (newTypeContent !== typeDefsContent) {
              typeDefsContent = newTypeContent;
              modified = true;
            }
          }
        }

        if (modified) {
          writeFileSync(filePath, typeDefsContent);
          totalTypePatchedCount++;
          console.log(`[TransformTag] Patched type definitions in: ${filePath}`);
        }
      }
    }
  }

  patchTypeDefsInDir(parentDir);

  if (totalTypePatchedCount > 0) {
    console.log(`[TransformTag] Successfully patched selectors in ${totalTypePatchedCount} type definition files.`);
  }

  if (totalPatchedCount === 0 && totalTypePatchedCount === 0) {
    console.log('[TransformTag] No selectors needed patching.');
  }
} catch (error) {
  console.error('[TransformTag] Error patching selectors:', error.message);
  console.error('Stack:', error.stack);
  process.exit(1);
}
