import { describe, it, expect } from 'vitest';
import { kebabToPascalCase, kebabToCamelCase, eventListenerName } from './string-utils.js';

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
});
