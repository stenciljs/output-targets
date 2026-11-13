import { describe, it, expect } from 'vitest';
import type { ComponentCompilerMeta } from '@stencil/core/internal';
import {
  eraseTypeParameters,
  eventListenerName,
  kebabToCamelCase,
  kebabToPascalCase,
  normalizeTypeString,
} from './string-utils.js';

describe('string-utils', () => {
  describe('kebabToPascalCase', () => {
    it('should convert kebab-case to PascalCase', () => {
      const result = kebabToPascalCase('my-component');
      expect(result).toEqual('MyComponent');
    });
  });

  describe('kebabToCamelCase', () => {
    it('should convert kebab-case to camelCase', () => {
      const result = kebabToCamelCase('my-component');
      expect(result).toEqual('myComponent');
    });
  });

  describe('eventListenerName', () => {
    it('should convert event name to event listener name', () => {
      expect(eventListenerName('my-event')).toEqual('onMyEvent');
      expect(eventListenerName('myevent')).toEqual('onMyevent');
      expect(eventListenerName('myEvent')).toEqual('onMyEvent');
      expect(eventListenerName('_myEvent')).toEqual('on_myEvent');
      expect(eventListenerName('my/event')).toEqual('onMyEvent');
    });
  });

  describe('normalizeTypeString', () => {
    it('should remove single-line comments', () => {
      const input = `{
    field: {};
    field2: {};
    // someCommentLikeTsIgnoreOrElse
    errorField: {};
  }`;
      expect(normalizeTypeString(input)).toEqual('{ field: {}; field2: {}; errorField: {}; }');
    });

    it('should collapse multiple spaces', () => {
      expect(normalizeTypeString('string    |    number')).toEqual('string | number');
    });

    it('should handle simple types unchanged', () => {
      expect(normalizeTypeString('string')).toEqual('string');
      expect(normalizeTypeString('ITreeNode | ITreeNode[]')).toEqual('ITreeNode | ITreeNode[]');
    });
  });
});

describe('eraseTypeParameters', () => {
  const component = { typeParameters: [{ name: 'T' }, { name: 'K' }] } as unknown as ComponentCompilerMeta;

  it('replaces type parameter references with any', () => {
    expect(eraseTypeParameters('T[]', component)).toEqual('any[]');
    expect(eraseTypeParameters('Map<K, T> | undefined', component)).toEqual('Map<any, any> | undefined');
    expect(eraseTypeParameters('(row: T) => void', component)).toEqual('(row: any) => void');
    expect(eraseTypeParameters('{ row: T; key?: K }', component)).toEqual('{ row: any; key?: any }');
    expect(eraseTypeParameters('T extends Row ? T : never', component)).toEqual('any extends Row ? any : never');
  });

  it('keeps other identifiers, string literals, qualified names and property keys', () => {
    expect(eraseTypeParameters('TT | MyT | T1', component)).toEqual('TT | MyT | T1');
    expect(eraseTypeParameters(`'T' | "K"`, component)).toEqual(`'T' | "K"`);
    expect(eraseTypeParameters('Foo.T', component)).toEqual('Foo.T');
    expect(eraseTypeParameters('{ T: string; readonly K?: T }', component)).toEqual('{ T: string; readonly K?: any }');
  });

  it('returns the type unchanged without type parameters', () => {
    expect(eraseTypeParameters('T[]', {} as ComponentCompilerMeta)).toEqual('T[]');
  });
});
