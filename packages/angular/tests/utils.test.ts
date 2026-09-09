import { describe, it, expect } from 'vitest';
import {
  createImportStatement,
  createComponentEventTypeImports,
  formatToQuotedList,
  isOutputTypeCustomElementsBuild,
} from '../src/utils';

describe('createImportStatement()', () => {
  it('should create an import statement', () => {
    const importStatement = createImportStatement(['Component'], '@angular/core');

    expect(importStatement).toEqual(`import { Component } from '@angular/core';`);
  });

  it('should create an import statement with multiple imports', () => {
    const importStatement = createImportStatement(['Component', 'NgModule'], '@angular/core');

    expect(importStatement).toEqual(`import { Component, NgModule } from '@angular/core';`);
  });

  it('should not create an import statement if no imports are provided', () => {
    const importStatement = createImportStatement([], '@angular/core');

    expect(importStatement).toEqual('');
  });
});

describe('createComponentEventTypeImports()', () => {
  let testEvents: any[] = [
    {
      complexType: {
        references: {
          MyEvent: {
            location: 'import',
          },
        },
      },
    },
    {
      complexType: {
        references: {
          MyOtherEvent: {
            location: 'import',
          },
        },
      },
    },
  ];

  describe('www output', () => {
    it('should create an import statement for each event', () => {
      const imports = createComponentEventTypeImports('MyComponent', testEvents, {
        componentCorePackage: '@ionic/core',
        outputType: 'component',
      });

      expect(imports).toEqual(
        `import type { MyComponentCustomEvent } from '@ionic/core';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core';`
      );
    });

    it('imports the per-component CustomEvent type once, before the detail types', () => {
      const imports = createComponentEventTypeImports('MyComponent', testEvents, {
        componentCorePackage: '@ionic/core',
        outputType: 'component',
      });

      const lines = imports.split('\n');
      // The per-component CustomEvent import is first so the event declarations can reference it.
      expect(lines[0]).toEqual(`import type { MyComponentCustomEvent } from '@ionic/core';`);
      // Only a single per-component CustomEvent import regardless of how many events exist.
      expect(lines.filter((line) => line.includes('MyComponentCustomEvent')).length).toEqual(1);
    });

    it('does not import the per-component CustomEvent type when there are no events', () => {
      const imports = createComponentEventTypeImports('MyComponent', [], {
        componentCorePackage: '@ionic/core',
        outputType: 'component',
      });

      expect(imports).toEqual('');
    });
  });

  describe('custom elements output', () => {
    describe('with custom elements dir', () => {
      it('should create an import statement for each event', () => {
        const scamImports = createComponentEventTypeImports('MyComponent', testEvents, {
          componentCorePackage: '@ionic/core',
          customElementsDir: 'custom-elements',
          outputType: 'scam',
        });

        const standaloneImports = createComponentEventTypeImports('MyComponent', testEvents, {
          componentCorePackage: '@ionic/core',
          customElementsDir: 'custom-elements',
          outputType: 'standalone',
        });

        expect(scamImports).toEqual(
          `import type { MyComponentCustomEvent } from '@ionic/core/custom-elements';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core/custom-elements';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core/custom-elements';`
        );
        expect(standaloneImports).toEqual(
          `import type { MyComponentCustomEvent } from '@ionic/core/custom-elements';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core/custom-elements';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core/custom-elements';`
        );
      });
    });
  });
});

describe('formatToQuotedList', () => {
  it('should format an array of strings', () => {
    expect(formatToQuotedList(['a', 'b', 'c'])).toEqual(`'a', 'b', 'c'`);
    expect(formatToQuotedList(['a'])).toEqual(`'a'`);
    expect(formatToQuotedList([])).toEqual('');
  });
});

describe('isOutputTypeCustomElementsBuild', () => {
  it('should return true if the output type is standalone or scam', () => {
    expect(isOutputTypeCustomElementsBuild('standalone')).toEqual(true);
    expect(isOutputTypeCustomElementsBuild('scam')).toEqual(true);
  });
  it('should return false if the output type is component', () => {
    expect(isOutputTypeCustomElementsBuild('component')).toEqual(false);
  });
});
