'use client';

import { MyToggle } from 'component-library-react/next';
import { List } from '../List/List';
import { PureReactComponent } from '../PureReactComponent/PureReactComponent';

export const ToggleableContent = () => {
  return (
    <MyToggle>
      <PureReactComponent key={1} />
      <List key={2} />
    </MyToggle>
  );
};
