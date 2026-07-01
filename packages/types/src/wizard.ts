import type { StencilWizardPlugin, WizardContext } from '@stencil/cli';
import { Project, SyntaxKind } from 'ts-morph';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

// ---------------------------------------------------------------------------
// ts-morph helpers
// ---------------------------------------------------------------------------

function addOutputTargetToConfig(
  configPath: string,
  moduleSpecifier: string,
  namedImport: string,
  targetCode: string
): boolean {
  const project = new Project({ skipAddingFilesFromTsConfig: true });
  const src = project.addSourceFileAtPath(configPath);

  if (!src.getImportDeclaration(moduleSpecifier)) {
    src.addImportDeclaration({ moduleSpecifier, namedImports: [namedImport] });
  }

  let prop = src.getDescendantsOfKind(SyntaxKind.PropertyAssignment).find((p) => p.getName() === 'outputTargets');

  if (!prop) {
    const configObj =
      src.getVariableDeclaration('config')?.getInitializerIfKind(SyntaxKind.ObjectLiteralExpression) ??
      src
        .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
        .find((obj) => obj.getProperty('namespace') !== undefined);
    if (!configObj) throw new Error('Could not find Stencil config object in stencil.config.ts');
    configObj.addPropertyAssignment({
      name: 'outputTargets',
      initializer: `[\n    ${targetCode},\n  ]`,
    });
    src.formatText();
    src.saveSync();
    return true;
  }

  const arr = prop.getInitializerIfKind(SyntaxKind.ArrayLiteralExpression);
  if (!arr) throw new Error('outputTargets is not an array literal in stencil.config.ts');

  if (arr.getText().includes(namedImport + '(')) return false;

  arr.addElement(targetCode);
  src.saveSync();
  return true;
}

// ---------------------------------------------------------------------------
// Wizard
// ---------------------------------------------------------------------------

type Framework = 'react' | 'vue' | 'svelte' | 'solid' | 'preact';

const FRAMEWORK_OPTIONS: Array<{ value: Framework; label: string; hint: string }> = [
  { value: 'react', label: 'React', hint: 'react-native-types.d.ts' },
  { value: 'vue', label: 'Vue', hint: 'vue-native-types.d.ts' },
  { value: 'svelte', label: 'Svelte', hint: 'svelte-native-types.d.ts' },
  { value: 'solid', label: 'Solid', hint: 'solid-native-types.d.ts' },
  { value: 'preact', label: 'Preact', hint: 'preact-native-types.d.ts' },
];

const CONFIG_KEY: Record<Framework, string> = {
  react: 'reactTypesPath',
  vue: 'vueTypesPath',
  svelte: 'svelteTypesPath',
  solid: 'solidTypesPath',
  preact: 'preactTypesPath',
};

export const wizard = {
  init: {
    id: '@stencil/types-output-target',
    displayName: 'Types',
    description: 'Framework-native TypeScript types (React, Vue, Svelte, Solid, Preact)',

    async run({ config, prompts }: WizardContext): Promise<void> {
      const { intro, outro, multiselect, isCancel, cancel, log } = prompts;

      intro('Types output target — framework-native TypeScript types');

      const stencilConfigPath = join(config.rootDir, 'stencil.config.ts');

      // Guard: already configured?
      const existingText = await readFile(stencilConfigPath, 'utf8').catch(() => '');
      if (existingText.includes('typesOutputTarget(')) {
        log.info('typesOutputTarget is already configured in stencil.config.ts');
        outro('Already configured');
        return;
      }

      const selected = await multiselect<Framework>({
        message: 'Generate framework-native types for which frameworks?',
        options: FRAMEWORK_OPTIONS,
      });
      if (isCancel(selected)) {
        cancel('Setup cancelled.');
        return;
      }

      // All type files land in dist/types/ alongside the component dist outputs
      const typesDir = 'dist/types';
      const entries = (selected as Framework[]).map((fw) => `${CONFIG_KEY[fw]}: '${typesDir}'`);
      const targetCode = `typesOutputTarget({\n  ${entries.join(',\n  ')},\n})`;

      try {
        const added = addOutputTargetToConfig(
          stencilConfigPath,
          '@stencil/types-output-target',
          'typesOutputTarget',
          targetCode
        );
        log.success(added ? 'stencil.config.ts updated' : 'typesOutputTarget already present — no changes made');
      } catch (e) {
        log.warn(
          `Could not automatically update stencil.config.ts (${e}). Add manually:\n\n` +
            `import { typesOutputTarget } from '@stencil/types-output-target';\n` +
            `// in outputTargets:\n${targetCode}`
        );
      }

      outro('Types output target configured');
    },
  },
} satisfies StencilWizardPlugin;
