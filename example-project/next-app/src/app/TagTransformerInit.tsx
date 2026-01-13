'use client';

import { setTagTransformer } from 'component-library-react/tag-transform';
import transformer from '../../tag-transformer.js';

setTagTransformer(transformer);

export function TagTransformerInit() {
  return <></>;
}
