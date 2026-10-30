import { Routes } from '@angular/router';
import { ComponentTests } from './component-tests/component-tests';

export const routes: Routes = [
  {
    path: '',
    component: ComponentTests,
  },
  {
    path: 'lazy',
    loadComponent: () => import('./lazy-page/lazy-page').then((m) => m.LazyPage),
  },
];
