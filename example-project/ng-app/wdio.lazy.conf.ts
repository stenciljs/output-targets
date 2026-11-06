/// <reference types="@wdio/globals/types" />

/** Runs the e2e tests against the `lazy` build configuration: the wrappers generated with `lazyDefine`. */
process.env.NG_CONFIGURATION = 'lazy';

export { config } from './wdio.conf';
