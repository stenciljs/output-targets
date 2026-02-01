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
} from 'component-library-react';
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
