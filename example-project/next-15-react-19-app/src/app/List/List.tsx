'use client';

import { MyList, MyListItem } from 'component-library-react';
import { LazyComponent } from '../LazyComponent/LazyComponent';
import { ThemeContext } from '../ThemeContext/ThemeContext';

export const List = () => {
  const theme = 'light';

  return (
    // @ts-ignore: Because component-library-react is linked and contains a node_modules folder, with a different @types/react version, TypeScript will throw an error.
    <ThemeContext.Provider value={theme}>
      {/* @ts-ignore: Because component-library-react is linked and contains a node_modules folder, with a different @types/react version, TypeScript will throw an error. */}
      <LazyComponent />
      <MyList>
        <MyListItem key={1}>Item 1</MyListItem>
        <MyListItem key={2}>Item 2</MyListItem>
        <MyListItem key={3}>Item 3</MyListItem>
      </MyList>
    </ThemeContext.Provider>
  );
};
