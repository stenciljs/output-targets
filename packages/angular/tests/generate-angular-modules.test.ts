import { describe, it, expect } from 'vitest';
import { generateAngularModuleForComponent } from '../src/generate-angular-modules';

describe('generateAngularModuleForComponent()', () => {
  it('should generate an Angular module for each component', () => {
    const modules = generateAngularModuleForComponent('my-component');

    expect(modules).toEqual(`@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent]
})
export class MyComponentModule { }`);
  });
});
