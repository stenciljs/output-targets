'use client';

import { useContext, useState } from 'react';
import { ThemeContext } from '../ThemeContext/ThemeContext';

export const LazyLoadedComponent = () => {
  const [state, setState] = useState(0);
  const theme = useContext(ThemeContext);

  return (
    <div
      style={{
        border: '1px red solid',
        padding: '1rem',
        margin: '1rem',
        borderRadius: '0.5rem',
      }}
    >
      <p style={{ marginBottom: '0.5rem' }}>
        LazyLoadedComponent with theme: {theme}
      </p>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
        <button
          style={{
            border: '1px solid black',
            padding: '0.5rem',
            borderRadius: '0.5rem',
          }}
          onClick={() => setState(state - 1)}
        >
          -
        </button>
        <span>{state}</span>
        <button
          style={{
            border: '1px solid black',
            padding: '0.5rem',
            borderRadius: '0.5rem',
          }}
          onClick={() => setState(state + 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};
