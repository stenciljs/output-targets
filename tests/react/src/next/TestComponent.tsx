'use client';

import {
  MyComponent,
  MyComponentScoped,
  MyButton,
  MyButtonScoped,
  MyList,
  MyListItem,
  MyListScoped,
  MyListItemScoped,
  MyCounter,
  MyComplexProps,
  MyComplexPropsScoped,
  MyTransformTest,
  MyDataTable,
  MyRange,
  MyToggle,
  MyToggleContent,
  MyPopover,
  MyRadioGroup,
  MyRadio,
  MyTooltip,
  MyCheckbox,
} from 'component-library-react/next';
import { InputShadow, InputScoped } from './Input';

/**
 * A list of all test components that are available to be
 * used in the test scenarios. If you want to add a new test,
 * add the component to this list and create a new test scenario.
 */
const testComponents = [
  // scoped tests
  'single-no-child-scoped',
  'single-children-scoped',
  'nested-scoped',
  'complex-props-scoped',
  'input-scoped',
  'my-popover',
  'my-radio-group',
  // shadow tests
  'single-no-child-shadow',
  'single-children-shadow',
  'nested-shadow',
  'complex-props-shadow',
  'input-shadow',
  'my-component',
  'my-list',
  'my-counter',
  'my-range',
  'my-toggle',
  'my-toggle-content',
  'my-data-table',
  'my-tooltip',
  'my-checkbox',
  // transformed tests
  'transform-scoped-to-shadow',
  'transform-tag-test',
] as const;
export type TestComponent = (typeof testComponents)[number];
export type ShadowComponents = Exclude<Extract<TestComponent, `${string}shadow` | 'my-component' | 'my-list' | 'my-counter' | 'my-range' | 'my-toggle' | 'my-toggle-content' | 'my-data-table' | 'my-tooltip' | 'my-checkbox'>, 'transform-scoped-to-shadow'>;
export type ScopedComponents = Exclude<Extract<TestComponent, `${string}scoped` | 'my-popover' | 'my-radio-group'>, 'transform-scoped-to-shadow'>;
export type TransformedComponents = Extract<TestComponent, 'transform-scoped-to-shadow' | 'transform-tag-test'>;
interface TestComponentProps {
  name: TestComponent;
}

export const TestStage = ({ name }: TestComponentProps) => {
  return (
    <div id={name}>
      <TestComponent name={name} />
    </div>
  );
};

