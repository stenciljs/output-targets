'use client';

import { useState } from 'react';
import { MyButton, MyComponent } from 'component-library-react/next';

function ReactContent({ label }: { label: string }) {
  return (
    <>
      <span title="returned">{label}</span>
      <b> inner</b>
    </>
  );
}

export default function ScopedSsrChildren() {
  const [label, setLabel] = useState('Initial text');

  return (
    <>
      <section id="scoped-ssr-children">
        <MyButton>
          <MyComponent first="John" middleName="William" last="Doe" /> {label}
        </MyButton>
      </section>
      <section id="scoped-react-children">
        <MyButton>
          <ReactContent label={label} />
        </MyButton>
      </section>
      <button id="update-label" onClick={() => setLabel('Updated text')}>
        Update label
      </button>
    </>
  );
}
