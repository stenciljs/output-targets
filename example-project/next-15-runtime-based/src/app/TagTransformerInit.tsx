'use client';

import { setTagTransformer } from 'component-library-react/tag-transform';
import { transformer } from './tag-transformer';

setTagTransformer(transformer);

export function TagTransformerInit() {
  return <></>;
}
