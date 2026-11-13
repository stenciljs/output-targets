import type { ComponentCompilerMeta } from '@stencil/core/internal';

export const kebabToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

/**
 * Normalizes a type string by removing single-line comments and collapsing whitespace.
 * This is necessary because multiline types with comments would break when collapsed to a single line.
 */
export const normalizeTypeString = (type: string) =>
  type
    .replace(/\/\/.*$/gm, '') // Remove single-line comments
    .replace(/\n/g, ' ') // Replace newlines with spaces
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
    .trim();

/**
 * Replaces the type parameters of a component class (e.g. `T` in `class MyTable<T> {}`) with `any`.
 * Prop and event types are copied as written in the component, but the generated file
 * doesn't declare the class's type parameters.
 *
 * `typeParameters` is only set by Stencil versions that support generic components.
 */
export const eraseTypeParameters = (type: string, component: ComponentCompilerMeta): string => {
  const typeParameters = (component as { typeParameters?: { name: string }[] }).typeParameters ?? [];
  return typeParameters.reduce(
    (result, { name }) =>
      result.replace(
        // `Foo.T` is a different type, `...T` in a variadic tuple is the type parameter
        new RegExp(`(?<![\\w$'"\`]|(?<!\\.)\\.)${name.replace(/\$/g, '\\$')}(?![\\w$'"\`])`, 'g'),
        (match: string, offset: number) => (isPropertyKey(result, offset, match.length) ? match : 'any')
      ),
    type
  );
};

/**
 * Whether the identifier at `offset` is a property or parameter name, like `T` in `{ T: string }`.
 */
const isPropertyKey = (type: string, offset: number, length: number) =>
  /^\s*\??\s*:/.test(type.slice(offset + length)) && /([{;,(\[]|\breadonly)$/.test(type.slice(0, offset).trimEnd());
