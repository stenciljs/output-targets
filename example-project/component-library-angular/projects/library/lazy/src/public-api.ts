/*
 * Public API Surface of library/lazy: the wrappers generated with `lazyDefine`.
 */

export * from './directives/proxies';
export * from './directives/boolean-value-accessor';
export * from './directives/number-value-accessor';
export * from './directives/radio-value-accessor';
export * from './directives/text-value-accessor';
export * from './directives/select-value-accessor';
export * from './directives/value-accessor';

// Re-export transformTag utilities from component-library, as the main entry point does
export { transformTag, setTagTransformer } from 'component-library';
