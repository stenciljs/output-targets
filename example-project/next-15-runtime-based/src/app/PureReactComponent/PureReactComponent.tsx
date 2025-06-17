'use client';

import { useState } from 'react';

export const PureReactComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <div
      style={{
        padding: '1rem',
        border: '1px solid black',
        borderRadius: '0.5rem',
        margin: '1rem',
      }}
    >
      <p style={{ marginBottom: '0.5rem' }}>Pure React Component</p>
      <button
        style={{
          border: '1px solid black',
          padding: '0.5rem',
          borderRadius: '0.5rem',
        }}
        onClick={() => setCount(count + 1)}
      >
        Click me (Clicked: {count})
      </button>
    </div>
  );
};
