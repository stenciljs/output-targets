import { describe, it, expect } from 'vitest';
import type { ParsedStaticImport } from 'mlly';

import { mergeImports } from '../src/utils';

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