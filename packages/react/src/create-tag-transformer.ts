/**
 * Returns the module specifier of the Stencil custom elements entry point, which exposes
 * runtime helpers such as `setAssetPath` and `setTagTransformer`.
 */
export const getStandaloneModule = ({
  stencilPackageName,
  customElementsDir,
  exportMaps,
}: {
  stencilPackageName: string;
  customElementsDir: string;
  /** Import through the package's `exports` map (`<pkg>/standalone`) instead of a deep path. */
  exportMaps?: boolean;
}) => (exportMaps ? `${stencilPackageName}/standalone` : `${stencilPackageName}/${customElementsDir}/index.js`);

export const createTagTransformer = ({
  stencilPackageName,
  customElementsDir,
  exportMaps,
}: {
  stencilPackageName: string;
  customElementsDir: string;
  /** Import through the package's `exports` map (`<pkg>/standalone`) instead of a deep path. */
  exportMaps?: boolean;
}) => {
  const standaloneModule = getStandaloneModule({ stencilPackageName, customElementsDir, exportMaps });
  return `/* eslint-disable */
/* tslint:disable */
import { setTagTransformer as clientSetTagTransformer } from '${standaloneModule}';

let tagTransformer: ((tagName: string) => string) | undefined;

export const setTagTransformer = (transformer: (tagName: string) => string) => {
  clientSetTagTransformer(transformer);
  tagTransformer = transformer;
};

export const transformTag = (tag: string): string => {
  return tagTransformer ? tagTransformer(tag) : tag;
};

export const getTagTransformer = () => tagTransformer;
`;
};
