import type { ComponentCompilerMeta } from '@stencil/core/internal';

export const kebabToPascalCase = (str: string) =>
  str
    .toLowerCase()
    .split('-')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join('');

export const kebabToCamelCase = (str: string) => str.replace(/-([_a-z])/g, (_, letter) => letter.toUpperCase());

const slashesToCamelCase = (str: string) => str.replace(/\/([a-z])/g, (_, letter) => letter.toUpperCase());

export const eventListenerName = (eventName: string) => {
  const slashesConverted = slashesToCamelCase(eventName);
  return kebabToCamelCase(`on-${slashesConverted}`);
};

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

export interface ComponentTypeParameter {
  name: string;
  constraint?: string;
  default?: string;
  references?: Record<string, { location: string }>;
}

/**
 * The type parameters of a component class, e.g. `T` in `class MyTable<T> {}`.
 * Only Stencil versions that support generic components set them.
 */
export const getTypeParameters = (component: ComponentCompilerMeta): ComponentTypeParameter[] =>
  (component as { typeParameters?: ComponentTypeParameter[] }).typeParameters ?? [];

/**
 * Renders type parameters for a declaration (`<T extends Row = Row>`) and for a reference (`<T>`).
 * A parameter without a default gets `any`, like in `components.d.ts`, so every reference
 * without type arguments stays valid.
 */
export const formatTypeParameters = (typeParameters: readonly ComponentTypeParameter[]) => {
  if (typeParameters.length === 0) {
    return { declaration: '', usage: '' };
  }
  const declarations = typeParameters.map(({ name, constraint, default: defaultType }) => {
    const extendsClause = constraint ? ` extends ${normalizeTypeString(constraint)}` : '';
    return `${name}${extendsClause} = ${defaultType ? normalizeTypeString(defaultType) : 'any'}`;
  });
  return {
    declaration: `<${declarations.join(', ')}>`,
    usage: `<${typeParameters.map(({ name }) => name).join(', ')}>`,
  };
};

/**
 * Replaces the type parameters of a component class with `any`, for generated types that
 * don't declare them.
 */
export const eraseTypeParameters = (type: string, component: ComponentCompilerMeta): string =>
  getTypeParameters(component).reduce(
    (result, { name }) =>
      result.replace(
        // `Foo.T` is a different type, `...T` in a variadic tuple is the type parameter
        new RegExp(`(?<![\\w$'"\`]|(?<!\\.)\\.)${name.replace(/\$/g, '\\$')}(?![\\w$'"\`])`, 'g'),
        (match: string, offset: number) => (isPropertyKey(result, offset, match.length) ? match : 'any')
      ),
    type
  );

/**
 * Whether the identifier at `offset` is a property or parameter name, like `T` in `{ T: string }`.
 */
const isPropertyKey = (type: string, offset: number, length: number) =>
  /^\s*\??\s*:/.test(type.slice(offset + length)) && /([{;,(\[]|\breadonly)$/.test(type.slice(0, offset).trimEnd());
