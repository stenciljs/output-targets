import { describe, it, expect } from 'vitest';
import type { ParsedStaticImport } from 'mlly';

import { mergeImports, cssPropertiesToString, serializeShadowComponent } from '../src/utils';

export const importDeclarations: ParsedStaticImport[] = [
    {
        type: 'static',
        imports: '{ Fragment, jsx, jsxs } ',
        specifier: 'react/jsx-runtime',
        code: 'import { Fragment, jsx, jsxs } from "react/jsx-runtime";\n',
        start: 0,
        end: 57,
        defaultImport: undefined,
        namespacedImport: undefined,
        namedImports: { Fragment: 'Fragment', jsx: 'jsx', jsxs: 'jsxs' }
    },
    {
        type: 'static',
        imports: 'dynamic ',
        specifier: 'next/dynamic',
        code: 'import dynamic from "next/dynamic";\n',
        start: 57,
        end: 93,
        defaultImport: 'dynamic',
        namespacedImport: undefined,
        namedImports: {}
    },
    {
        type: 'static',
        imports: '{ jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } ',
        specifier: 'react/jsx-runtime',
        code: 'import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";\n',
        start: 1283,
        end: 1370,
        defaultImport: undefined,
        namespacedImport: undefined,
        namedImports: { jsx: '_jsx', jsxs: '_jsxs', Fragment: '_Fragment' }
    },
    {
        type: 'static',
        imports: '{ useState } ',
        specifier: 'react',
        code: 'import { useState } from "react";\n',
        start: 1370,
        end: 1404,
        defaultImport: undefined,
        namespacedImport: undefined,
        namedImports: { useState: 'useState' }
    }
]

describe('mergeImports', () => {
    it('should merge imports', () => {
        expect(mergeImports(importDeclarations).map((imp) => imp.code).join('\n')).toMatchInlineSnapshot(`
          "import { Fragment, Fragment as _Fragment, jsx, jsx as _jsx, jsxs, jsxs as _jsxs } from "react/jsx-runtime";

          import dynamic from "next/dynamic";

          import { useState } from "react";
          "
        `);
    });
});

describe('cssPropertiesToString', () => {
    it('should convert a style object to a CSS string', () => {
        expect(cssPropertiesToString({ backgroundColor: 'red', color: 'blue' })).toMatchInlineSnapshot(`
          "background-color: red; color: blue;"
        `);
    });
});

describe('serializeShadowComponent', () => {
    it('should serialize components with shadowrootmode="open"', () => {
        expect(serializeShadowComponent(
            [
                '<my-component class="hydrated sc-my-component-h" first="John" kids-names="serialized:eyJ0eXBlIjoiYXJyYXkiLCJ2YWx1ZSI6W3sidHlwZSI6InN0cmluZyIsInZhbHVlIjoiSm9obiJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiSmFuZSJ9LHsidHlwZSI6InN0cmluZyIsInZhbHVlIjoiSmltIn1dfQ==" last="Doe" middle="William" s-id="9">',
                '  <template shadowrootmode="open">',
                '    <style sty-id="sc-my-component">',
                '      :host{display:block;color:green}',
                '    </style>',
                '    <div c-id="9.0.0.0" class="sc-my-component">',
                '      <!--t.9.1.1.0-->',
                "      Hello, World! I'm John undefined Doe",
                '    </div>',
                '  </template>',
                '  <!--r.9-->',
                '</my-component>',
            ],
            'MyComponent$0',
            undefined,
            'react',
        )).toMatchSnapshot();
    });

    it('should serialize components with shadowrootmode="open" and shadowrootdelegatesfocus', () => {
        expect(serializeShadowComponent(
            [          
                '<my-component-delegates-focus class="hydrated sc-my-component-delegates-focus-h" s-id="11">',
                '  <template shadowrootmode="open" shadowrootdelegatesfocus>',
                '    <style sty-id="sc-my-component-delegates-focus">',
                '      :host{display:block;color:green}',
                '    </style>',
                '    <div c-id="11.0.0.0" class="sc-my-component-delegates-focus">',
                '      <!--t.11.1.1.0-->',
                '      Hello, World!',
                '    </div>',
                '  </template>',
                '  <!--r.11-->',
                '</my-component-delegates-focus>',
            ],
            'MyComponentDelegatesFocus$2',
            undefined,
            'react',
        )).toMatchSnapshot();
    });
});