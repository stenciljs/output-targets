import {
  MyButton,
  MyComponent,
  MyCounter,
  MyRadio,
} from 'component-library-react/next';

export default function DedupTest() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Scoped Components Style Deduplication Test</h1>
      <p>
        This page renders multiple instances of scoped components to demonstrate
        style deduplication.
      </p>

      <hr style={{ margin: '2rem 0' }} />

      <section style={{ marginBottom: '3rem' }}>
        <h2>MyCounter (5 instances)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MyCounter startValue={0} />
          <MyCounter startValue={1} />
          <MyCounter startValue={2} />
          <MyCounter startValue={3} />
          <MyCounter startValue={4} />
        </div>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section style={{ marginBottom: '3rem' }}>
        <h2>MyButton (5 instances)</h2>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <MyButton>Button 1</MyButton>
          <MyButton>Button 2</MyButton>
          <MyButton>Button 3</MyButton>
          <MyButton>Button 4</MyButton>
          <MyButton>Button 5</MyButton>
        </div>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section style={{ marginBottom: '3rem' }}>
        <h2>MyComponent (5 instances)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MyComponent first="Component" last="One" />
          <MyComponent first="Component" last="Two" />
          <MyComponent first="Component" last="Three" />
          <MyComponent first="Component" last="Four" />
          <MyComponent first="Component" last="Five" />
        </div>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section style={{ marginBottom: '3rem' }}>
        <h2>MyRadio (5 instances)</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MyRadio value="option1">Option 1</MyRadio>
          <MyRadio value="option2">Option 2</MyRadio>
          <MyRadio value="option3">Option 3</MyRadio>
          <MyRadio value="option4">Option 4</MyRadio>
          <MyRadio value="option5">Option 5</MyRadio>
        </div>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <section style={{ marginBottom: '3rem' }}>
        <h2>Mixed Components</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <MyCounter startValue={10} />
          <MyButton>Mixed Button</MyButton>
          <MyComponent first="Mixed" last="Component" />
          <MyRadio value="mixed">Mixed Radio</MyRadio>
          <MyCounter startValue={20} />
        </div>
      </section>

      <hr style={{ margin: '2rem 0' }} />

      <p>
        <em>
          Right-click → &ldquo;View Page Source&rdquo; or disable JS to see the
          styles in the SSR&apos;d HTML!
        </em>
      </p>
      <p>
        <strong>Check:</strong> Each component type should have its styles
        deduplicated (one style tag per component type, not per instance).
      </p>
    </div>
  );
}
