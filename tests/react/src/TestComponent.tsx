import { MyComponent, MyComponentScoped, MyButton, MyButtonScoped, MyList, MyListItem, MyListScoped, MyListItemScoped } from 'component-library-react';

const testComponents = [
  // scoped tests
  'single-no-child-scoped', 'single-children-scoped',
  'nested-scoped',
  // shadow tests
  'single-no-child-shadow', 'single-children-shadow',
  'nested-shadow'
] as const;
export type TestComponent = typeof testComponents[number];
export type ShadowComponents = Extract<TestComponent, `${string}shadow`>;
export type ScopedComponents = Extract<TestComponent, `${string}scoped`>;
interface TestComponentProps {
  name: TestComponent;
}

export const TestStage = ({ name }: TestComponentProps) => {
  return <div id={name}>
    <TestComponent name={name} />
  </div>
}

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
    return <MyList>
      <MyListItem>Foo Shadow</MyListItem>
      <MyListItem>Bar Shadow</MyListItem>
      <MyListItem>Loo Shadow</MyListItem>
    </MyList>
  }
  if (name === 'nested-scoped') {
    return <MyListScoped>
      <MyListItemScoped>Foo Scoped</MyListItemScoped>
      <MyListItemScoped>Bar Scoped</MyListItemScoped>
      <MyListItemScoped>Loo Scoped</MyListItemScoped>
    </MyListScoped>
  }

  return <div>
    Unknown test component:
    <pre style={{ display: 'block', fontSize: '12px' }}>"{name}"</pre>
    Available test components:
    <pre style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>{testComponents.map(component => (
      <a href={`/${component}`}>{component}</a>
    ))}</pre>
  </div>;
};

