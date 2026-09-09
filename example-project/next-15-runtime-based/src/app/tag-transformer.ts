export const transformer = (tag: string) => tag.startsWith('my-transform-') ? `v1-${tag}` : tag
