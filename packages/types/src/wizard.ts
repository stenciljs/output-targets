import type { StencilWizardPlugin, WizardContext } from '@stencil/cli';

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

    async run({ prompts, openStencilConfig }: WizardContext): Promise<void> {
      const { intro, outro, multiselect, isCancel, cancel, log } = prompts;

      intro('Types output target — framework-native TypeScript types');

      // Guard: already configured?
      const editor = await openStencilConfig();
      if (editor.outputTargetsContains('typesOutputTarget(')) {
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
        editor.addImport('@stencil/types-output-target', ['typesOutputTarget']);
        editor.addOutputTarget(targetCode);
        await editor.save();
        log.success('stencil.config.ts updated');
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
