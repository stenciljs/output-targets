import { lazy } from 'react';

export const LazyComponent = lazy(() =>
  import('./LazyLoadedComponent').then((module) => ({
    default: module.LazyLoadedComponent,
  }))
);
