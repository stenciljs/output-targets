'use client';

import { MyToggle } from 'component-library-react';
import { List } from '../List/List';
import { PureReactComponent } from '../PureReactComponent/PureReactComponent';

export const ToggleableContent = () => {
  return (
    <MyToggle>
      <PureReactComponent />
      <List />
    </MyToggle>
  );
};
