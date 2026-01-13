export const createTagTransformer = ({
  stencilPackageName,
  customElementsDir,
}: {
  stencilPackageName: string;
  customElementsDir: string;
}) => {
  return `import { setTagTransformer as clientSetTagTransformer } from '${stencilPackageName}/${customElementsDir}/index.js';

let tagTransformer: ((tagName: string) => string) | undefined;

export const setTagTransformer = (transformer: (tagName: string) => string) => {
  clientSetTagTransformer(transformer);
  tagTransformer = transformer;
};

export const transformTag = (tag: string): string => {
  return tagTransformer ? tagTransformer(tag) : tag;
}

export const getTagTransformer = () => tagTransformer;
`;
};
