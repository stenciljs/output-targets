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
