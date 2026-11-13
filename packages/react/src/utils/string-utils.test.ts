import { describe, it, expect } from 'vitest';
import type { ComponentCompilerMeta } from '@stencil/core/internal';
import {
  eraseTypeParameters,
  eventListenerName,
  formatTypeParameters,
  getTypeParameters,
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

describe('formatTypeParameters', () => {
  it('renders the declaration and the usage', () => {
    expect(
      formatTypeParameters([
        { name: 'T', constraint: 'Row', default: 'Row' },
        { name: 'K', constraint: 'keyof T' },
        { name: 'U' },
      ])
    ).toEqual({ declaration: '<T extends Row = Row, K extends keyof T = any, U = any>', usage: '<T, K, U>' });
  });

  it('collapses multiline constraints', () => {
    expect(formatTypeParameters([{ name: 'T', constraint: '{\n  id: number;\n}' }]).declaration).toEqual(
      '<T extends { id: number; } = any>'
    );
  });

  it('renders nothing without type parameters', () => {
    expect(formatTypeParameters([])).toEqual({ declaration: '', usage: '' });
  });
});

describe('getTypeParameters', () => {
  it('falls back to an empty list for Stencil versions without type parameters', () => {
    expect(getTypeParameters({} as ComponentCompilerMeta)).toEqual([]);
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
    expect(eraseTypeParameters('[...T, number]', component)).toEqual('[...any, number]');
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
