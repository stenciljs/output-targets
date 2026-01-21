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
