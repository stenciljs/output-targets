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
  MyCheckbox,
  MyRange,
  MyToggle,
  MyRadio,
} from 'component-library-react/next';
import { InputShadow, InputScoped } from './Input';
import { Fragment } from 'react/jsx-runtime';

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
  // style deduplication tests
  'style-deduplication-scoped',
  'style-no-deduplication-scoped',
  // shadow tests
  'single-no-child-shadow',
  'single-children-shadow',
  'nested-shadow',
  'complex-props-shadow',
  'prop-update-shadow',
  'input-shadow',
  'checkbox-shadow',
  // transformed tests
  'transform-scoped-to-shadow',
  'transform-tag-test',
  // individual component tests
  'my-button-scoped',
  'my-button-shadow',
  'my-checkbox-shadow',
  'my-component-shadow',
  'my-counter-shadow',
  'my-list-shadow',
  'my-range-shadow',
  'my-toggle-shadow',
] as const;
export type TestComponent = (typeof testComponents)[number];
export type ShadowComponents = Exclude<Extract<TestComponent, `${string}shadow`>, 'transform-scoped-to-shadow'>;
export type ScopedComponents = Exclude<
  Extract<TestComponent, `${string}scoped`>,
  'transform-scoped-to-shadow' | 'style-deduplication-scoped' | 'style-no-deduplication-scoped'
>;
export type TransformedComponents = Extract<
  TestComponent,
  'transform-scoped-to-shadow' | 'transform-tag-test' | 'style-deduplication-scoped' | 'style-no-deduplication-scoped'
>;
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
  if (name === 'prop-update-shadow') {
    return <MyComponent first="John" middleName="William" last="Doe" />;
  }
  if (name === 'input-scoped') {
    return <InputScoped />;
  }
  if (name === 'input-shadow') {
    return <InputShadow />;
  }
  if (name === 'checkbox-shadow') {
    return <MyCheckbox>Checkbox Label</MyCheckbox>;
  }
  if (name === 'transform-tag-test') {
    return <MyTransformTest message="Tag transformation test: should render as v1-my-transform-test" />;
  }
  if (name === 'style-deduplication-scoped') {
    return (
      <Fragment>
        <MyCounter startValue={1} />
        <MyCounter startValue={2} />
        <MyCounter startValue={3} />
        <MyButton fill="outline">Button 1</MyButton>
        <MyButton fill="solid">Button 2</MyButton>
        <MyButton fill="clear">Button 3</MyButton>
        <MyComponent first="John" middleName="A" last="Doe" />
        <MyComponent first="Jane" middleName="B" last="Smith" />
        <MyComponent first="Bob" middleName="C" last="Jones" />
        <MyRadio value="option1">Option 1</MyRadio>
        <MyRadio value="option2">Option 2</MyRadio>
        <MyRadio value="option3">Option 3</MyRadio>
      </Fragment>
    );
  }

  if (name === 'style-no-deduplication-scoped') {
    return (
      <>
        <MyCounter startValue={1} />
        <MyCounter startValue={2} />
        <MyCounter startValue={3} />
        <MyButton fill="outline">Button 1</MyButton>
        <MyButton fill="solid">Button 2</MyButton>
        <MyButton fill="clear">Button 3</MyButton>
        <MyComponent first="John" middleName="A" last="Doe" />
        <MyComponent first="Jane" middleName="B" last="Smith" />
        <MyComponent first="Bob" middleName="C" last="Jones" />
        <MyRadio value="option1">Option 1</MyRadio>
        <MyRadio value="option2">Option 2</MyRadio>
        <MyRadio value="option3">Option 3</MyRadio>
      </>
    );
  }
  if (name === 'my-button-scoped') {
    return <MyButtonScoped>Click Me</MyButtonScoped>;
  }
  if (name === 'my-button-shadow') {
    return <MyButton>Click Me</MyButton>;
  }
  if (name === 'my-checkbox-shadow') {
    return <MyCheckbox>Checkbox Label</MyCheckbox>;
  }
  if (name === 'my-component-shadow') {
    return <MyComponent first="John" middleName="William" last="Doe" />;
  }
  if (name === 'my-counter-shadow') {
    return <MyCounter startValue={10} />;
  }
  if (name === 'my-list-shadow') {
    return (
      <MyList>
        <MyListItem>Item 1 Shadow</MyListItem>
        <MyListItem>Item 2 Shadow</MyListItem>
        <MyListItem>Item 3 Shadow</MyListItem>
      </MyList>
    );
  }
  if (name === 'my-range-shadow') {
    return (
      <MyRange name="test-range" min={0} max={100} value={50}>
        Range Label
      </MyRange>
    );
  }
  if (name === 'my-toggle-shadow') {
    return <MyToggle>Toggle Content</MyToggle>;
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
