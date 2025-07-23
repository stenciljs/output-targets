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
  @Output() myOutput = new EventEmitter<CustomEvent<any>>();
  @Output() myOtherOutput = new EventEmitter<CustomEvent<any>>();
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
  @Output() myOutput = new EventEmitter<CustomEvent<any>>();
  @Output() myOtherOutput = new EventEmitter<CustomEvent<any>>();
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
        `import type { MyEvent as IMyComponentMyEvent } from '@ionic/core';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core';
import type { MyDoclessEvent as IMyComponentMyDoclessEvent } from '@ionic/core';
import type { MyKebabEvent as IMyComponentMyKebabEvent } from '@ionic/core';
import type { MySlashEvent as IMyComponentMySlashEvent } from '@ionic/core';
import type { IMyComponent as IMyComponentIMyComponent } from '@ionic/core';

export declare interface MyComponent extends Components.MyComponent {
  /**
   * This is an example event. @Foo Bar
   */
  myEvent: EventEmitter<CustomEvent<IMyComponentMyEvent>>;
  /**
   * This is the other event.
   */
  myOtherEvent: EventEmitter<CustomEvent<IMyComponentMyOtherEvent>>;

  myDoclessEvent: EventEmitter<CustomEvent<IMyComponentMyDoclessEvent>>;

  'my-kebab-event': EventEmitter<CustomEvent<IMyComponentMyKebabEvent>>;

  'my/slash/event': EventEmitter<CustomEvent<IMyComponentMySlashEvent>>;
  /**
   * Testing an event type with a dot signature
   */
  myCustomEvent: EventEmitter<CustomEvent<IMyComponentIMyComponent.someVar>>;
  /**
   * Testing with nested namespaces
   */
  myCustomNestedEvent: EventEmitter<CustomEvent<IMyComponentIMyComponent.SomeMoreComplexType.SubType>>;
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
        `import type { MyEvent as IMyComponentMyEvent } from '@ionic/core';
import type { Currency as IMyComponentCurrency } from '@ionic/core';
import type { Side as IMyComponentSide } from '@ionic/core';

export declare interface MyComponent extends Components.MyComponent {

  myChange: EventEmitter<CustomEvent<IMyComponentMyEvent<IMyComponentCurrency>>>;

  mySwipe: EventEmitter<CustomEvent<{ side: IMyComponentSide }>>;
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
          `import type { MyEvent as IMyComponentMyEvent } from '@ionic/core/custom-elements';
import type { MyOtherEvent as IMyComponentMyOtherEvent } from '@ionic/core/custom-elements';
import type { MyDoclessEvent as IMyComponentMyDoclessEvent } from '@ionic/core/custom-elements';
import type { MyKebabEvent as IMyComponentMyKebabEvent } from '@ionic/core/custom-elements';
import type { MySlashEvent as IMyComponentMySlashEvent } from '@ionic/core/custom-elements';
import type { IMyComponent as IMyComponentIMyComponent } from '@ionic/core/custom-elements';

export declare interface MyComponent extends Components.MyComponent {
  /**
   * This is an example event. @Foo Bar
   */
  myEvent: EventEmitter<CustomEvent<IMyComponentMyEvent>>;
  /**
   * This is the other event.
   */
  myOtherEvent: EventEmitter<CustomEvent<IMyComponentMyOtherEvent>>;

  myDoclessEvent: EventEmitter<CustomEvent<IMyComponentMyDoclessEvent>>;

  'my-kebab-event': EventEmitter<CustomEvent<IMyComponentMyKebabEvent>>;

  'my/slash/event': EventEmitter<CustomEvent<IMyComponentMySlashEvent>>;
  /**
   * Testing an event type with a dot signature
   */
  myCustomEvent: EventEmitter<CustomEvent<IMyComponentIMyComponent.someVar>>;
  /**
   * Testing with nested namespaces
   */
  myCustomNestedEvent: EventEmitter<CustomEvent<IMyComponentIMyComponent.SomeMoreComplexType.SubType>>;
}`
        );
      });
    });
  });
});