const TestComponent = ({ name }: TestComponentProps) => {
  if (name === 'single-no-child-shadow') {
    return <MyComponent first="John" middleName="William" last="Doe" />;
  }
  if (name === 'single-no-child-scoped') {
    return <MyComponentScoped first="John" middleName="William" last="Doe" />;
  }
  if (name === 'single-children-shadow') {
    return <MyButton fill="outline">Test</MyButton>;
  }
  if (name === 'single-children-scoped') {
    return <MyButtonScoped fill="outline">Test</MyButtonScoped>;
  }
  if (name === 'nested-shadow') {
    return (
      <MyList>
        <MyListItem>Foo Shadow</MyListItem>
        <MyListItem>Bar Shadow</MyListItem>
        <MyListItem>Loo Shadow</MyListItem>
      </MyList>
    );
  }
  if (name === 'nested-scoped') {
    return (
      <MyListScoped>
        <MyListItemScoped>Foo Scoped</MyListItemScoped>
        <MyListItemScoped>Bar Scoped</MyListItemScoped>
        <MyListItemScoped>Loo Scoped</MyListItemScoped>
      </MyListScoped>
    );
  }
  if (name === 'transform-scoped-to-shadow') {
    return <MyCounter startValue={42} />;
  }
  if (name === 'complex-props-shadow') {
    return (
      <MyComplexProps
        foo={{ bar: 'baz', loo: [1, 2, 3], qux: { quux: Symbol('quux') } }}
        baz={new Map([['foo', { qux: Symbol('quux') }]])}
        quux={new Set(['foo', 'bar', 'baz'])}
        grault={Infinity}
        waldo={null}
      />
    );
  }
  if (name === 'complex-props-scoped') {
    return (
      <MyComplexPropsScoped
        foo={{ bar: 'baz', loo: [1, 2, 3], qux: { quux: Symbol('quux') } }}
        baz={new Map([['foo', { qux: Symbol('quux') }]])}
        quux={new Set(['foo', 'bar', 'baz'])}
        grault={Infinity}
        waldo={null}
      />
    );
  }
  if (name === 'input-scoped') {
    return <InputScoped />;
  }
  if (name === 'input-shadow') {
    return <InputShadow />;
  }
  if (name === 'transform-tag-test') {
    return <MyTransformTest message="Tag transformation test: should render as v1-my-transform-test" />;
  }
  if (name === 'my-component') {
    return <MyComponent first="Stencil" middleName="'Don't call me a framework' JS" last="Component" className="my-8" />;
  }
  if (name === 'my-list') {
    return (
      <MyList>
        <MyListItem>Item 1 Shadow</MyListItem>
        <MyListItem>Item 2 Shadow</MyListItem>
        <MyListItem>Item 3 Shadow</MyListItem>
      </MyList>
    );
  }
  if (name === 'my-counter') {
    return <MyCounter startValue={0} />;
  }
  if (name === 'my-range') {
    return <MyRange name="myRange">Hello World</MyRange>;
  }
  if (name === 'my-toggle') {
    return (
      <MyToggle>
        <div>Toggleable content</div>
      </MyToggle>
    );
  }
  if (name === 'my-toggle-content') {
    return (
      <MyToggleContent visible={true}>
        <div>Toggle content visible</div>
      </MyToggleContent>
    );
  }
  if (name === 'my-data-table') {
    const columns = [
      { id: 'name', label: 'Name', width: 200 },
      { id: 'email', label: 'Email', width: 250 },
      { id: 'role', label: 'Role', width: 150 },
      { id: 'status', label: 'Status', width: 120 },
    ];
    const data = [
      { id: '1', name: 'Alice Johnson', email: 'alice@example.com', role: 'Engineer', status: 'Active' },
      { id: '2', name: 'Bob Smith', email: 'bob@example.com', role: 'Designer', status: 'Active' },
      { id: '3', name: 'Carol Williams', email: 'carol@example.com', role: 'Manager', status: 'Active' },
      { id: '4', name: 'David Brown', email: 'david@example.com', role: 'Engineer', status: 'Inactive' },
      { id: '5', name: 'Eve Davis', email: 'eve@example.com', role: 'Designer', status: 'Active' },
    ];
    const initialColumnWidths = {
      name: 220,
      email: 260,
      role: 150,
      status: 120,
    };
    return <MyDataTable columns={columns} data={data} initialColumnWidths={initialColumnWidths} reorderColumns={true} />;
  }
  if (name === 'my-popover') {
    return (
      <MyPopover>
        <div slot="trigger">
          <button>Click me</button>
        </div>
        <div slot="content">
          <p>This is the popover content</p>
        </div>
      </MyPopover>
    );
  }
  if (name === 'my-radio-group') {
    return (
      <MyRadioGroup name="myRadio" value="foo">
        <MyRadio value="foo">Foo</MyRadio>
        <MyRadio value="bar">Bar</MyRadio>
        <MyRadio value="baz">Baz</MyRadio>
      </MyRadioGroup>
    );
  }
  if (name === 'my-tooltip') {
    return (
      <MyTooltip heading="Information" placement="top">
        This is the tooltip content
      </MyTooltip>
    );
  }
  if (name === 'my-checkbox') {
    return <MyCheckbox />;
  }

  return (
    <div>
      Unknown test component:
      <pre style={{ display: 'block', fontSize: '12px' }}>"{name}"</pre>
      Available test components:
      <pre style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
        {testComponents.map((component) => (
          <a href={`/${component}`}>{component}</a>
        ))}
      </pre>
    </div>
  );
};
