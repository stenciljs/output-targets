import { setTagTransformer } from 'component-library-react/tag-transform'

setTagTransformer((tag) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag)

export function TagTransformerInit() {
  return <></>
}
