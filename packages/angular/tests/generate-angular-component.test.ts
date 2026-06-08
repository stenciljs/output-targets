import { describe, it, expect } from 'vitest';
import type { ComponentCompilerProperty, ComponentCompilerEvent } from '@stencil/core/internal';
import { createComponentTypeDefinition, createAngularComponentDefinition } from '../src/generate-angular-component';

const createMockEvent = (name: string, type: string = 'any'): ComponentCompilerEvent => ({
  name,
  method: name,
  bubbles: true,
  cancelable: true,
  composed: true,
  docs: { text: '', tags: [] },
  complexType: {
    original: type,
    resolved: type,
    references: {}
  },
  internal: false
});

describe('createAngularComponentDefinition()', () => {
  describe('www output', () => {
    it('generates a component', () => {
      const component = createAngularComponentDefinition('my-component', [], [], false, false, [], []);

      expect(component).toEqual(`@ProxyCmp({
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with inputs', () => {
      const component = createAngularComponentDefinition('my-component', [{name: 'my-input', required: false}, {name: 'my-other-input', required: false}], [], false, false, [], []);
      expect(component).toMatch(`@ProxyCmp({
  inputs: ['my-input', 'my-other-input']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['my-input', 'my-other-input'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with inputs (required)', () => {
      const component = createAngularComponentDefinition('my-component', [{name: 'my-input', required: false}, {name: 'my-other-input', required: true}], [], false, false, [], []);
      expect(component).toMatch(`@ProxyCmp({
  inputs: ['my-input', 'my-other-input']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['my-input', { name: 'my-other-input', required: true }],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with outputs', () => {
      const mockEvents = [
        createMockEvent('my-output'),
        createMockEvent('my-other-output')
      ];

      const component = createAngularComponentDefinition(
        'my-component',
        [],
        [],
        false,
        false,
        [],
        mockEvents
      );

      expect(component).toMatch(`@ProxyCmp({
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  outputs: ['my-output', 'my-other-output'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  @Output() myOutput = new EventEmitter<MyComponentCustomEvent<any>>();
  @Output() myOtherOutput = new EventEmitter<MyComponentCustomEvent<any>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with methods', () => {
      const component = createAngularComponentDefinition('my-component', [], ['myMethod', 'myOtherMethod'], false, false, [], []);

      expect(component).toMatch(`@ProxyCmp({
  methods: ['myMethod', 'myOtherMethod']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });
  });

  describe('custom elements output', () => {
    it('generates a component', () => {
      const component = createAngularComponentDefinition('my-component', [], [], true, false, [], []);

      expect(component).toEqual(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with inputs', () => {
      const component = createAngularComponentDefinition('my-component', [{name: 'my-input', required: false}, {name: 'my-other-input', required: false}], [], true, false, [], []);

      expect(component).toEqual(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent,
  inputs: ['my-input', 'my-other-input']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['my-input', 'my-other-input'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with inputs (required)', () => {
      const component = createAngularComponentDefinition('my-component', [{name: 'my-input', required: true}, {name: 'my-other-input', required: false}], [], true, false, [], []);

      expect(component).toEqual(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent,
  inputs: ['my-input', 'my-other-input']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [{ name: 'my-input', required: true }, 'my-other-input'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with outputs', () => {
      const mockEvents = [
        createMockEvent('my-output'),
        createMockEvent('my-other-output')
      ];

      const component = createAngularComponentDefinition(
        'my-component',
        [],
        [],
        true,
        false,
        [],
        mockEvents
      );
      expect(component).toMatch(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  outputs: ['my-output', 'my-other-output'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  @Output() myOutput = new EventEmitter<MyComponentCustomEvent<any>>();
  @Output() myOtherOutput = new EventEmitter<MyComponentCustomEvent<any>>();
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a component with methods', () => {
      const component = createAngularComponentDefinition('my-component', [], ['myMethod', 'myOtherMethod'], true, false, [], []);

      expect(component).toMatch(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent,
  methods: ['myMethod', 'myOtherMethod']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });

    it('generates a standalone component', () => {
      const component = createAngularComponentDefinition('my-component', [], [], true, true, [], []);

      expect(component).toEqual(`@ProxyCmp({
  defineCustomElementFn: defineMyComponent
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: [],
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });
  });
  describe('inline members', () => {
    it('generates component with inlined member with jsDoc', () => {
      const component = createAngularComponentDefinition('my-component', [{name: 'myMember', required: false}], [], false, false, [
        {
          docs: {
            tags: [{ name: 'deprecated', text: 'use v2 of this API' }],
            text: 'This is a jsDoc for myMember',
          },
          name: 'myMember',
        } as ComponentCompilerProperty,
      ]);
      expect(component).toEqual(`@ProxyCmp({
  inputs: ['myMember']
})
@Component({
  selector: 'my-component',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '<ng-content></ng-content>',
  // eslint-disable-next-line @angular-eslint/no-inputs-metadata-property
  inputs: ['myMember'],
  standalone: false
})
export class MyComponent {
  protected el: HTMLMyComponentElement;
    /**
   * This is a jsDoc for myMember @deprecated use v2 of this API
   */
  set myMember(_: Components.MyComponent['myMember']) {};
  constructor(c: ChangeDetectorRef, r: ElementRef, protected z: NgZone) {
    c.detach();
    this.el = r.nativeElement;
  }
}`);
    });
  });
});

describe('createComponentTypeDefinition()', () => {
  let testEvents: any[] = [
    {
      name: 'myEvent',
      complexType: {
        references: {
          MyEvent: {
            location: 'import',
          },
        },
        original: 'MyEvent',
        resolved: 'MyEvent',
      },
      docs: {
        text: 'This is an example event.',
        tags: [
          {
            text: 'Bar',
            name: 'Foo',
          },
        ],
      },
    },
    {
      name: 'myOtherEvent',
      complexType: {
        references: {
          MyOtherEvent: {
            location: 'import',
          },
        },
        original: 'MyOtherEvent',
      },
      docs: {
        text: 'This is the other event.',
        tags: [],
      },
    },
    {
      name: 'myDoclessEvent',
      complexType: {
        references: {
          MyDoclessEvent: {
            location: 'import',
          },
        },
        original: 'MyDoclessEvent',
      },
      docs: {
        text: '',
        tags: [],
      },
    },
    {
      name: 'my-kebab-event',
      complexType: {
        references: {
          MyKebabEvent: {
            location: 'import',
          },
        },
        original: 'MyKebabEvent',
      },
      docs: {
        text: '',
        tags: [],
      },
    },
    {
      name: 'my/slash/event',
      complexType: {
        references: {
          MySlashEvent: {
            location: 'import',
          },
        },
        original: 'MySlashEvent',
      },
      docs: {
        text: '',
        tags: [],
      },
    },
    {
      name: 'myCustomEvent',
      method: 'myCustomEvent',
      bubbles: true,
      cancelable: true,
      composed: true,
      docs: { tags: [], text: 'Testing an event type with a dot signature' },
      complexType: {
        original: 'IMyComponent.someVar',
        resolved: 'number',
        references: {
          IMyComponent: {
            location: 'import',
            path: '../helpers',
            id: 'src/components/helpers.ts::IMyComponent'
          }
        }
      },
      internal: false
    },
    {
      name: 'myCustomNestedEvent',
      method: 'myCustomNestedEvent',
      bubbles: true,
      cancelable: true,
      composed: true,
      docs: { tags: [], text: 'Testing with nested namespaces' },
      complexType: {
        original: 'IMyComponent.SomeMoreComplexType.SubType',
        resolved: 'string',
        references: {
          IMyComponent: {
            location: 'import',
            path: '../helpers',
            id: 'src/components/helpers.ts::IMyComponent'
          }
        }
      },
      internal: false
    }
  ];

  describe('www build', () => {
    it('creates a type definition', () => {
      const definition = createComponentTypeDefinition('component', 'MyComponent', testEvents, '@ionic/core');

      expect(definition).toEqual(
        `import type { MyComponentCustomEvent } from '@ionic/core';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core';
import type { MyDoclessEvent as IMyComponentMyDoclessEvent } from '@ionic/core';
import type { MyKebabEvent as IMyComponentMyKebabEvent } from '@ionic/core';
import type { MySlashEvent as IMyComponentMySlashEvent } from '@ionic/core';
import type { IMyComponent as IMyComponentIMyComponent } from '@ionic/core';

export declare interface MyComponent extends Components.MyComponent {
  /**
   * This is an example event. @Foo Bar
   */
  myEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyEvent>>;
  /**
   * This is the other event.
   */
  myOtherEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyOtherEvent>>;

  myDoclessEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyDoclessEvent>>;

  'my-kebab-event': EventEmitter<MyComponentCustomEvent<IMyComponentMyKebabEvent>>;

  'my/slash/event': EventEmitter<MyComponentCustomEvent<IMyComponentMySlashEvent>>;
  /**
   * Testing an event type with a dot signature
   */
  myCustomEvent: EventEmitter<MyComponentCustomEvent<IMyComponentIMyComponent.someVar>>;
  /**
   * Testing with nested namespaces
   */
  myCustomNestedEvent: EventEmitter<MyComponentCustomEvent<IMyComponentIMyComponent.SomeMoreComplexType.SubType>>;
}`
      );
    });

    it('correctly handles union types with arrays', () => {
      // Regression test: array types like ITreeNode[] were being converted to [object Object][]
      const definition = createComponentTypeDefinition(
        'component',
        'ExampleInput',
        [
          {
            name: 'exampleFocus',
            method: 'exampleFocus',
            bubbles: true,
            cancelable: true,
            composed: true,
            docs: {
              tags: [],
              text: 'Emitted when the input receives focus',
            },
            complexType: {
              original: 'ITreeNode | ITreeNode[]',
              resolved: 'ITreeNode | ITreeNode[]',
              references: {
                ITreeNode: {
                  location: 'local',
                  path: './example-input',
                  id: 'src/components/example-input/example-input.tsx::ITreeNode',
                } as any,
              },
            },
            internal: false,
          },
        ],
        '@example/stencil-lib'
      );

      expect(definition).toEqual(
        `import type { ExampleInputCustomEvent } from '@example/stencil-lib';
import type { ITreeNode as IExampleInputITreeNode } from '@example/stencil-lib';

export declare interface ExampleInput extends Components.ExampleInput {
  /**
   * Emitted when the input receives focus
   */
  exampleFocus: EventEmitter<ExampleInputCustomEvent<IExampleInputITreeNode | IExampleInputITreeNode[]>>;
}`
      );
    });

    it('strips single-line comments from inline types', () => {
      // Regression test: inline types with comments would break when collapsed to single line
      const definition = createComponentTypeDefinition(
        'component',
        'ExampleInput',
        [
          {
            name: 'exampleFocus',
            method: 'exampleFocus',
            bubbles: true,
            cancelable: true,
            composed: true,
            docs: {
              tags: [],
              text: 'Emitted when the input receives focus',
            },
            complexType: {
              original: `{
    field: {};
    field2: {};
    // someCommentLikeTsIgnoreOrElse
    errorField: {};
  }`,
              resolved: '{ field: {}; field2: {}; errorField: {}; }',
              references: {},
            },
            internal: false,
          },
        ],
        '@example/stencil-lib'
      );

      expect(definition).toEqual(
        `import type { ExampleInputCustomEvent } from '@example/stencil-lib';

export declare interface ExampleInput extends Components.ExampleInput {
  /**
   * Emitted when the input receives focus
   */
  exampleFocus: EventEmitter<ExampleInputCustomEvent<{ field: {}; field2: {}; errorField: {}; }>>;
}`
      );
    });

    it('rewrites complex nested generic types within custom events', () => {
      // Issue: https://github.com/stenciljs/output-targets/issues/369
      const definition = createComponentTypeDefinition(
        'component',
        'MyComponent',
        [
          {
            name: 'myChange',
            method: 'myChange',
            bubbles: true,
            cancelable: true,
            composed: true,
            docs: {
              tags: [],
              text: '',
            },
            complexType: {
              original: 'MyEvent<Currency>',
              resolved: 'MyEvent<Currency>',
              references: {
                MyEvent: {
                  location: 'import',
                  path: '../../types/MyEvent',
                  // Stencil v4.0.3+ only
                  id: 'src/types/MyEvent.ts::MyEvent',
                } as any,
                Currency: {
                  location: 'import',
                  path: '../../types/Currency',
                  // Stencil v4.0.3+ only
                  id: 'src/types/Currency.ts::Currency',
                } as any,
              },
            },
            internal: false,
          },
          {
            name: 'mySwipe',
            method: 'mySwipe',
            bubbles: true,
            cancelable: true,
            composed: true,
            docs: {
              tags: [],
              text: '',
            },
            complexType: {
              original: '{ side: Side }',
              resolved: '{ side: Side; }',
              references: {
                Side: {
                  id: '',
                  location: 'import',
                  path: '../../interfaces',
                },
              },
            },
            internal: false,
          },
        ],
        '@ionic/core'
      );

      expect(definition).toEqual(
        `import type { MyComponentCustomEvent } from '@ionic/core';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core';
import type { Currency as IMyComponentCurrency } from '@ionic/core';
import type { Side as IMyComponentSide } from '@ionic/core';

export declare interface MyComponent extends Components.MyComponent {

  myChange: EventEmitter<MyComponentCustomEvent<IMyComponentMyEvent<IMyComponentCurrency>>>;

  mySwipe: EventEmitter<MyComponentCustomEvent<{ side: IMyComponentSide }>>;
}`
      );
    });
  });

  describe('custom elements output', () => {
    describe('with a custom elements directory provided', () => {
      it('creates a type definition', () => {
        const definition = createComponentTypeDefinition(
          'standalone',
          'MyComponent',
          testEvents,
          '@ionic/core',
          'custom-elements'
        );

        expect(definition).toEqual(
          `import type { MyComponentCustomEvent } from '@ionic/core/custom-elements';
import type { MyEvent as IMyComponentMyEvent } from '@ionic/core/custom-elements';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core/custom-elements';
import type { MyDoclessEvent as IMyComponentMyDoclessEvent } from '@ionic/core/custom-elements';
import type { MyKebabEvent as IMyComponentMyKebabEvent } from '@ionic/core/custom-elements';
import type { MySlashEvent as IMyComponentMySlashEvent } from '@ionic/core/custom-elements';
import type { IMyComponent as IMyComponentIMyComponent } from '@ionic/core/custom-elements';

export declare interface MyComponent extends Components.MyComponent {
  /**
   * This is an example event. @Foo Bar
   */
  myEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyEvent>>;
  /**
   * This is the other event.
   */
  myOtherEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyOtherEvent>>;

  myDoclessEvent: EventEmitter<MyComponentCustomEvent<IMyComponentMyDoclessEvent>>;

  'my-kebab-event': EventEmitter<MyComponentCustomEvent<IMyComponentMyKebabEvent>>;

  'my/slash/event': EventEmitter<MyComponentCustomEvent<IMyComponentMySlashEvent>>;
  /**
   * Testing an event type with a dot signature
   */
  myCustomEvent: EventEmitter<MyComponentCustomEvent<IMyComponentIMyComponent.someVar>>;
  /**
   * Testing with nested namespaces
   */
  myCustomNestedEvent: EventEmitter<MyComponentCustomEvent<IMyComponentIMyComponent.SomeMoreComplexType.SubType>>;
}`
        );
      });
    });
  });

  /**
   * Regression coverage for typing every event with the per-component
   * `${Component}CustomEvent` type instead of the generic `CustomEvent`.
   *
   * The generic `CustomEvent<T>` has `target: EventTarget | null`, so a handler
   * declared with the narrow `MyComponentCustomEvent` (whose `target` is the
   * concrete element) is not assignable under Angular strict template type
   * checking. Stencil generates the per-component type and narrows `target` to
   * the element, so the proxy must reference it for `$event.target` to type to
   * the element without a cast.
   *
   * Mirrors the React output target fix in
   * https://github.com/stenciljs/output-targets/pull/716 (issue #531).
   */
  describe('per-component CustomEvent type (narrow event target)', () => {
    const primitiveEvent: any = {
      name: 'myToggle',
      method: 'myToggle',
      bubbles: true,
      cancelable: true,
      composed: true,
      docs: { text: '', tags: [] },
      // No type references: the detail is a primitive (`void`), which is the
      // case the React target used to fall back to the generic `CustomEvent` for.
      complexType: { original: 'void', resolved: 'void', references: {} },
      internal: false,
    };

    it('uses the per-component type for events with a primitive detail and no references', () => {
      const definition = createComponentTypeDefinition('component', 'MyComponent', [primitiveEvent], '@ionic/core');

      expect(definition).toEqual(
        `import type { MyComponentCustomEvent } from '@ionic/core';

export declare interface MyComponent extends Components.MyComponent {

  myToggle: EventEmitter<MyComponentCustomEvent<void>>;
}`
      );
    });

    it('uses the same per-component type on the class @Output and the interface', () => {
      const classDefinition = createAngularComponentDefinition(
        'my-component',
        [],
        [],
        false,
        false,
        [],
        [primitiveEvent]
      );
      const typeDefinition = createComponentTypeDefinition('component', 'MyComponent', [primitiveEvent], '@ionic/core');

      // The runtime proxy and the type definition must agree on the emitter type.
      expect(classDefinition).toContain('@Output() myToggle = new EventEmitter<MyComponentCustomEvent<void>>();');
      expect(typeDefinition).toContain('myToggle: EventEmitter<MyComponentCustomEvent<void>>;');
    });

    it('derives the CustomEvent type name from the tag name as PascalCase', () => {
      const classDefinition = createAngularComponentDefinition(
        'my-multi-word-tag',
        [],
        [],
        false,
        false,
        [],
        [primitiveEvent]
      );

      // Same PascalCase derivation as the HTML${Pascal}Element reference.
      expect(classDefinition).toContain('protected el: HTMLMyMultiWordTagElement;');
      expect(classDefinition).toContain('new EventEmitter<MyMultiWordTagCustomEvent<void>>();');
    });
  });
});
