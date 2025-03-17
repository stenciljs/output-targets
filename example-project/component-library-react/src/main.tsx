import React, { lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { setTagNameTransformer } from '@stencil/react-output-target/runtime';

setTagNameTransformer((tagName: string) => tagName + '-modified');
const App = lazy(() => import('./App'));

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
