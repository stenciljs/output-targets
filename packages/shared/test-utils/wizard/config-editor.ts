import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import * as ts from 'typescript';

/**
 * Fakes the StencilConfigEditor that the real @stencil/cli passes into
 * WizardContext.openStencilConfig — it's not part of @stencil/cli's public API
 * (the real implementation lives inside the CLI and is only ever handed to a
 * wizard's `run()` at runtime), so wizard tests reimplement the subset of its
 * TS-AST-based text editing that the wizard.ts files under test actually call:
 * addImport, outputTargetsContains, addOutputTarget, replaceOutputTarget, save.
 */
function createConfigEditor(configPath: string, initialText: string) {
  let text = initialText;
  const parse = () => ts.createSourceFile(configPath, text, ts.ScriptTarget.Latest, true);

  function findArray(sf: ts.SourceFile, propName: string): ts.ArrayLiteralExpression | undefined {
    let found: ts.ArrayLiteralExpression | undefined;
    const visit = (node: ts.Node) => {
      if (
        !found &&
        ts.isPropertyAssignment(node) &&
        ts.isIdentifier(node.name) &&
        node.name.text === propName &&
        ts.isArrayLiteralExpression(node.initializer)
      ) {
        found = node.initializer;
      } else {
        ts.forEachChild(node, visit);
      }
    };
    visit(sf);
    return found;
  }

  function findConfigObject(sf: ts.SourceFile): ts.ObjectLiteralExpression | undefined {
    for (const stmt of sf.statements) {
      if (!ts.isVariableStatement(stmt)) continue;
      for (const decl of stmt.declarationList.declarations) {
        if (
          ts.isIdentifier(decl.name) &&
          decl.name.text === 'config' &&
          decl.initializer &&
          ts.isObjectLiteralExpression(decl.initializer)
        ) {
          return decl.initializer;
        }
      }
    }
    return undefined;
  }

  function appendToArray(arr: ts.ArrayLiteralExpression, code: string): void {
    if (arr.elements.length === 0) {
      const insertPos = arr.getEnd() - 1;
      text = text.slice(0, insertPos) + code + text.slice(insertPos);
      return;
    }
    let insertPos = arr.elements[arr.elements.length - 1].getEnd();
    const trailingComma = text.slice(insertPos).match(/^\s*,/);
    if (trailingComma) insertPos += trailingComma[0].length;
    const firstElemStart = arr.elements[0].getStart();
    if (text.slice(arr.getStart(), firstElemStart).includes('\n')) {
      const lineStart = text.lastIndexOf('\n', firstElemStart) + 1;
      const indent = text.slice(lineStart, firstElemStart).match(/^\s+/)?.[0] ?? '  ';
      text = `${text.slice(0, insertPos)},\n${indent}${code}${text.slice(insertPos)}`;
    } else {
      text = `${text.slice(0, insertPos)}, ${code}${text.slice(insertPos)}`;
    }
  }

  function addArrayProp(sf: ts.SourceFile, propName: string, code: string): void {
    const configObj = findConfigObject(sf);
    if (!configObj) throw new Error('Could not find Stencil config object in stencil.config.ts');
    let propIndent = '  ';
    if (configObj.properties.length > 0) {
      const firstPropStart = configObj.properties[0].getStart();
      const lineStart = text.lastIndexOf('\n', firstPropStart) + 1;
      propIndent = text.slice(lineStart, firstPropStart).match(/^\s+/)?.[0] ?? '  ';
    }
    const newProp = `${propName}: [\n${propIndent + '  '}${code},\n${propIndent}]`;
    const lastProp = configObj.properties[configObj.properties.length - 1];
    if (lastProp) {
      let insertPos = lastProp.getEnd();
      const trailingComma = text.slice(insertPos).match(/^\s*,/);
      if (trailingComma) insertPos += trailingComma[0].length;
      text = `${text.slice(0, insertPos)},\n${propIndent}${newProp}${text.slice(insertPos)}`;
    } else {
      const insertPos = configObj.getEnd() - 1;
      text = `${text.slice(0, insertPos)}\n${propIndent}${newProp},\n${text.slice(insertPos)}`;
    }
  }

  return {
    addImport(moduleSpecifier: string, namedImports: string[]) {
      const sf = parse();
      const hasImport = sf.statements.some(
        (s) => ts.isImportDeclaration(s) && ts.isStringLiteral(s.moduleSpecifier) && s.moduleSpecifier.text === moduleSpecifier
      );
      if (hasImport) return;
      let insertPos = 0;
      for (const s of sf.statements) if (ts.isImportDeclaration(s)) insertPos = s.getEnd();
      const decl = `\nimport { ${namedImports.join(', ')} } from '${moduleSpecifier}';`;
      text = insertPos > 0 ? text.slice(0, insertPos) + decl + text.slice(insertPos) : decl + '\n' + text;
    },
    outputTargetsContains(substring: string) {
      const arr = findArray(parse(), 'outputTargets');
      return arr ? text.slice(arr.getStart(), arr.getEnd()).includes(substring) : false;
    },
    addOutputTarget(expression: string) {
      const sf = parse();
      const arr = findArray(sf, 'outputTargets');
      if (arr) appendToArray(arr, expression);
      else addArrayProp(sf, 'outputTargets', expression);
    },
    replaceOutputTarget(substring: string, expression: string) {
      const arr = findArray(parse(), 'outputTargets');
      if (!arr) return false;
      for (const element of arr.elements) {
        if (text.slice(element.getStart(), element.getEnd()).includes(substring)) {
          text = text.slice(0, element.getStart()) + expression + text.slice(element.getEnd());
          return true;
        }
      }
      return false;
    },
    async save() {
      await writeFile(configPath, text, 'utf8');
    },
  };
}

/**
 * Returns a `WizardContext.openStencilConfig`-shaped function for a test's
 * `ctx` object, reading `stencil.config.ts` from `rootDir` lazily (same
 * timing as the real CLI, which opens it inside the wizard's `run()`).
 */
export function makeOpenStencilConfig(rootDir: string) {
  return async () => {
    const configPath = join(rootDir, 'stencil.config.ts');
    return createConfigEditor(configPath, await readFile(configPath, 'utf8'));
  };
}
